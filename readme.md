# kata

Simple mongodb-node-expressjs API library

### start mongodb docker

```bash
docker run  -d --rm -p 27017:27017 --name mongo-local mongo

docker stop mongo-local
```

### install dependencies

```bash
# install library
yarn add chemikata

# install other dependencies
yarn add mongoose express body-parser express-validator

```

### index.js

```js
(async () => {
  const mongoose = require('mongoose');
  const express = require('express');
  const bodParser = require('body-parser');
  const {body, param} = require('express-validator');


  const {createController, genericController} = require('chemikata');


  const UserModel = mongoose.model('User', new mongoose.Schema({
    name: String,
    age: Number,
    email: String,
    alive: Boolean,
    sex: String
  }));

  const userFormSchema = {
    create: [
      body("name").isString().isLength({min: 5}),
      body("age").isInt({min: 10, max: 60}),
      body("email").isEmail(),
      body("sex").isIn(["male", "female"]),
      body("alive").optional().isBoolean()
    ],
    update: [
      body("age").isInt({min: 10, max: 60}),
      body("alive").custom(value => {
        if (value !== undefined) {
          throw new Error("alive must not be defined")
        }
        return true;
      }),
      param("id").isMongoId()
    ]
  }


  await mongoose.connect('mongodb://localhost/test', {useNewUrlParser: true, useUnifiedTopology: true});


  const app = express();

  app.use(bodParser.json());
  app.use("/", createController(genericController(UserModel), userFormSchema));


  app.listen(3000, () => {
    console.log(3000, "listening");
  })

})();


```

### http requests

```http

###
POST http://localhost:3000/
Content-Type: application/json

{
  "name": "hayri",
  "age": 24,
  "email": "hayri@gmail.com",
  "alive": true,
  "sex": "male"
}

###
POST http://localhost:3000/
Content-Type: application/json

{
  "name": "semsi",
  "age": 34,
  "email": "semsi@gmail.com",
  "alive": true,
  "sex": "male"
}

###
GET http://localhost:3000/?name=hayri
Accept: application/json

###
GET http://localhost:3000/?age__gt=30
Accept: application/json

###
GET http://localhost:3000/6009b2d23f29dd7558fed256
Accept: application/json

###
GET http://localhost:3000/count
Accept: application/json

###
GET http://localhost:3000/count?age__gt=30
Accept: application/json

###
PUT http://localhost:3000/6009b2d23f29dd7558fed256
Content-Type: application/json

{
  "age": 44
}

###
DELETE http://localhost:3000/6009b2d23f29dd7558fed256
Content-Type: application/json

{}

```


### custom handler

override list method and allow only list handler

```js
  const controller = (model) => ({
    ...genericController(model),
    list: () => ({message: "surprise motherfucker"})
  })

  app.use("/", createController(controller(UserModel), null, ["list"]));
```


### form validation

https://express-validator.github.io/docs/

https://github.com/validatorjs/validator.js

### query parameters

https://github.com/vasansr/query-params-mongo
