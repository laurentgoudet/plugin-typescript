export declare type LoggerOptions = {
    debug?: boolean;
};
declare class Logger {
    private options;
    constructor(options: LoggerOptions);
    log(msg: string): void;
    error(msg: string): void;
    warn(msg: string): void;
    debug(msg: string): void;
}
export default Logger;
