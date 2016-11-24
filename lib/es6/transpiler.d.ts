import { CompilerHost, TranspileResult } from './compiler-host';
export declare class Transpiler {
    private _host;
    private _options;
    constructor(host: CompilerHost);
    transpile(sourceName: string): TranspileResult;
}
