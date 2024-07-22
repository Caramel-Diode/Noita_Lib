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
 * doFile:(filepath:String,input: { [key: String]: any },[openlibs]) => {state: LuaEvalState, return: any, error?:String},
 * doString(luaCode:String,input: { [key: String]: any },[openlibs]) => {state: LuaEvalState, return: any, error?:String}
 * }}
 */
const lua = require(`../luaForNodejs/build/Release/lua`);

// 新函数补丁
Promise.withResolvers ??= () => {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
};

const dataPath = `D:/Project/Noita_data_wak/2024.7.10/data`;

class LuaError extends Error {
    constructor(msg) {
        super(msg);
    }
}

/**
 * 导入js文件里的内容
 * @param {String} path js文件路径
 * @param {String} $return 导出的变量名
 * @param {Object} context 上下文
 */
const include = (path, $return, context) => {
    const context_varNames = [];
    const context_varValues = [];
    if (context) {
        for (const key in context) {
            context_varNames.push(key);
            context_varValues.push(context[key]);
        }
    }
    return new Function(...context_varNames, fs.readFileSync(path).toString() + `return ${$return}`)(...context_varValues);
};

/** @type {typeof XML.parse} */
const parseXML = include("./src/public/XML.js", "XML.parse");

const config = (() => {
    /** @type {DocumentNode} */
    const doc = parseXML(fs.readFileSync(`./src/parseTools/config.xml`).toString());
    const fileTypeEs = doc.childNodes.query("FileType");
    const pathEs = doc.childNodes.query("Path");
    const fileEs = doc.childNodes.query("File");
    const pathMap = new Map();

    const $return = {
        file: new Map(),
        fileType: new Map(),
        /** @param {String} url */
        getPath(url) {
            for (const [urlStart, mapPath] of pathMap) {
                if (url.startsWith(urlStart)) {
                    return mapPath + url.slice(urlStart.length);
                }
            }
            return url;
        }
    };
    for (const fileType of fileTypeEs) {
        const attr = fileType.attr;
        $return.fileType.set(attr.get("extension"), attr.get("mime-type"));
    }
    for (const path of pathEs) {
        const attr = path.attr;
        pathMap.set(attr.get("url"), attr.get("map"));
    }
    for (const file of fileEs) {
        const attr = file.attr;
        $return.file.set(attr.get("name"), attr.get("map"));
    }
    return $return;
})();

const server = http.createServer(async (req, res) => {
    if (req.url) {
        const $path = config.getPath(req.url);
        // console.log($path);
        if ($path.startsWith(`/call.lua/`)) {
            const url = new URL($path, `http://localhost:${port}`);
            const tempLuaPath = url.searchParams.get("path") ?? "";
            const mimeType = config.fileType.get(path.extname(url.pathname));
            if (mimeType) res.setHeader("Content-Type", mimeType);
            let luaPath = "";
            if (tempLuaPath.startsWith("/")) luaPath = config.getPath(tempLuaPath); // 服务路径解析
            else {
                // 相对路径解析
                const from = new URL(req.headers.referer);
                luaPath = config.getPath(path.dirname(from.pathname) + "/" + tempLuaPath);
            }
            if (fs.existsSync(luaPath)) {
                // 这里向lua环境提供了dataPath 即Noita解包数据的路径
                const result = lua.doFile(path.resolve(luaPath), { dataPath }).return;
                res.statusCode = 200;
                res.end(result);
            } else {
                res.statusCode = 400;
                res.end(`lua路径无效`);
                console.warn("lua路径无效", luaPath);
            }
        } else if (fs.existsSync($path)) {
            const mimeType = config.fileType.get(path.extname($path));
            res.setHeader("Content-Type", mimeType);
            res.statusCode = 200;
            let data = fs.readFileSync($path);
            if (mimeType === "text/html") {
                const doc = parseXML(data.toString());
                const headElement = doc.childNodes.query("head")[0];
                const bodyElement = doc.childNodes.query("body")[0];
                data = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <!-- 自动追加样式 -->
                    <link rel="stylesheet" href="/style.css">
                    <!-- 自动追加脚本 -->
                    <script src="/public/XML.js"></script>
                    <script src="/public/CSV.js"></script>
                    <script src="/util.js"></script>
                    ${headElement.toString("RAW")}
                </head>
                <body>${bodyElement.toString("RAW")}</body>
                </html>
                `;
            }
            res.end(data);
            // res.end(fs.readFileSync($path));
        } else {
            res.setHeader("Content-Type", "text/html");
            res.statusCode = 404;
            res.end(fs.readFileSync(config.file.get("404.html")));
        }
    } else {
        res.setHeader("Content-Type", "text/html");
        res.statusCode = 200;
        res.end(config.file.get("index.html"));
    }
});
const port = 9191;
server.listen(port, () => {
    const url = `http://localhost:${port}/index.html`;
    console.log(`已在 http://localhost:${port} 开启服务`);

    const os = platform();
    let command;
    if (os === "win32") command = `start `;
    else if (os === "darwin") command = `open `;
    else command = `xdg-open `;

    exec(`${command}${url}`, (error, stdout, stderr) => {
        if (error) console.error(error);
    });
});
