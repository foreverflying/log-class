/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata'

export type {
    LogClassOpts,
}

export {
    logClass,
    setLogLevel,
}

let logLevel = 0
let nestLevel = 0

const valueToPrint = (x: any) => x === null ? x : (
    typeof x === 'string' ? `"${x}"` : (
        typeof x === 'function' ? (x.prototype?.constructor ? x.prototype.constructor.name : '[Func]') : (
            typeof x === 'undefined' ? 'undefined' : (
                typeof x !== 'object' ? x : (
                    x.constructor.name === 'Object' ? '[Obj]' : (
                        x.constructor.name === 'Error' ? `[Err: ${x.message}]` : `[${x.constructor.name}]`
                    )
                )
            )
        )
    )
)

type AnyFunc = (...args: any[]) => any

const replacePrototypeMethod = (prototype: Record<string, AnyFunc>, prop: string, method: AnyFunc, opts?: LogClassOpts) => {
    const logger = opts?.logger ?? console.log
    const keyName = opts?.keyName
    const className = prototype.constructor.name
    prototype[prop] = function (...args: any[]) {
        const logArgs = args.map(valueToPrint)
        const indent = '|   '.repeat(nestLevel)
        const getKey = keyName ? (thisObj: Record<string, any>) => `{${thisObj[keyName]}}` : () => ''
        logger(`${indent}/-${className}${getKey(this)}.${prop}(${logArgs.join(', ')})`)
        nestLevel++
        try {
            const ret = method.apply(this, args)
            if (ret?.then) {
                return ret.then(
                    (val: any) => {
                        nestLevel--
                        logger(`${indent}\\-${className}${getKey(this)}.${prop} => ${valueToPrint(val)}`)
                        return val
                    },
                    (err: any) => {
                        nestLevel--
                        logger(`${indent}\\-${className}${getKey(this)}.${prop} thrown ${valueToPrint(err)}`)
                        throw err
                    },
                )
            }
            nestLevel--
            logger(`${indent}\\-${className}${getKey(this)}.${prop} => ${valueToPrint(ret)}`)
            return ret
        } catch (err) {
            nestLevel--
            logger(`${indent}\\-${className}${getKey(this)}.${prop} thrown ${valueToPrint(err)}`)
            throw err
        }
    }
}

type LogClassOpts = {
    logger?: (...args: any[]) => void
    level?: number
    keyName?: string
}

/***
 * @param opts optional parameters for logging
 * @param opts.logger:  logger function to use, default is console.log
 * @param opts.level:   this class's log level, if level <= logLevel then show logs, default is 3
 * @param opts.keyName: when logging a class's instance, also show this[keyName] as identifier
 */
const logClass = (opts?: LogClassOpts) => {
    const logger = opts?.logger ?? console.log
    const level = opts?.level ?? 3
    const keyName = opts?.keyName
    return <T extends { new(...args: any[]): InstanceType<T> }>(target: T) => {
        if (level < 0 || level > logLevel) {
            return target
        }
        const className = target.name
        const prototype = target.prototype
        const proxy = new Proxy(target, {
            construct(orgin, args, newTarget) {
                const logArgs = args.map(valueToPrint)
                const indent = '|   '.repeat(nestLevel)
                logger(`${indent}/-new ${className}(${logArgs.join(', ')})`)
                nestLevel++
                const result = Reflect.construct(orgin, args, newTarget)
                nestLevel--
                logger(`${indent}\\-new ${className}${keyName ? `{${result[keyName]}}` : ''}`)
                return result
            },
        })
        const props = Object.getOwnPropertyNames(prototype)
        for (const prop of props) {
            const descriptor = Object.getOwnPropertyDescriptor(prototype, prop)
            if (prop !== 'constructor' && descriptor && typeof descriptor.value === 'function') {
                replacePrototypeMethod(prototype as any, prop, descriptor.value, opts)
            }
        }
        return proxy
    }
}

/***
 * @param level 0 <= level <= 5, initial logLevel is 0. if logClass's level <= logLevel, will show logs.
 */
const setLogLevel = (level: 0 | 1 | 2 | 3 | 4 | 5): void => {
    logLevel = level > 5 ? 5 : (level < 0 ? 0 : level)
}
