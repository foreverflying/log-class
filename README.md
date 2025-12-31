# log-class
[![log-class npm version](https://img.shields.io/npm/v/log-class.svg?style=popout&color=blue&label=log-class)](https://www.npmjs.com/package/log-class)

Help you track the complete process of class member function calls with a single log line.

# Usage
```ts
import { logClass, setLogLevel } from 'log-class'

setLogLevel(4)

@logClass()
class Manager {
    constructor(name: string, age: number) {
        this._test1 = new Staff(name + ' 1')
        this._test2 = new Staff(name + ' 2')
        this._age = age
    }

    show() {
        this.innerPrint(this._test1, this._age)
        this.innerPrint(this._test2, this._age)
        return `age: ${this._age}`
    }

    private innerPrint(testB: Staff, age: number) {
        testB.print(age)
    }

    private _test1: Staff
    private _test2: Staff
    private _age: number
}

@logClass({ keyName: 'name' })
class Staff {
    constructor(name: string) {
        this.name = name
    }

    readonly name: string

    print(age: number) {
        console.log('  - name:', this.name, 'age:', age)
        return age
    }
}

console.log('** start process **\n')

const testA = new Manager('Staff', 18)
testA.show()

console.log('\n** end process **')
```

logs generated:
```
** start process **

/-new Manager("Staff", 18)
|   /-new Staff("Staff 1")
|   \-new Staff{Staff 1}
|   /-new Staff("Staff 2")
|   \-new Staff{Staff 2}
\-new Manager
/-Manager.show()
|   /-Manager.innerPrint([Staff], 18)
|   |   /-Staff{Staff 1}.print(18)
  - name: Staff 1 age: 18
|   |   \-Staff{Staff 1}.print => 18
|   \-Manager.innerPrint => undefined
|   /-Manager.innerPrint([Staff], 18)
|   |   /-Staff{Staff 2}.print(18)
  - name: Staff 2 age: 18
|   |   \-Staff{Staff 2}.print => 18
|   \-Manager.innerPrint => undefined
\-Manager.show => "age: 18"

** end process **
```

# Usage
## Set `logLevel`
Any class with its `level` <= `logLevel` will show logs.
The default initial `logLevel` is 0, which means show no logs (except for the classes that claimed their `level` to be 0). Use environment variable `LOG_CLASS_LOG_LEVEL` to override it, integers 0 ~ 5 are acceptable.

## APIs
```ts
/***
 * @param opts          optional parameters for logging
 * @param opts.logger   logger function to use, default is console.log
 * @param opts.level    this class's level, 0 <= level <= 5, if level <= logLevel then show logs, default is 3
 * @param opts.keyName  when logging a class's instance, also show this[keyName] as identifier
 */
const logClass = (opts?: LogClassOpts) => {
    // ...
}

/***
 * @param val           if logClass's val <= logLevel, will show logs. initial logLevel is 0
 */
const setLogLevel = (val: 0 | 1 | 2 | 3 | 4 | 5): void => {
    // ...
}