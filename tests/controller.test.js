const assert = require('assert');

const mongoose = require('mongoose');
const {MongoMemoryServer} = require('mongodb-memory-server');
const express = require('express');
const bodParser = require('body-parser');
const axios = require('axios');


// const {UserModel} = require('../model/models');

const createController = require('../controller/createController');
const genericController = require('../controller/genericController');


const UserModel = mongoose.model('User', new mongoose.Schema({name: String, age: Number}));


describe('test collection crud', () => {

  let mongoServer;
  const opts = {useNewUrlParser: true, useUnifiedTopology: true};


  let listener;
  const PORT = 3002;
  const URL = `http://localhost:${PORT}`

  const userSeed = async () => {
    await UserModel.create({name: "user1", age: 20});
    await UserModel.create({name: "user2", age: 21});
    await UserModel.create({name: "user3", age: 22});
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
    // app.use("/", createController(genericController, UserModel, 1));
    app.use("/", createController(genericController(UserModel)));

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

  it('should get', async () => {
    let res = await axios.get(`${URL}/`);
    res = res.data.map(i => ({name: i.name, age: i.age}))
    assert.deepStrictEqual(res, [
      {name: 'user1', age: 20},
      {name: 'user2', age: 21},
      {name: 'user3', age: 22}
    ]);
  });


  it('should get one', async function () {
    const u = await UserModel.find({});
    const id = u[1]._id;


    const res = await axios.get(`${URL}/${id}`);
    assert.deepStrictEqual(res.data.name, "user2");

  });

  it('should create', async function () {
    let res = await axios.post(`${URL}/`, {name: "user4"});
    assert.deepStrictEqual(res.data.name, "user4");

    res = await axios.get(`${URL}/`);

    res = res.data.map(i => ({name: i.name}))
    assert.deepStrictEqual(res, [
      {name: 'user1'},
      {name: 'user2'},
      {name: 'user3'},
      {name: 'user4'}
    ]);
  });


  it('should remove', async function () {

    const u = await UserModel.find({});
    const id = u[0]._id;


    let res = await axios.delete(`${URL}/${id}`);
    assert.deepStrictEqual(res.data, {n: 1, ok: 1, deletedCount: 1});

    res = await axios.get(`${URL}/`);
    res = res.data.map(i => ({name: i.name}))
    assert.deepStrictEqual(res, [{name: 'user2'}, {name: 'user3'}]);

  });

  it('should remove non exist item', async function () {
    let res = await axios.delete(`${URL}/6009701fe460c5418702cdb1`);
    assert.deepStrictEqual(res.data, {n: 0, ok: 1, deletedCount: 0});
  });

  it('should count', async function () {
    let res = await axios.get(`${URL}/count`);
    assert.deepStrictEqual(res.data, {count: 3});

  });

  it('should count with query', async function () {
    let res = await axios.get(`${URL}/count?age__gt=21`);
    assert.deepStrictEqual(res.data, {count: 1});

  });

  it('should update', async function () {
    const u = await UserModel.find({});
    const id = u[0]._id;

    let res;
    res = await axios.put(`${URL}/${id}`, {name: "sulo"});
    assert.deepStrictEqual(res.data, {success: true});


    res = await axios.get(`${URL}/`);

    res = res.data.map(i => ({name: i.name}))
    assert.deepStrictEqual(res, [
      {name: 'sulo'},
      {name: 'user2'},
      {name: 'user3'}
    ]);
  });


});
