class PrivateAccessError extends Error {
  constructor() {
    super('Attempt to access private property');
  }
}

const handler = {
  get: function(target, key) {
    if (key[0] === '_') {
      throw new PrivateAccessError();
    } else if (key === 'toJSON') {
      const obj = {};
      for (const key in target) {
        if (key[0] !== '_') {
          obj[key] = target[key];
        }
      }
      return () => obj;
    }
    return target[key];
  },
  set: function(target, key, value) {
    if (key[0] === '_') {
      throw new PrivateAccessError();
    }
    target[key] = value;
  },
  getOwnPropertyDescriptor(target, key) {
    const desc = Object.getOwnPropertyDescriptor(target, key);
    if (key[0] === '_') {
      desc.enumerable = false;
    }
    return desc;
  }
};

const functionHandler = Object.assign({}, handler, {
  construct: function(target, args) {
    return new Proxy(new target(...args), handler);
  }
});

module.exports = function(target) {
  if (typeof target === 'object') {
    return new Proxy(target, handler);
  } else if (typeof target === 'function') {
    return new Proxy(target, functionHandler);
  }
}
