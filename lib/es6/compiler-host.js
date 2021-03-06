import * as ts from 'typescript';
import Logger from './logger';
import { isHtml, isTypescriptDeclaration } from './utils';
var logger = new Logger({ debug: false });
export var HTML_MODULE = "__html_module__";
export var CompilerHost = (function () {
    function CompilerHost(options, builder) {
        if (builder === void 0) { builder = false; }
        this._reportedFiles = [];
        this._options = options || {};
        this._options.module = this.getEnum(this._options.module, ts.ModuleKind, ts.ModuleKind.System);
        this._options.target = this.getEnum(this._options.target, ts.ScriptTarget, ts.ScriptTarget.ES5);
        this._options.jsx = this.getEnum(this._options.jsx, ts.JsxEmit, ts.JsxEmit.None);
        this._options.allowNonTsExtensions = (this._options.allowNonTsExtensions !== false);
        this._options.skipDefaultLibCheck = (this._options.skipDefaultLibCheck !== false);
        this._options.supportHtmlImports = (options.supportHtmlImports === true);
        this._options.resolveAmbientRefs = (options.resolveAmbientRefs === true);
        this._options.noResolve = true;
        this._options.allowSyntheticDefaultImports = (this._options.allowSyntheticDefaultImports !== false);
        this._options.moduleResolution = ts.ModuleResolutionKind.Classic;
        this._options.types = this._options.types || [];
        this._options.typings = this._options.typings || {};
        this._files = {};
        var source = "var __html__: string = ''; export default __html__;";
        if ((this._options.target !== ts.ScriptTarget.ES2015) && (this._options.module !== ts.ModuleKind.ES2015))
            source = source + "export = __html__;";
        var file = this.addFile(HTML_MODULE, source);
        file.dependencies = { list: [], mappings: {} };
        file.checked = true;
        file.errors = [];
        if (this._options.supportHtmlImports) {
            logger.warn("The 'supportHtmlImports' option is deprecated and will shortly be removed");
            logger.warn("Please use TypeScript's new 'wildcard declarations' feature instead");
        }
        if (this._options.resolveAmbientRefs) {
            logger.warn("The 'resolveAmbientRefs' option is deprecated and will shortly be removed");
            logger.warn("Please use External Typings support instead");
        }
        if (this._options.targetLib) {
            logger.warn("The 'targetLib' option is deprecated and will shortly be removed");
            logger.warn("Please use the 'lib' option instead");
            this.options.targetLib = this.getEnum(this._options.targetLib, ts.ScriptTarget, ts.ScriptTarget.ES2015);
        }
        else if (!this._options.lib) {
            this._options.lib = ['es6'];
        }
    }
    CompilerHost.prototype.getEnum = function (enumValue, enumType, defaultValue) {
        if (enumValue == undefined)
            return defaultValue;
        for (var enumProp in enumType) {
            if (enumProp.toLowerCase() === enumValue.toString().toLowerCase()) {
                if (typeof enumType[enumProp] === "string")
                    return enumType[enumType[enumProp]];
                else
                    return enumType[enumProp];
            }
        }
        throw new Error("Unrecognised value [" + enumValue + "]");
    };
    Object.defineProperty(CompilerHost.prototype, "options", {
        get: function () {
            return this._options;
        },
        enumerable: true,
        configurable: true
    });
    CompilerHost.prototype.getDefaultLibFileName = function () {
        return this.getDefaultLibFilePaths()[0];
    };
    CompilerHost.prototype.getDefaultLibFilePaths = function () {
        if (this._options.targetLib === ts.ScriptTarget.ES5)
            return ['typescript/lib/lib.d.ts'];
        else if (this._options.targetLib === ts.ScriptTarget.ES2015)
            return ['typescript/lib/lib.es6.d.ts'];
        else
            return this._options.lib.map(function (libName) { return "typescript/lib/lib." + libName + ".d.ts"; });
    };
    CompilerHost.prototype.useCaseSensitiveFileNames = function () {
        return false;
    };
    CompilerHost.prototype.getCanonicalFileName = function (fileName) {
        return ts.normalizePath(fileName);
    };
    CompilerHost.prototype.getCurrentDirectory = function () {
        return "";
    };
    CompilerHost.prototype.getNewLine = function () {
        return "\n";
    };
    CompilerHost.prototype.readFile = function (fileName) {
        throw new Error("Not implemented");
    };
    CompilerHost.prototype.writeFile = function (name, text, writeByteOrderMark) {
        throw new Error("Not implemented");
    };
    CompilerHost.prototype.getSourceFile = function (fileName) {
        fileName = this.getCanonicalFileName(fileName);
        return this._files[fileName];
    };
    CompilerHost.prototype.getAllFiles = function () {
        var _this = this;
        return Object.keys(this._files).map(function (key) { return _this._files[key]; });
    };
    CompilerHost.prototype.fileExists = function (fileName) {
        return !!this.getSourceFile(fileName);
    };
    CompilerHost.prototype.getDirectories = function () {
        throw new Error("Not implemented");
    };
    CompilerHost.prototype.addFile = function (fileName, text) {
        fileName = this.getCanonicalFileName(fileName);
        var file = this._files[fileName];
        if (!file) {
            this._files[fileName] = ts.createSourceFile(fileName, text, this._options.target);
            logger.debug("added " + fileName);
        }
        else if (file.text != text) {
            this._files[fileName] = ts.createSourceFile(fileName, text, this._options.target);
            this.invalidate(fileName);
            logger.debug("updated " + fileName);
        }
        return this._files[fileName];
    };
    CompilerHost.prototype.invalidate = function (fileName, seen) {
        var _this = this;
        seen = seen || [];
        if (seen.indexOf(fileName) < 0) {
            seen.push(fileName);
            var file = this._files[fileName];
            if (file) {
                file.checked = false;
                file.errors = [];
            }
            Object.keys(this._files)
                .map(function (key) { return _this._files[key]; })
                .forEach(function (file) {
                if (file.dependencies && file.dependencies.list.indexOf(fileName) >= 0) {
                    _this.invalidate(file.fileName, seen);
                }
            });
        }
    };
    CompilerHost.prototype.resolveModuleNames = function (moduleNames, containingFile) {
        var _this = this;
        return moduleNames.map(function (modName) {
            var dependencies = _this._files[containingFile].dependencies;
            if (isHtml(modName) && _this._options.supportHtmlImports) {
                return { resolvedFileName: HTML_MODULE };
            }
            else if (dependencies) {
                var resolvedFileName = dependencies.mappings[modName];
                if (!resolvedFileName) {
                    if (_this._reportedFiles.indexOf(resolvedFileName) < 0) {
                        logger.warn(containingFile + ' -> ' + modName + ' could not be resolved');
                        _this._reportedFiles.push(resolvedFileName);
                    }
                    return undefined;
                }
                else {
                    var isExternalLibraryImport = isTypescriptDeclaration(resolvedFileName);
                    return { resolvedFileName: resolvedFileName, isExternalLibraryImport: isExternalLibraryImport };
                }
            }
            else {
                return ts.resolveModuleName(modName, containingFile, _this._options, _this).resolvedModule;
            }
        });
    };
    return CompilerHost;
}());
