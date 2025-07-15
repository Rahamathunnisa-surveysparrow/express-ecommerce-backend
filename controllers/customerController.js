const { Customer, Order } = require('../models');
const paginate = require('../utils/paginate');
const sendPaginatedResponse = require('../utils/sendPaginatedResponse');

// Get one customer (by ID)
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    if (+req.customer.id !== +id) {
      return res.status(403).json({ error: 'Access denied: Not your data' });
    }

    const customer = await Customer.findByPk(id, {
      attributes: { exclude: ['password'] },
    });

    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    res.json(customer);
  } catch (error) {
    console.error('❌ Error fetching customer by ID:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
};

// Get all customers (paginated)
const getAllCustomers = async (req, res) => {
  try {
    const { limit, offset, page } = paginate(req);

    const { count, rows } = await Customer.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] },
    });

    return sendPaginatedResponse(res, 'customers', rows, count, limit, page);
  } catch (error) {
    console.error('❌ Error fetching customers:', error);
    return res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

// Update a customer (full update)
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    if (+req.customer.id !== +id) {
      return res.status(403).json({ error: 'Access denied: Not your data' });
    }

    const customer = await Customer.findByPk(id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const { name, email, password } = req.body;

    await customer.update({ name, email, password });
    res.json({ message: 'Customer updated', customer });
  } catch (error) {
    console.error('❌ Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
};

// Partial update (PATCH)
const patchCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    if (+req.customer.id !== +id) {
      return res.status(403).json({ error: 'Access denied: Not your data' });
    }

    const customer = await Customer.findByPk(id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const updates = req.body;
    await customer.update(updates);

    res.json({ message: 'Customer partially updated', customer });
  } catch (error) {
    console.error('❌ Error patching customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
};

// Delete customer (only if no undelivered orders)
const softDeleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    if (+req.customer.id !== +id) {
      return res.status(403).json({ error: 'Access denied: Not your data' });
    }

    const customer = await Customer.findByPk(id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const undeliveredOrders = await Order.count({
      where: {
        customer_id: id,
        status: { [Op.not]: 'delivered' },
        deleted_at: null
      }
    });

    if (undeliveredOrders > 0) {
      return res.status(400).json({ error: 'Customer has undelivered orders and cannot be deleted' });
    }

    await customer.destroy();
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
};

// Restore soft-deleted customer (only self)
const restoreCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const requestingCustomerId = req.customer.id;

    if (parseInt(id) !== requestingCustomerId) {
      return res.status(403).json({ error: 'Access denied: You can only restore your own account' });
    }

    const customer = await Customer.findByPk(id, { paranoid: false });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    await customer.restore();
    res.status(200).json({ message: 'Customer restored successfully', customer });
  } catch (err) {
    console.error("❌ Error restoring customer:", err);
    res.status(500).json({ error: 'Failed to restore customer' });
  }
};

module.exports = {
  getCustomerById,
  getAllCustomers,
  updateCustomer,
  patchCustomer,
  softDeleteCustomer,
  restoreCustomer,
};
