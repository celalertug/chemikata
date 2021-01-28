/* eslint-disable no-console */
const mongoose = require('mongoose');
const express = require('express');
const bodParser = require('body-parser');
const { body, param } = require('express-validator');

const createController = require('../controller/createController');
const genericController = require('../controller/genericController');

(async () => {
  const UserModel = mongoose.model('User', new mongoose.Schema({
    name: String,
    age: Number,
    email: String,
    alive: Boolean,
    sex: String,
    createdAt: Number,
    updatedAt: Number,
  }));

  const userFormSchema = {
    create: [
      body('name').isString().isLength({ min: 5 }),
      body('age').isInt({ min: 10, max: 60 }),
      body('email').isEmail(),
      body('sex').isIn(['male', 'female']),
      body('alive').optional().isBoolean(),
    ],
    update: [
      body('age').isInt({ min: 10, max: 60 }),
      body('alive').custom((value) => {
        if (value !== undefined) {
          throw new Error('alive must not be defined');
        }
        return true;
      }),
      param('id').isMongoId(),
    ],
  };

  await mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true, useUnifiedTopology: true });

  const app = express();

  app.use(bodParser.json());
  // noinspection JSCheckFunctionSignatures
  app.use('/', createController(genericController(UserModel), userFormSchema));

  app.listen(3000, () => {
    console.log(3000, 'listening');
  });
})();
