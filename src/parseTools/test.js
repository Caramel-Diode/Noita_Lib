import fs from "fs";
import http from "http";
import path from "path";
import { exec } from "child_process";
import { platform } from "os";
import { URL } from "url";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

/** @typedef {"LUA_OK"|"LUA_YIELD"|"LUA_ERRRUN"|"LUA_ERRSYNTAX"|"LUA_ERRMEM"|"LUA_ERRERR"} LuaEvalState */

/**
 * @type {{
 * doFile:(filepath:String,input: { [key: String]: any }) => {state: LuaEvalState, return: any},
 * doString(luaCode:String,input: { [key: String]: any }) => {state: LuaEvalState, return: any}
 * }}
 */
const lua = require(`../luaForNodejs/build/Release/lua`);
const dataPath = `D:/Project/Noita_data_wak/2024.3.27/data`;

const result = lua.doFile(path.join(import.meta.dirname, "spell", "generate_js_code.lua"), { dataPath });
const resultObj = new Function(`${result.return}; return spellBaseDatas`)();
fs.writeFileSync("test.txt",result.return)
// console.log(resultObj);
// console.log(resultObj.filter(e => e.modifierAction_shot_effects.length > 0).map(e => ({ [e.id]: e.modifierAction_shot_effects[0] })));
