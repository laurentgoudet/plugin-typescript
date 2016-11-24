import * as ts from 'typescript';
import { CompilerHost } from './compiler-host';
export declare class TypeChecker {
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
