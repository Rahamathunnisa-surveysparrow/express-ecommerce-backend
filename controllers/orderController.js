const { Order, OrderItem, Product, sequelize, Customer } = require('../models');
const { validationResult } = require('express-validator');

const createOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { customer_id, items } = req.body;

  if (!customer_id || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Missing customer or items" });
  }

  const t = await sequelize.transaction();

  try {
    const total = items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    const order = await Order.create(
      {
        customer_id,
        total_amount: total
      },
      { transaction: t }
    );

    const itemsToCreate = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price
    }));

    await OrderItem.bulkCreate(itemsToCreate, { transaction: t });

    await t.commit();

    res.status(201).json({
      message: "Order created successfully",
      order_id: order.id,
      total: order.total_amount,
      items: itemsToCreate
    });

  } catch (err) {
    await t.rollback();
    console.error("Order creation error:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
};

const getOrdersByCustomer = async (req, res) => {
  const customerId = req.params.id;

  try {
    const orders = await Order.findAll({
      where: { customer_id: customerId }, // Only for that customer
      include: [
        {
          model: OrderItem, // Get order items inside each order
          include: [
            {
              model: Product, // For each item, get product details
              attributes: ['name', 'price'] // Limit to just name & price
            }
          ]
        }
      ],
      order: [["created_at", "DESC"]]
    });

    res.json(orders);
  } catch (err) {
    console.error("Error fetching customer orders:", err);
    res.status(500).json({ error: "Failed to fetch customer orders" });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: Customer,
          attributes: ['id', 'name', 'email']
        },
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'price']
            }
          ]
        }
      ]
    });

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteOrder = async (req, res) => {
  const orderId = req.params.id;

  try {
    // First delete related order items
    await OrderItem.destroy({ where: { order_id: orderId } });

    // Then delete the order itself
    const deleted = await Order.destroy({ where: { id: orderId } });

    if (deleted === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Server error while deleting order" });
  }
};

module.exports = {
  createOrder,
  getOrdersByCustomer,
  getAllOrders,
  deleteOrder
};

