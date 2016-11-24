import { CompilerHost } from './compiler-host';
export declare class Resolver {
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
