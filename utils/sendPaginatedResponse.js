// utils/sendPaginatedResponse.js
module.exports = function sendPaginatedResponse(res, dataKey, dataRows, totalCount, limit, page) {
  const totalPages = Math.ceil(totalCount / limit);

  return res.status(200).json({
    [dataKey]: dataRows,
    pagination: {
      totalItems: totalCount,
      currentPage: page,
      totalPages,
      perPage: limit
    }
  });
};
