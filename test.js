import test from 'ava';
import privatise from './';

class TestClass {
  constructor() {
    this._privateInt = 1;
    this._privateString = 'test';
    this._privateFunction = () => 123;
    this.publicInt = 2;
    this.publicString = 'Hello';
    this.publicFunction = () => 'ABC';
  }

  proxyFunction() {
    return this._internalProxyFunction();
  }

  _internalProxyFunction() {
    return this._privateInt;
  }
}

const instance = privatise(new TestClass);

test('should allow access to public properties', t => {
  t.is(instance.publicInt, 2);
  t.is(instance.publicString, 'Hello');
  t.is(instance.publicFunction(), 'ABC');
});

test('properties cannot be accessed', t => {
  t.throws(() => instance._privateInt);
  t.throws(() => instance._privateString);
  t.throws(() => instance._privateFunction());
  t.throws(() => instance._internalProxyFunction());
});

test('private properties are not enumerable', t=> {
  for (const key in instance) {
    if (key[0] === '_') {
      t.fail(`Found private key ${key}`);
    }
  }
  t.pass();
});

test('public properties are enumerable', t=> {
  for (const key in instance) {
    t.pass();
  }
});

test('private properties are available internally', t => {
  t.is(instance.proxyFunction(), 1);
})

test('instance can be stringified', t => {
  const expected = JSON.stringify({
    publicInt: 2,
    publicString: 'Hello'
  });
  t.is(JSON.stringify(instance), expected);
});

test('instanceof matches', t => {
  t.true(instance instanceof TestClass);
});

test('Object.assign', t => {
  const copied = Object.assign({}, instance);
  t.is(copied.publicInt, 2);
  t.is(copied.publicString, 'Hello');
  t.is(copied.publicFunction(), 'ABC');
  t.is(copied._privateInt, undefined);
  t.is(copied._privateString, undefined);
  t.is(copied._privateFunction, undefined);
});

test('extends class', t => {
  class ExtendedClass extends TestClass {
    constructor() {
      super();
      this.a = 1;
      this._b = 2;
    }
  }
  const extendedInstance = privatise(new ExtendedClass());
  t.is(extendedInstance.publicInt, 2);
  t.is(extendedInstance.publicString, 'Hello');
  t.is(extendedInstance.publicFunction(), 'ABC');
  t.is(extendedInstance.a, 1);
  t.throws(() => extendedInstance._privateInt);
  t.throws(() => extendedInstance._privateString);
  t.throws(() => extendedInstance._privateFunction());
  t.throws(() => extendedInstance._b);
  t.true(extendedInstance instanceof ExtendedClass);
});

test('privatise class object', t => {
  const clazz = privatise(TestClass);
  const instance = new clazz();

  t.is(instance.publicInt, 2);
  t.is(instance.publicString, 'Hello');
  t.is(instance.publicFunction(), 'ABC');
  t.throws(() => instance._privateInt);
  t.throws(() => instance._privateString);
  t.throws(() => instance._privateFunction());
  t.true(instance instanceof TestClass);
});

test('static properties', t => {
  const staticTestClass = privatise(class StaticTestClass {
    static _b() {
      return 123;
    }

    constructor() {
      this.a = StaticTestClass._b();
    }
  })

  const staticInstance = new staticTestClass();
  t.is(staticInstance.a, 123);
  t.throws(() => staticTestClass._b());
});

test('custom toJSON function', t => {
  class TestClass {
    constructor() {
      this.a = 1;
      this._b = 2;
    }

    toJSON() {
      const obj = {};
      for (const key in this) {
        obj[key.toUpperCase()] = this[key];
      }
      return obj;
    }
  }
  const instance = privatise(new TestClass());

  t.is(JSON.stringify(instance), JSON.stringify({A:1}));
})

test('nested proxies', t => {
  const proxiedProxy = new Proxy(instance, {});
  t.throws(() => proxiedProxy._internalProxyFunction());
  t.throws(() => proxiedProxy._privateInt);
  t.throws(() => proxiedProxy._privateString);
  t.throws(() => proxiedProxy._internalProxyFunction());
  t.is(proxiedProxy.publicInt, 2);
  t.is(proxiedProxy.publicString, 'Hello');
  t.is(proxiedProxy.publicFunction(), 'ABC');
  t.is(proxiedProxy.proxyFunction(), 1);
});
