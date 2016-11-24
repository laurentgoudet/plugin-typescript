declare module "logger" {
    export type LoggerOptions = {
        debug?: boolean;
    };
    class Logger {
        private options;
        constructor(options: LoggerOptions);
        log(msg: string): void;
        error(msg: string): void;
        warn(msg: string): void;
        debug(msg: string): void;
    }
    export default Logger;
}
declare module "utils" {
    import * as ts from "typescript";
    export function isAbsolute(filename: string): boolean;
    export function isRelative(filename: string): boolean;
    export function isAmbientImport(filename: string): boolean;
    export function isAmbientReference(filename: string): boolean;
    export function isAmbient(filename: string): boolean;
    export function isTypescript(filename: string): boolean;
    export function isJavaScript(filename: string): boolean;
    export function isSourceMap(filename: string): boolean;
    export function isTypescriptDeclaration(filename: string): boolean;
    export function isHtml(filename: string): boolean;
    export function tsToJs(tsFile: string): string;
    export function tsToJsMap(tsFile: string): string;
    export function convertToDts(anyFile: string): string;
    export function stripDoubleExtension(normalized: string): string;
    export function hasError(diags: Array<ts.Diagnostic>): boolean;
}
declare module "compiler-host" {
    import * as ts from 'typescript';
    export const HTML_MODULE = "__html_module__";
    export type CombinedOptions = PluginOptions & ts.CompilerOptions;
    export type TranspileResult = {
        failure: boolean;
        errors: Array<ts.Diagnostic>;
        js: string;
        sourceMap: string;
    };
    export interface SourceFile extends ts.SourceFile {
        output?: TranspileResult;
        pendingDependencies?: Promise<DependencyInfo>;
        dependencies?: DependencyInfo;
        errors?: ts.Diagnostic[];
        checked?: boolean;
        isLibFile?: boolean;
    }
    export class CompilerHost implements ts.CompilerHost {
        private _options;
        private _files;
        constructor(options: any, builder?: boolean);
        private getEnum(enumValue, enumType, defaultValue);
        readonly options: CombinedOptions;
        getDefaultLibFileName(): string;
        getDefaultLibFilePaths(): string[];
        useCaseSensitiveFileNames(): boolean;
        getCanonicalFileName(fileName: string): string;
        getCurrentDirectory(): string;
        getNewLine(): string;
        readFile(fileName: string): string;
        writeFile(name: string, text: string, writeByteOrderMark: boolean): void;
        getSourceFile(fileName: string): SourceFile;
        getAllFiles(): SourceFile[];
        fileExists(fileName: string): boolean;
        getDirectories(): string[];
        addFile(fileName: string, text: string): SourceFile;
        private invalidate(fileName, seen?);
        private _reportedFiles;
        resolveModuleNames(moduleNames: string[], containingFile: string): ts.ResolvedModule[];
    }
}
declare module "transpiler" {
    import { CompilerHost, TranspileResult } from "compiler-host";
    export class Transpiler {
        private _host;
        private _options;
        constructor(host: CompilerHost);
        transpile(sourceName: string): TranspileResult;
    }
}
declare module "resolver" {
    import { CompilerHost } from "compiler-host";
    export class Resolver {
        private _host;
        private _resolve;
        private _lookup;
        private _declarationFiles;
        constructor(host: CompilerHost, resolve: ResolveFunction, lookup: LookupFunction);
        resolve(sourceName: string): Promise<DependencyInfo>;
        registerDeclarationFile(sourceName: string): void;
        private resolveDependencies(sourceName, info);
        private resolveReference(referenceName, sourceName);
        private resolveTypeReference(referenceName, sourceName);
        private resolveImport(importName, sourceName);
        private lookupTyping(importName, sourceName, address);
        private getPackageName(importName);
        private resolveTyping(typings, packageName, sourceName, address);
        private lookupAtType(importName, sourceName);
    }
}
declare module "type-checker" {
    import * as ts from 'typescript';
    import { CompilerHost } from "compiler-host";
    export class TypeChecker {
        private _host;
        private _options;
        constructor(host: CompilerHost);
        check(): ts.Diagnostic[];
        forceCheck(): ts.Diagnostic[];
        hasErrors(): boolean;
        private getCandidates(force);
        private isCheckable(candidate, candidatesMap);
        private getAllDiagnostics(candidates);
    }
}
declare module "format-errors" {
    import * as ts from 'typescript';
    import Logger from "logger";
    export function formatErrors(diags: ts.Diagnostic[], logger: Logger): void;
}
declare module "factory" {
    import { CompilerHost } from "compiler-host";
    import { Transpiler } from "transpiler";
    import { Resolver } from "resolver";
    import { TypeChecker } from "type-checker";
    export interface FactoryOutput {
        host: CompilerHost;
        transpiler: Transpiler;
        resolver: Resolver;
        typeChecker: TypeChecker;
        options: PluginOptions;
    }
    export function createFactory(sjsconfig: PluginOptions, builder: boolean, _resolve: ResolveFunction, _fetch: FetchFunction, _lookup: LookupFunction): Promise<FactoryOutput>;
}
declare module "plugin" {
    export function getFactory(): any;
    export function translate(load: Module): Promise<any>;
    export function instantiate(load: any, systemInstantiate: any): Promise<any>;
    export function bundle(): any[] | Promise<any[]>;
}
