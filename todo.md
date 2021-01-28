
```bash
docker run  -d --rm -p 27017:27017 --name mongo-local mongo

docker stop mongo-local
```


# todos

## example yaz

- model override (aggregation ve lookup)

- full text search

- projection (find ve findOne)

- endpoint override (createController'den dönen router ile get,post vs method çağır)

- userForm parametresini middleware olarak güncelle, validator dışında örnek yap

***
# docs

### mongoose api

https://mongoosejs.com/docs/guide.html

### populate api & lookup (joinler için)
https://mongoosejs.com/docs/populate.html

https://dev.to/paras594/how-to-use-populate-in-mongoose-node-js-mo0

https://github.com/mongodb-js/mongoose-autopopulate (autopopulate)

### form validation

https://express-validator.github.io/docs/

https://github.com/validatorjs/validator.js#sanitizers


### query parameters

https://github.com/vasansr/query-params-mongo

https://mongoosejs.com/docs/api.html#query_Query-setOptions

### referans tasarım

https://strapi.io/documentation/developer-docs/latest/content-api/api-endpoints.html#endpoints


### mongodb in memory test

https://github.com/nodkz/mongodb-memory-server

