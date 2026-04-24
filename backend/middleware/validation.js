const { body, validationResult } = require('express-validator');

const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    const sanitize = (obj) => {
      for (const key of Object.keys(obj)) {
        if (typeof obj[key] === 'string') obj[key] = obj[key].replace(/<script[^>]*>.*?<\/script>/gi, '').trim();
        else if (typeof obj[key] === 'object' && obj[key]) sanitize(obj[key]);
      }
    };
    sanitize(req.body);
  }
  next();
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  validate
];

const registerValidation = [
  body('name').trim().isLength({ min: 2 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  validate
];

const passwordResetRequestValidation = [body('email').isEmail().normalizeEmail(), validate];
const passwordResetValidation = [body('token').notEmpty(), body('password').isLength({ min: 8 }), validate];
const changePasswordValidation = [body('currentPassword').notEmpty(), body('newPassword').isLength({ min: 8 }), validate];

module.exports = { sanitizeBody, loginValidation, registerValidation, passwordResetRequestValidation, passwordResetValidation, changePasswordValidation };
