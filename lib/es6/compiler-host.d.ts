import * as ts from 'typescript';
export declare const HTML_MODULE = "__html_module__";
export declare type CombinedOptions = PluginOptions & ts.CompilerOptions;
export declare type TranspileResult = {
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
export declare class CompilerHost implements ts.CompilerHost {
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
