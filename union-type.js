var curryN = require('ramda/src/curryN');

if (process === undefined || process.env.NODE_ENV === 'development') {
  function isString(s) {
    return typeof s === 'string';
  }

  function isNumber(n) {
    return typeof n === 'number';
  }

  function isBoolean(b) {
    return typeof b === 'boolean';
  }

  function isObject(value) {
    var type = typeof value;
    return !!value && (type == 'object' || type == 'function');
  }

  function isFunction(f) {
    return typeof f === 'function';
  }

  var isArray = Array.isArray || function (a) {
      return 'length' in a;
    };

  var mapConstrToFn = function (group, constr) {
    return constr === String ? isString
      : constr === Number ? isNumber
      : constr === Boolean ? isBoolean
      : constr === Object ? isObject
      : constr === Array ? isArray
      : constr === Function ? isFunction
      : constr === undefined ? group
      : constr;
  };
}

function Constructor(group, name, validators) {
  return curryN(validators.length, function() {
    var val = [], validator, i, v;
    if (process.env.NODE_ENV === 'production') {
      for (i = 0; i < arguments.length; ++i) val[i] = arguments[i];
    } else {
      for (i = 0; i < arguments.length; ++i) {
        v = arguments[i];
        validator = mapConstrToFn(group, validators[i]);
        if ((typeof validator === 'function' && validator(v)) ||
          (v !== undefined && v !== null && v.of === validator)) {
          val[i] = v;
        } else {
          throw new TypeError('wrong value ' + v + ' passed to location ' + i + ' in ' + name);
        }
      }
    }
    val.of = group;
    val.name = name;
    return val;
  });
}

function rawCase(type, cases, action, arg) {
  if (type !== action.of) throw new TypeError('wrong type passed to case');
  var name = action.name in cases ? action.name
    : '_' in cases         ? '_'
    : undefined;
  if (name === undefined) {
    throw new Error('unhandled value passed to case');
  } else {
    return cases[name].apply(undefined, arg !== undefined ? action.concat([arg]) : action);
  }
}

var typeCase = curryN(3, rawCase);
var caseOn = curryN(4, rawCase);

function Type(desc) {
  var obj = {};
  for (var key in desc) {
    obj[key] = Constructor(obj, key, desc[key]);
  }
  obj.case = typeCase(obj);
  obj.caseOn = caseOn(obj);
  return obj;
}

module.exports = Type;

