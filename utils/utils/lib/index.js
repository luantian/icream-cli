'use strict';


function isObject(o) {
  return Object.prototype.toString.call(o) === '[object Object]'
}

function isString(o) {
  return Object.prototype.toString.call(o) === '[object String]'
}


module.exports = {
  isObject, isString
};
