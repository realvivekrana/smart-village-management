/*
|--------------------------------------------------------------------------
| Success Response Helper
|--------------------------------------------------------------------------
| Sab controllers ka response shape ek jaisa rahega:
| { success, message, data, pagination }
*/

const sendSuccess = (
  res,
  { statusCode = 200, message = "Success", data, pagination } = {}
) => {
  const body = { success: true, message };

  if (data !== undefined) body.data = data;
  if (pagination !== undefined) body.pagination = pagination;

  return res.status(statusCode).json(body);
};

module.exports = { sendSuccess };