const joi = require("joi");

exports.registerSchema = joi.object({
  username: joi.string().min(3).max(30).required(),
  email: joi
    .string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .required(),
  phoneNumber: joi.string().pattern(new RegExp("^[0-9]{10,15}$")).required(), // Assuming valid phone numbers
  password: joi.string().min(6).required(),
  confirm_password: joi.valid(joi.ref("password")).required().messages({
    "any.only": "Passwords must match",
  }),
  location: joi
    .object({
      latitude: joi.number().optional(),
      longitude: joi.number().optional(),
    })
    .optional(),
  expoPushToken: joi.string().optional(), // Token is optional
});
