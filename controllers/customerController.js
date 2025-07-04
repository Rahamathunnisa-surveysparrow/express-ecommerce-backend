const { Customer } = require('../models');
const paginate = require('../utils/paginate');

// ✅ Get all customers (admin only or internal usage)
const getAllCustomers = async (req, res) => {
  try {
    // Optionally restrict to admins only
    // if (!req.customer || !req.customer.isAdmin) return res.status(403).json({ error: 'Forbidden' });

    const { limit, offset, page } = paginate(req);
    const { count, rows } = await Customer.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      data: rows,
      pagination: {
        currentPage: page,
        totalPages,
        perPage: limit,
        totalItems: count,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customers', details: err.message });
  }
};

// ✅ Get single customer by ID (only owner can view)
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const requestingCustomerId = req.customer.id;

    if (parseInt(id) !== requestingCustomerId) {
      return res.status(403).json({ error: 'Access denied: You can only view your own profile' });
    }

    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found with that ID' });
    }

    res.status(200).json(customer);
  } catch (err) {
    console.error("❌ Error fetching customer:", err);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
};

// ✅ Full update (PUT)
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const requestingCustomerId = req.customer.id;

    if (parseInt(id) !== requestingCustomerId) {
      return res.status(403).json({ error: 'Access denied: You can only update your own profile' });
    }

    const { name, email, password } = req.body;
    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    await customer.update({ name, email, password });
    res.status(200).json({ message: 'Customer details updated successfully', customer });
  } catch (err) {
    console.error("❌ Error updating customer:", err);
    res.status(500).json({ error: 'Failed to update customer' });
  }
};

// ✅ Partial update (PATCH)
const patchCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const requestingCustomerId = req.customer.id;

    if (parseInt(id) !== requestingCustomerId) {
      return res.status(403).json({ error: 'Access denied: You can only patch your own profile' });
    }

    const updates = req.body;
    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    await customer.update(updates);
    res.status(200).json({ message: 'Customer details updated!', customer });
  } catch (err) {
    console.error("❌ Error patching customer:", err);
    res.status(500).json({ error: 'Failed to update customer' });
  }
};

// ✅ Soft delete customer (only self)
const softDeleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const requestingCustomerId = req.customer.id;

    if (parseInt(id) !== requestingCustomerId) {
      return res.status(403).json({ error: 'Access denied: You can only delete your own account' });
    }

    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    await customer.destroy(); // Hooks will check for undelivered orders
    res.status(200).json({ message: 'Customer soft-deleted successfully' });
  } catch (err) {
    console.error("❌ Error deleting customer:", err);
    res.status(500).json({ error: err.message || 'Failed to delete customer' });
  }
};

// ✅ Restore soft-deleted customer (only self)
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
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  patchCustomer,
  softDeleteCustomer,
  restoreCustomer
};
