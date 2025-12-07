type EvalState =
  | "LUA_OK"
  | "LUA_YIELD"
  | "LUA_ERRRUN"
  | "LUA_ERRSYNTAX"
  | "LUA_ERRMEM"
  | "LUA_ERRERR";
export declare const version: string;
export declare const doFile: (
  filepath: string,
  input: { [key: string]: any }
) => { state: EvalState; return: any; log: string; error?: string };
export declare const doString: (
  luaCode: string,
  input: { [key: string]: any }
) => { state: EvalState; return: any; log: string; error?: string };
