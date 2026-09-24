/*
|--------------------------------------------------------------------------
| Pagination Helpers
|--------------------------------------------------------------------------
| Usage:
|   const { page, limit, skip } = getPagination(req.query);
|   const total = await Notice.countDocuments(filter);
|   const items = await Notice.find(filter).skip(skip).limit(limit);
|   pagination: getPaginationMeta(total, page, limit)
*/

const getPagination = (
  query = {},
  { defaultLimit = 10, maxLimit = 50 } = {}
) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);

  const limit = Math.min(
    Math.max(parseInt(query.limit, 10) || defaultLimit, 1),
    maxLimit
  );

  return { page, limit, skip: (page - 1) * limit };
};

const getPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

module.exports = { getPagination, getPaginationMeta };