class PrivateAccessError extends Error {
  constructor() {
    super('Attempt to access private property');
  }
}

const isStringifying = () => {
  try {
    throw new Error();
  } catch (err) {
    return err.stack.split('\n').find(line => line.indexOf('JSON.stringify') >= 0 || line.indexOf('Object.stringify') >= 0);
  }
}

const isInternalCall = () => {
  try {
    throw new Error();
  } catch (err) {
    return err.stack.split('\n').find(line => line.match(/Proxy\.\w/));
  }
}

const handler = {
  get: function(target, key, receiver) {
    if (key[0] === '_' && !isInternalCall()) {
      if (isStringifying()) {
        return undefined;
      }
      throw new PrivateAccessError();
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
