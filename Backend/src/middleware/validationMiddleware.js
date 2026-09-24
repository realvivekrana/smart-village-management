const { validationResult } = require("express-validator");

/*
|--------------------------------------------------------------------------
| validate
|--------------------------------------------------------------------------
| Validator array ke BAAD lagana:
|
|   router.post("/register", registerValidator, validate, register);
*/

const validate = (req, res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const errors = result
    .array({ onlyFirstError: true })
    .map((error) => ({
      field: error.path,
      message: error.msg,
    }));

  return res.status(400).json({
    success: false,
    message: errors[0].message,
    errors,
  });
};

module.exports = validate;