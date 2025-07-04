module.exports = (req) => {

  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 5;

  if (page < 1) page = 1;

  const offset = (page - 1) * limit;
  
  return { limit, offset, page };
};
