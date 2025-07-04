const jwt = require('jsonwebtoken');
const { Customer } = require('../models');

const authenticateCustomer = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization Failed! Invalid token / Missing token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Re-fetch the customer from DB if needed
    const customer = await Customer.findByPk(decoded.id);
    if (!customer) {
      return res.status(401).json({ error: 'Customer not found' });
    }

    req.customer = customer; // Make customer available in controller
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authenticateCustomer;
