const Joi = require("@hapi/joi");

const registerValidation = (reqBody) => {
  const schema = Joi.object({
    first_name: Joi.string().min(6).required(),
    last_name: Joi.string().min(6).required(),
    email_id: Joi.string().min(6).required().email(),
    phone_no: Joi.string().min(6).required(),
    password: Joi.string().min(6).required(),
  });

  return schema.validate(reqBody);
};

const loginValidation = (reqBody) => {
  const schema = Joi.object({
    email_id: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required(),
  });

  return schema.validate(reqBody);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
