const assert = require('assert');
const express = require('express');
const bodParser = require('body-parser');
const axios = require('axios');

const _ = require('lodash');

const mongoose = require('mongoose');
const {MongoMemoryServer} = require('mongodb-memory-server');


const createController = require('../controller/createController');
const genericController = require('../controller/genericController');

const UserModel = mongoose.model('User', new mongoose.Schema({
  id: Number,
  name: String,
  age: Number,
  category: String
}));


describe('test', function () {

  let listener;
  const PORT = 3002;
  const URL = `http://localhost:${PORT}`

  let mongoServer;
  const opts = {useNewUrlParser: true, useUnifiedTopology: true};

  const userSeed = async () => {
    const categories = ["aa", "bb", "cc", "dd"];
    const names = ["kennedy", "reagan", "trump", "obama", "biden", "bush", "clinton", "lincoln", "truman", "roosevelt"];


    const data = _.range(50).map(i => ({
      id: i,
      name: names[i % names.length],
      age: 50 + i,
      category: categories[i % categories.length]
    }))


    // await UserModel.create({id: 1, name: "user1", age: 20});
    await UserModel.create(data);
  }


  const userSeedClear = async () => {
    await UserModel.deleteMany({});
  }

  before(async () => {
    mongoServer = new MongoMemoryServer();
    const mongoUri = await mongoServer.getUri();
    await mongoose.connect(mongoUri, opts);

    const app = express();
    app.use(bodParser.json());
    // app.use("/", controller());
    app.use("/", createController(genericController(UserModel), 1));


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

  it('should list all', async function () {
    let res = await UserModel.find({});
    // console.log(res);
    assert.deepStrictEqual(res.length, 50);

  });

  it('should filter', async function () {
    const res = await axios.get(`${URL}/?name=obama&age__gt=45&category__in=aa,bb`)
    assert.deepStrictEqual(res.data[0].age, 63);
    assert.deepStrictEqual(res.data[1].age, 83);

  });

  it('should throw error', async function () {
    try {
      await axios.get(`${URL}/?name=obama&age__gt=45&category__inx=aa,bb`)
    } catch (err) {
      assert.deepStrictEqual(err.response.data, {message: 'query error'});
    }


  });

  it('should filter range', async function () {
    const res = await axios.get(`${URL}/?age__gt=60&age__lt=70`)
    assert.deepStrictEqual(res.data.length, 9);
    assert.deepStrictEqual(res.data[0].age, 61);
  });

  it('should sort', async function () {
    let res = await axios.get(`${URL}/?name=obama&__sort=-age`)
    res = res.data.map(i => i.age)
    assert.deepStrictEqual(res, [93, 83, 73, 63, 53]);

  });


  it('should skip limit', async function () {
    let res = await axios.get(`${URL}/?__sort=age&__limit=10`);
    assert.deepStrictEqual(res.data.length, 10);

    res = await axios.get(`${URL}/?__sort=age&__limit=10&__skip=20`);
    assert.deepStrictEqual(res.data.length, 10);
    assert.deepStrictEqual(res.data[0].age, 70);

  });

});
