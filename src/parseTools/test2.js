import fs from "fs";
import http from "http";
import path from "path";
import { exec } from "child_process";
import { platform } from "os";
import { URL } from "url";
import { createRequire } from "module";
import { inflate } from "zlib";
const require = createRequire(import.meta.url);

/** @typedef {"LUA_OK"|"LUA_YIELD"|"LUA_ERRRUN"|"LUA_ERRSYNTAX"|"LUA_ERRMEM"|"LUA_ERRERR"} LuaEvalState */

/**
 * @type {{
 * doFile:(filepath:String,input: { [key: String]: any }) => {state: LuaEvalState, return: any},
 * doString(luaCode:String,input: { [key: String]: any }) => {state: LuaEvalState, return: any}
 * }}
 */

const lua = require(`../luaForNodejs/build/Release/lua`);

const result = lua.doString(`
    print(value)
    return value
`,
 { value: Infinity }
);

console.log(result);
