const { Order, OrderItem, Product, sequelize, Customer } = require('../models');
const { scheduleStatusUpdateJob } = require('../bull/jobs/statusUpdateJob');
const redisClient = require('../utils/redisClient'); 
const paginate = require('../utils/paginate');
const sendPaginatedResponse = require('../utils/sendPaginatedResponse');
const { invalidateOrderCache } = require('../utils/cacheHelpers');

const createOrder = async (req, res) => {
  const { items } = req.body;
  const customer_id = req.customer.id;

  try {
    const result = await sequelize.transaction(async (t) => {
      let total = 0;
      const productIds = items.map(item => item.product_id);
      const products = await Product.findAll({ where: { id: productIds } });

      for (const item of items) {
        const product = products.find(p => p.id === item.product_id);
        if (!product) {
          throw new Error(`Product with ID ${item.product_id} not found.`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Product "${product.name}" is out of stock. Try ordering available items only.`);
        }
      }

      const order = await Order.create({
        customer_id,
        total_price: 0,
        status: 'pending'
      }, { transaction: t });

      for (const item of items) {
        const product = products.find(p => p.id === item.product_id);
        const lineTotal = product.price * item.quantity;
        total += lineTotal;

        await OrderItem.create({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: product.price
        }, { transaction: t });

        await product.decrement('stock', { by: item.quantity, transaction: t });
      }

      await order.update({ total_price: total }, { transaction: t });

      t.afterCommit(() => {
        scheduleStatusUpdateJob(order.id, 'pending');
      });

      return order;
    });

    res.status(201).json({ message: 'Order placed successfully', order: result });

  } catch (error) {
    console.error('❌ Order creation failed:', error);
    res.status(500).json({ error: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    if (!req.customer) {
      return res.status(401).json({ error: 'Unauthorized: No customer attached' });
    }

    const { limit, offset, page } = paginate(req);

    const { count, rows } = await Order.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        { model: Customer, as: 'customer' },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        }
      ],
    });

    return sendPaginatedResponse(res, 'data', rows, count, limit, page);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders', details: err.message });
  }
};

const getOrdersByStatus = async (req, res) => {
  const { status } = req.params;

  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status: '${status}'` });
  }

  try {
    const { limit, offset, page } = paginate(req);

    const { count, rows } = await Order.findAndCountAll({
      where: {
        customer_id: req.customer.id,
        status,
        deleted_at: null
      },
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        { model: Customer, as: 'customer', attributes: ['id', 'name', 'email'] },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price'] }]
        }
      ],
    });

    return sendPaginatedResponse(res, 'orders', rows, count, limit, page);
  } catch (err) {
    console.error('❌ Error fetching orders by status:', err);
    res.status(500).json({ error: 'Server error while fetching orders by status' });
  }
};

const getOrderById = async (req, res) => {
  const orderId = req.params.id;
  const customerId = req.customer.id;
  const cacheKey = `order:${orderId}`;

  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log(`📦 Redis cache HIT for ${cacheKey}`);
      const parsed = JSON.parse(cached);
      if (parsed.customer_id !== customerId) {
        return res.status(403).json({ error: 'Access denied: Not your order' });
      }
      return res.status(200).json(parsed);
    }

    console.log(`🚫 Redis cache MISS for ${cacheKey}, fetching from DB`);

    const order = await Order.findOne({
      where: { id: orderId },
      include: [
        { model: Customer, as: 'customer' },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        }
      ]
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.customer_id !== customerId) {
      return res.status(403).json({ error: 'Access denied: Not your order' });
    }

    const result = order.toJSON();

    await redisClient.set(cacheKey, JSON.stringify(result), {
      EX: 300,
    });

    console.log(`✅ Cached order in Redis as ${cacheKey} (expires in 300s)`);

    res.status(200).json(result);

  } catch (err) {
    console.error('❌ Error in getOrderById:', err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

const getOrdersByCustomer = async (req, res) => {
  const customerId = req.params.id;

  if (+req.customer.id !== +customerId) {
    return res.status(403).json({ error: 'Access denied: Not your data' });
  }

  try {
    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const { limit, offset, page } = paginate(req);

    const { count, rows } = await Order.findAndCountAll({
      where: { customer_id: customerId },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: { model: Product, as: 'product', attributes: ['id', 'name', 'price'] }
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return sendPaginatedResponse(res, 'orders', rows, count, limit, page);
  } catch (error) {
    console.error('❌ Get Orders by Customer error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateOrder = async (req, res) => {
  const { id } = req.params;
  const customer_id = req.customer.id;
  const { status } = req.body;

  try {
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.customer_id !== customer_id) {
      return res.status(403).json({ error: 'Access denied: Not your order' });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({ error: 'Delivered orders cannot be updated' });
    }

    if (status && !['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    order.status = status || order.status;
    await order.save();
    res.status(200).json({ message: 'Order updated successfully', order });
  } catch (error) {
    console.error('❌ Error updating order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const patchOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({ error: 'Delivered orders cannot be modified' });
    }

    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ message: `Order status updated to '${status}'`, order });
  } catch (error) {
    console.error('❌ Error patching order status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const softDeleteOrder = async (req, res) => {
  const { id } = req.params;
  const transaction = await sequelize.transaction();

  try {
    const order = await Order.findByPk(id, {
      include: { model: OrderItem, as: 'items' },
      transaction
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status === 'delivered') {
      await transaction.rollback();
      return res.status(400).json({ error: 'Delivered orders cannot be deleted.' });
    }

    for (const item of order.items) {
      await Product.increment(
        { stock: item.quantity },
        { where: { id: item.product_id }, transaction }
      );
    }

    await order.update({ status: 'cancelled' }, { transaction });
    await order.destroy({ transaction });

    // await invalidateOrderCache(order.id);
    await transaction.commit();
    res.status(200).json({ message: 'Order soft-deleted and stock restored' });

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error soft-deleting order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const restoreOrder = async (req, res) => {
  const { id } = req.params;
  const transaction = await sequelize.transaction();

  try {
    const order = await Order.findByPk(id, {
      include: { model: OrderItem, as: 'items' },
      paranoid: false,
      transaction,
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Order not found' });
    }

    if (!order.deletedAt) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Order is not deleted' });
    }

    await order.restore({ transaction });

    for (const item of order.items) {
      await item.restore({ transaction });
    }

    // await invalidateOrderCache(order.id);
    await order.update({ status: 'pending' }, { transaction });

    for (const item of order.items) {
      await Product.decrement(
        { stock: item.quantity },
        { where: { id: item.product_id }, transaction }
      );
    }

    await transaction.commit();
    scheduleStatusUpdateJob(order.id);

    res.status(200).json({ message: 'Order restored and status updates re-scheduled.', order });

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error restoring order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createOrder,
  getOrdersByCustomer,
  getAllOrders,
  getOrderById,
  getOrdersByStatus,
  updateOrder,
  patchOrderStatus,
  softDeleteOrder,
  restoreOrder
};
