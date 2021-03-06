/* eslint-disable no-undef */
const assert = require('assert');

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const bodParser = require('body-parser');
const axios = require('axios');

const { body, param } = require('express-validator');

// const {UserModel} = require('../model/models');

const createController = require('../controller/createController');
const genericController = require('../controller/genericController');

const UserModel = mongoose.model('User', new mongoose.Schema({
  id: Number,
  name: String,
  age: Number,
  email: String,
  alive: Boolean,
  sex: String,
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
    (req, res, next) => {
      req.query.name = 'user1';
      next();
    },
  ],
  list: [
    (req, res, next) => {
      req.query.name = 'user2';
      next();
    },
  ],
};

describe('test form validation', () => {
  let mongoServer;
  const opts = { useNewUrlParser: true, useUnifiedTopology: true };

  let listener;
  const PORT = 3002;
  const URL = `http://localhost:${PORT}`;

  const userSeed = async () => {
    await UserModel.create({ id: 1, name: 'user1', age: 20 });
    await UserModel.create({ id: 2, name: 'user2', age: 21 });
    await UserModel.create({ id: 3, name: 'user3', age: 22 });
  };

  const userSeedClear = async () => {
    await UserModel.deleteMany({});
  };

  before(async () => {
    mongoServer = new MongoMemoryServer();
    const mongoUri = await mongoServer.getUri();
    await mongoose.connect(mongoUri, opts);

    const app = express();
    app.use(bodParser.json());
    app.use('/', createController(genericController(UserModel), userFormSchema));

    listener = app.listen(PORT);
  });

  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();

    listener.close();
  });

  afterEach(async () => {
    await userSeedClear();
  });

  beforeEach(async () => {
    await userSeed();
  });

  it('should list', async () => {
    const res = await axios.get(`${URL}/`);
    // console.log(res.data);
    assert.deepStrictEqual(res.data[0].id, 2);
    assert.deepStrictEqual(res.data[0].name, 'user2');
    assert.deepStrictEqual(res.data[0].age, 21);
  });

  it('should create valid', async () => {
    let res;
    try {
      res = await axios.post(`${URL}/`, {
        id: 4,
        name: 'user4',
        age: 33,
        email: 'adam@mail.com',
        alive: true,
        sex: 'male',
      });
      delete res.data._id;
      delete res.data.__v;
      // console.log(res.data);
      assert.deepStrictEqual(res.data, {
        id: 4,
        name: 'user4',
        age: 33,
        email: 'adam@mail.com',
        sex: 'male',
        alive: true,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err.response.data);
    }
  });

  it('should create invalid', async () => {
    let res;
    try {
      await axios.post(`${URL}/`, {
        id: 4, name: 'user4', age: 5, email: 'adam@mail.com', sex: 'male1',
      });
      assert.strictEqual(1, 0);
    } catch (err) {
      res = err.response.data;
    }

    assert.deepStrictEqual(res, {
      errors: [
        {
          value: 5, msg: 'Invalid value', param: 'age', location: 'body',
        },
        {
          value: 'male1',
          msg: 'Invalid value',
          param: 'sex',
          location: 'body',
        },
      ],
    });
  });

  it('should update', async () => {
    const user = await UserModel.findOne({ id: 1 });
    const res = await axios.put(`${URL}/${user._id}`, { age: 32 });
    assert.deepStrictEqual(res.data, { success: true });
  });

  it('should update error on unauthorized resource', async () => {
    const user = await UserModel.findOne({ id: 2 });
    const res = await axios.put(`${URL}/${user._id}`, { age: 32 });
    assert.deepStrictEqual(res.data, { success: false });
  });

  it('should update error', async () => {
    let res;
    try {
      const user = await UserModel.findOne({ id: 1 });
      await axios.put(`${URL}/${user._id}`, { age: 32, alive: false });
      assert.strictEqual(1, 0);
    } catch (err) {
      res = err.response.data;
    }
    assert.deepStrictEqual(res, {
      errors: [
        {
          value: false,
          msg: 'alive must not be defined',
          param: 'alive',
          location: 'body',
        },
      ],
    });
  });

  it('should update error2', async () => {
    const res = await axios.put(`${URL}/000000000000000000000000`, { age: 32 });
    assert.deepStrictEqual(res.data, { success: false });
  });
});
