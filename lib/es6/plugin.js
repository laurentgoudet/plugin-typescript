import * as ts from 'typescript';
import Logger from './logger';
import { createFactory } from './factory';
import { formatErrors } from './format-errors';
import { isTypescript, isTypescriptDeclaration, stripDoubleExtension, hasError } from './utils';
var logger = new Logger({ debug: false });
var factory = null;
export function getFactory() {
    var __global = typeof (self) !== 'undefined' ? self : global;
    __global.tsfactory = __global.tsfactory || createFactory(System.typescriptOptions, false, _resolve, _fetch, _lookup)
        .then(function (output) {
        validateOptions(output.host.options);
        return output;
    });
    return __global.tsfactory;
}
export function translate(load) {
    var loader = this;
    logger.debug("systemjs translating " + load.address);
    factory = factory || getFactory();
    return factory.then(function (_a) {
        var transpiler = _a.transpiler, resolver = _a.resolver, typeChecker = _a.typeChecker, host = _a.host;
        host.addFile(load.address, load.source);
        if (isTypescriptDeclaration(load.address)) {
            if (loader.builder && (host.options.module == ts.ModuleKind.ES2015)) {
                load.source = null;
                load.metadata.format = 'esm';
            }
            else {
                load.source = '';
                load.metadata.format = 'cjs';
            }
        }
        else {
            var result = transpiler.transpile(load.address);
            formatErrors(result.errors, logger);
            if (result.failure)
                throw new Error('TypeScript transpilation failed');
            load.source = result.js;
            if (result.sourceMap)
                load.metadata.sourceMap = JSON.parse(result.sourceMap);
            if (!host.options.autoDetectModule) {
                if (host.options.module === ts.ModuleKind.System)
                    load.metadata.format = 'register';
                else if (host.options.module === ts.ModuleKind.ES2015)
                    load.metadata.format = 'esm';
                else if (host.options.module === ts.ModuleKind.CommonJS)
                    load.metadata.format = 'cjs';
            }
        }
        if (loader.builder)
            return typeCheck(load).then(function () { return load.source; });
        else
            return Promise.resolve(load.source);
    });
}
export function instantiate(load, systemInstantiate) {
    return factory.then(function (_a) {
        var typeChecker = _a.typeChecker, resolver = _a.resolver, host = _a.host;
        return systemInstantiate(load)
            .then(function (entry) {
            return typeCheck(load).then(function (errors) {
                if ((host.options.typeCheck === "strict") && hasError(errors))
                    throw new Error("Typescript compilation failed");
                entry.deps = entry.deps.concat(load.metadata.deps);
                return entry;
            });
        });
    });
}
function typeCheck(load) {
    return factory.then(function (_a) {
        var typeChecker = _a.typeChecker, resolver = _a.resolver, host = _a.host;
        if (host.options.typeCheck && isTypescript(load.address)) {
            return resolver.resolve(load.address)
                .then(function (deps) {
                var errors = typeChecker.check();
                formatErrors(errors, logger);
                var depslist = deps.list
                    .filter(function (d) { return isTypescript(d); })
                    .filter(function (d) { return d !== load.address; })
                    .map(function (d) { return isTypescriptDeclaration(d) ? d + '!' + __moduleName : d; });
                load.metadata.deps = depslist;
                return errors;
            });
        }
        else {
            return [];
        }
    });
}
export function bundle() {
    if (!factory)
        return [];
    return factory.then(function (_a) {
        var typeChecker = _a.typeChecker, host = _a.host;
        if (host.options.typeCheck) {
            var errors = typeChecker.forceCheck();
            formatErrors(errors, logger);
            if ((host.options.typeCheck === "strict") && typeChecker.hasErrors())
                throw new Error("Typescript compilation failed");
        }
        return [];
    });
}
function validateOptions(options) {
    if ((options.module != ts.ModuleKind.System) && (options.module != ts.ModuleKind.ES2015)) {
        logger.warn("transpiling to " + ts.ModuleKind[options.module] + ", consider setting module: \"system\" in typescriptOptions to transpile directly to System.register format");
    }
}
function _resolve(dep, parent) {
    if (!parent)
        parent = __moduleName;
    return System.normalize(dep, parent)
        .then(function (normalized) {
        normalized = normalized.split('!')[0];
        normalized = stripDoubleExtension(normalized);
        logger.debug("resolved " + normalized + " (" + parent + " -> " + dep + ")");
        return ts.normalizePath(normalized);
    });
}
function _fetch(address) {
    return System.fetch({ name: address, address: address, metadata: {} })
        .then(function (text) {
        logger.debug("fetched " + address);
        return text;
    });
}
function _lookup(address) {
    var metadata = {};
    return System.locate({ name: address, address: address, metadata: metadata })
        .then(function () {
        logger.debug("located " + address);
        return metadata;
    });
}
