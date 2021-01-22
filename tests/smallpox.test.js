const assert = require('assert');

const _ = require('lodash');


describe('smallpox', function () {

  it('should timestamp', function () {
    let res = Date.now();
    console.log(res);
    console.log(typeof res);

    res = new Date(res)
    console.log(res);

  });

  it('should work', function () {
    const a = {user: "adam", age: 33}
    const b = {user: "smith", height: 180}

    console.log({...a, ...b});
    console.log({...b, ...a});


  });
});
