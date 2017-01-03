/* global describe, it */
var expect = require('chai').expect;
var toPrimitive = require('es-to-primitive');

// The == operator according to http://www.ecma-international.org/ecma-262/6.0/#sec-abstract-equality-comparison
// x == y results in:
//    1. ReturnIfAbrupt(x).
//    2. ReturnIfAbrupt(y).
//    3. If Type(x) is the same as Type(y), then
//      a. Return the result of performing Strict Equality Comparison x === y.
//    4. If x is null and y is undefined, return true.
//    5. If x is undefined and y is null, return true.
//    6. If Type(x) is Number and Type(y) is String,
//      a. return the result of the comparison x == ToNumber(y).
//    7. If Type(x) is String and Type(y) is Number,
//      a. return the result of the comparison ToNumber(x) == y.
//    8. If Type(x) is Boolean, return the result of the comparison ToNumber(x) == y.
//    9. If Type(y) is Boolean, return the result of the comparison x == ToNumber(y).
//   10. If Type(x) is either String, Number, or Symbol and Type(y) is Object, then
//      a. return the result of the comparison x == ToPrimitive(y).
//   11. If Type(x) is Object and Type(y) is either String, Number, or Symbol, then
//      a. return the result of the comparison ToPrimitive(x) == y.
//   12. Return false.
// In node.js, the functions are mapped as follows:
// - Type(x) => typeof(x)       http://www.ecma-international.org/ecma-262/6.0/#sec-ecmascript-data-types-and-values
// - ToNumber(x) => Number(x)   http://www.ecma-international.org/ecma-262/6.0/#sec-tonumber
// - ToPrimitive(x) => function (x) {
//                      if (isPrimitive(x))
//                        return x;
//                      else if (typeof(x) === 'object') {
//                        var result = x.valueOf();
//                        if (isPrimitive(result))
//                          return result;
//                      }
//                      var result = x.toString();
//                      if (isPrimitive(result))
//                        return result;
//                      throw new TypeError(...);
//                     }()
// This behavior is not directly accessible in JavaScript, but described in http://www.ecma-international.org/ecma-262/6.0/#sec-toprimitive 
// and http://speakingjs.com/es5/ch08.html#toprimitive. An implementation exists in the module "es-to-primitive" (https://github.com/ljharb/es-to-primitive).

// The === operator according to http://www.ecma-international.org/ecma-262/6.0/#sec-strict-equality-comparison
// x === y results in:
//    1. If Type(x) is different from Type(y), return false.
//    2. If Type(x) is Undefined, return true.
//    3. If Type(x) is Null, return true.
//    4. If Type(x) is Number, then
//      a. If x is NaN, return false.
//      b. If y is NaN, return false.
//      c. If x is the same Number value as y, return true.
//      d. If x is +0 and y is −0, return true.
//      e. If x is −0 and y is +0, return true.
//      f. Return false.
//    5. If Type(x) is String, then
//      a. If x and y are exactly the same sequence of code units (same length and same code units at corresponding indices), return true.
//      b. Else, return false.
//    6. If Type(x) is Boolean, then
//      a. If x and y are both true or both false, return true.
//      b. Else, return false.
//    7. If x and y are the same Symbol value, return true.
//    8. If x and y are the same Object value, return true.
//    9. Return false.

describe('weird behavior', function () {
  it('comparing an empty string to a string zero', function () {
    expect('' == '0').to.be.false;
    // Case 3 (String == String): x == y
  });

  it('comparing an empty string to a number zero', function () {
    expect('' == 0).to.be.true;
    // Case 7 (String == Number): ToNumber(x) == y
    expect(0 === 0).to.be.true;
  });

  it('comparing a string zero to a number zero', function () {
    expect('0' == 0).to.be.true;
    // Case 7 (String == Number): ToNumber(x) == y
    expect(0 === 0).to.be.true;
  });

  it('comparing +0 and -0', function () {
    expect(+0 == -0).to.be.true;
    // Case 3 (Number == Number): x == y
  });

  it('comparing a string false to a boolean false', function () {
    expect('false' == false).to.be.false;
    // Case 9 (String == Boolean): x == ToNumber(y)
    // Case 7 (String == Number): ToNumber(x) === ToNumber(y)
    expect(NaN === 0).to.be.false;
  });

  it('comparing a string zero to a boolean false', function () {
    expect('0' == false).to.be.true;
    // Case 9 (String == Boolean): x == ToNumber(y)
    // Case 7 (String == Number): ToNumber(x) === ToNumber(y)
    expect(0 == 0).to.be.true;
  });

  it('comparing a boolean false to undefined', function () {
    expect(false == undefined).to.be.false;
    // Case 8 (Boolean == undefined): ToNumber(x) == y
    // Case 12 (Number == undefined): false
    expect (0 === undefined).to.be.false;
  });

  it('comparing a boolean false to null', function() {
    expect(false == null).to.be.false;
    // Case 8 (Boolean == null): ToNumber(x) == null
    // Case 12 (Number == null): false
    expect(0 === null).to.be.false;
  });

  it('comparing undefined to null', function () {
    expect(undefined == null).to.be.true;
    // Case 5 (undefined == null): true
  });

  it('comparing undefined to null', function () {
    expect(null == undefined).to.be.true;
    // Case 5 (null == undefined): true
  });

  it('comparing a new Boolean to its value with ==', function () {
    expect(new Boolean(false) == false).to.be.true;
    // Case 9 (Object == Boolean): x == ToNumber(y)
    // Case 11 (Object == Number): ToPrimitive(x) == ToNumber(y)
    // Case 3 (Boolean == Number): ToNumber(ToPrimitive(x)) === ToNumber(y)
    expect(false == false).to.be.true;
  });

  it('comparing a new Boolean to its value with ===', function () {
    expect(new Boolean(false) === false).to.be.false;
    // Strict case 1 (Object === Boolean): false
  });

  it('comparing two new Booleans with ==', function () {
    expect(new Boolean(false) == new Boolean(false)).to.be.false;
    // Case 3 (Boolean == Boolean): x === y
  });

  it('comparing two new Booleans with ===', function () {
    expect(new Boolean(false) === new Boolean(false)).to.be.false;
    // Strict case 9 (Object === Object): false
  });

  it('comparing a Boolean with itself with ===', function () {
    var bool = new Boolean(false);
    expect(bool === bool).to.be.true;
    // Strict case 8 (Object === Object): false
  });
});

describe('falsy values', function () {
  it('expect false to be falsy', function () {
    expect(false).to.be.not.ok;
  });

  it('expect null to be falsy', function () {
    expect(null).to.be.not.ok;
  });

  it('expect undefined to be falsy', function () {
    expect(undefined).to.be.not.ok;
  });

  it('expect an empty single string to be falsy', function () {
    expect('').to.be.not.ok;
  });

  it('expect an empty double string to be falsy', function () {
    expect("").to.be.not.ok;
  });

  it('expect the Boolean operation of "false" to be falsy', function () {
    expect(Boolean(false)).to.be.not.ok;
  });

  it('expect 0 to be falsy', function () {
    expect(0).to.be.not.ok;
  });

  it('expect -0 to be falsy', function () {
    expect(-0).to.be.not.ok;
  });

  it('expect NaN to be falsy', function () {
    expect(NaN).to.be.not.ok;
  });
});

describe('truethy values', function () {
  it('expect true to be truethy', function () {
    expect(true).to.be.ok;
  });

  it('expect a date object to be truethy', function () {
    expect(new Date()).to.be.ok;
  });

  it('expect an array to be truethy', function () {
    expect([1, 2, 3]).to.be.ok;
  });

  it('expect an empty array to be truethy', function () {
    expect([]).to.be.ok;
  });

  it('expect a JavaScript object to be truethy', function () {
    expect({a: 16}).to.be.ok;
  });

  it('expect an empty JavaScript object to be truethy', function () {
    expect({}).to.be.ok;
  });

  it('expect a Boolean object with "false" to be truethy', function () {
    // This is an object and objects are truethy. This is confusing.
    expect(new Boolean(false)).to.be.ok;
  });

  it('expect a String object with "" to be truethy', function () {
    // This is an object and objects are truethy. This is confusing.
    expect(new Boolean("")).to.be.ok;
  });

  it('expect a Number object with NaN to be truethy', function () {
    // This is an object and objects are truethy. This is confusing.
    expect(new Number(NaN)).to.be.ok;
  });

  it('expect a non-empty string to be truethy', function () {
    expect("hello").to.be.ok;
  });

  it('expect a number != +0, -0 or NaN to be truethy', function () {
    expect(1).to.be.ok;
  });
});

// Boolean(x) will return:
//  typeof(x) == Completion Record => (x.type !== normal) ? x : Boolean(x.value)
//  x = undefined        => false
//  x = null             => false
//  typeof(x) == Boolean => x
//  typeof(x) == Number  => !(x in {+0, -0, NaN})
//  typeof(x) == String  => !(x.length === 0)
//  typeof(x) == Symbol  => true
//  typeof(x) == Object  => true
// All according to http://www.ecma-international.org/ecma-262/6.0/#table-10 
// plus in case of the completion record http://www.ecma-international.org/ecma-262/6.0/#sec-completion-record-specification-type
// plus in case of the Symbol type http://www.ecma-international.org/ecma-262/6.0/#sec-ecmascript-language-types-symbol-type