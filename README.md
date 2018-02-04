# Privatise

> Create private properties using the underscore naming convention

Privatise allows you to create private properties using the well established underscore prefix naming convention. Read and writes to any properties marked as private will result in an error being thrown.

## Features

* Prevent read and write access to properties prefixed with `_`
* Prevent private properties from being enumerable
* Filter out private variables when calling `JSON.stringify`
* Ability to privatise clases or instances

## Install

```sh
$ npm install --save @averagemarcus/privatise
```

## Examples

Privatise an instance:
```js
import privatise from '@averagemarcus/privatise';

class TestClass {
  constructor() {
    this.publicInt = 1;
    this._privateInt = 2;
  }
}

const instance = privatise(new TestClass());
console.log(instance.publicInt); // 1
console.log(instance._privateInt); // Error: Attempt to access private property
```

Privatise a class:
```js
// TestClass.js
import privatise from '@averagemarcus/privatise';

class TestClass {
  constructor() {
    this.publicInt = 1;
    this._privateInt = 2;
  }
}

module.exports = privatise(TestClass);

// index.js
import TestClass from './TestClass'
const instance = new TestClass();
console.log(instance.publicInt); // 1
console.log(instance._privateInt); // Error: Attempt to access private property
```

## Created by

* [Marcus Noble](http://github.com/averageMarcus/)

## License

MIT
