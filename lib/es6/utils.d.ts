import * as ts from "typescript";
export declare function isAbsolute(filename: string): boolean;
export declare function isRelative(filename: string): boolean;
export declare function isAmbientImport(filename: string): boolean;
export declare function isAmbientReference(filename: string): boolean;
export declare function isAmbient(filename: string): boolean;
export declare function isTypescript(filename: string): boolean;
export declare function isJavaScript(filename: string): boolean;
export declare function isSourceMap(filename: string): boolean;
export declare function isTypescriptDeclaration(filename: string): boolean;
export declare function isHtml(filename: string): boolean;
export declare function tsToJs(tsFile: string): string;
export declare function tsToJsMap(tsFile: string): string;
export declare function convertToDts(anyFile: string): string;
export declare function stripDoubleExtension(normalized: string): string;
export declare function hasError(diags: Array<ts.Diagnostic>): boolean;
