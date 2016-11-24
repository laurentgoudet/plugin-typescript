import { CompilerHost } from './compiler-host';
import { Transpiler } from './transpiler';
import { Resolver } from './resolver';
import { TypeChecker } from './type-checker';
export interface FactoryOutput {
    host: CompilerHost;
    transpiler: Transpiler;
    resolver: Resolver;
    typeChecker: TypeChecker;
    options: PluginOptions;
}
export declare function createFactory(sjsconfig: PluginOptions, builder: boolean, _resolve: ResolveFunction, _fetch: FetchFunction, _lookup: LookupFunction): Promise<FactoryOutput>;
