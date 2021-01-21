(async () => {
  const mongoose = require('mongoose');
  const express = require('express');
  const bodParser = require('body-parser');


  const createController = require('../controller/createController');
  const genericController = require('../controller/genericController');


  const UserModel = mongoose.model('User', new mongoose.Schema({
    name: String,
    age: Number,
    email: String,
    alive: Boolean,
    sex: String
  }));


  await mongoose.connect('mongodb://localhost/test', {useNewUrlParser: true, useUnifiedTopology: true});


  const controller = (model) => ({
    ...genericController(model),
    list: () => ({message: "surprise motherfucker"})
  })


  const app = express();

  app.use(bodParser.json());
  // noinspection JSCheckFunctionSignatures
  app.use("/", createController(controller(UserModel), null, ["list"]));


  app.listen(3000, () => {
    console.log(3000, "listening");
  })

})();
