import fs from "node:fs";
import path from "node:path";
import module from "node:module";
import os from "node:os";
import child_process from "node:child_process";
// 组件目录路径
const componentDirPath = `src/component`;
export const saveData = (pathToSave, data) => fs.writeFile(path.join(componentDirPath, pathToSave), data, err => err && console.log(err));

const require = module.createRequire(import.meta.url);
/** @typedef {"LUA_OK"|"LUA_YIELD"|"LUA_ERRRUN"|"LUA_ERRSYNTAX"|"LUA_ERRMEM"|"LUA_ERRERR"} LuaEvalState */
/**
 * lua 运行时
 * @type {{
 * doFile:(filepath:String,input: { [key: String]: any },openlibs:Boolean) => {state: LuaEvalState, return: any, error?:String},
 * doString(luaCode:String,input: { [key: String]: any },openlibs:Boolean) => {state: LuaEvalState, return: any, error?:String}
 * }}
 */
export const lua = require(`../luaForNodejs/build/Release/lua`);

/** noita data 路径 */
export const noitaDataPath = path.join(os.homedir(), "AppData", "LocalLow", "Nolla_Games_Noita", "data").replaceAll("\\", "/");

// 仅仅支持win32
export const openURL = url => child_process.exec(`start ${url}`, (error, stdout, stderr) => error ?? console.error(error));

/**
 * 用于导入非模块js文件里的内容
 * @param {string} path js文件路径
 * @param {string} $return 导出的变量名
 * @param {object} context 注入上下文的全局变量
 */
export const include = (path, $return, context) => {
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

/**
 * 包装 public/XML.js
 */
export const XML = include("./src/public/XML.js", "XML");

const mimeTypeMap = {
    // 文本 / 标记 / 配置
    ".html": "text/html; charset=utf-8",
    ".htm": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".cjs": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".map": "application/json; charset=utf-8",
    ".xml": "application/xml; charset=utf-8",
    ".txt": "text/plain; charset=utf-8",
    ".log": "text/plain; charset=utf-8",
    ".ini": "text/plain; charset=utf-8",
    ".cfg": "text/plain; charset=utf-8",
    ".conf": "text/plain; charset=utf-8",
    ".env": "text/plain; charset=utf-8",
    ".toml": "text/plain; charset=utf-8",
    ".md": "text/markdown; charset=utf-8",
    ".markdown": "text/markdown; charset=utf-8",
    ".csv": "text/csv; charset=utf-8",
    ".tsv": "text/tab-separated-values; charset=utf-8",
    ".yaml": "text/yaml; charset=utf-8",
    ".yml": "text/yaml; charset=utf-8",
    ".rtf": "application/rtf",

    // 图片
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".avif": "image/avif",
    ".ico": "image/x-icon",
    ".bmp": "image/bmp",
    ".tif": "image/tiff",
    ".tiff": "image/tiff",
    ".heic": "image/heic",
    ".heif": "image/heif",
    ".psd": "image/vnd.adobe.photoshop",
    ".svg": "image/svg+xml",

    // 音频
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".ogg": "audio/ogg",
    ".oga": "audio/ogg",
    ".opus": "audio/opus",
    ".flac": "audio/flac",
    ".m4a": "audio/mp4",
    ".aac": "audio/aac",
    ".wma": "audio/x-ms-wma",
    ".mid": "audio/midi",
    ".midi": "audio/midi",

    // 视频
    ".mp4": "video/mp4",
    ".m4v": "video/x-m4v",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
    ".mkv": "video/x-matroska",
    ".avi": "video/x-msvideo",
    ".flv": "video/x-flv",
    ".wmv": "video/x-ms-wmv",
    ".mpg": "video/mpeg",
    ".mpeg": "video/mpeg",
    ".ts": "video/mp2t",
    ".3gp": "video/3gpp",

    // 字体
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".otf": "font/otf",
    ".eot": "application/vnd.ms-fontobject",

    // 文档
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".ppt": "application/vnd.ms-powerpoint",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".odt": "application/vnd.oasis.opendocument.text",
    ".ods": "application/vnd.oasis.opendocument.spreadsheet",
    ".odp": "application/vnd.oasis.opendocument.presentation",
    ".epub": "application/epub+zip",
    ".mobi": "application/x-mobipocket-ebook",

    // 压缩包 / 镜像
    ".zip": "application/zip",
    ".rar": "application/vnd.rar",
    ".7z": "application/x-7z-compressed",
    ".gz": "application/gzip",
    ".tgz": "application/gzip",
    ".tar": "application/x-tar",
    ".bz2": "application/x-bzip2",
    ".xz": "application/x-xz",
    ".zst": "application/zstd",
    ".iso": "application/x-iso9660-image",
    ".img": "application/x-iso9660-image",
    ".dmg": "application/x-apple-diskimage",
    ".cab": "application/vnd.ms-cab-compressed",

    // 程序 / 安装包
    ".exe": "application/x-msdownload",
    ".dll": "application/x-msdownload",
    ".msi": "application/x-msi",
    ".apk": "application/vnd.android.package-archive",
    ".jar": "application/java-archive",
    ".deb": "application/vnd.debian.binary-package",
    ".rpm": "application/x-rpm",
    ".wasm": "application/wasm",

    // 数据库 / 数据
    ".db": "application/vnd.sqlite3",
    ".sqlite": "application/vnd.sqlite3",
    ".sqlite3": "application/vnd.sqlite3",
    ".torrent": "application/x-bittorrent",

    // 源代码
    ".c": "text/x-c; charset=utf-8",
    ".h": "text/x-c; charset=utf-8",
    ".cpp": "text/x-c++; charset=utf-8",
    ".hpp": "text/x-c++; charset=utf-8",
    ".cs": "text/x-csharp; charset=utf-8",
    ".java": "text/x-java; charset=utf-8",
    ".py": "text/x-python; charset=utf-8",
    ".rb": "text/x-ruby; charset=utf-8",
    ".go": "text/x-go; charset=utf-8",
    ".rs": "text/x-rust; charset=utf-8",
    ".swift": "text/x-swift; charset=utf-8",
    ".kt": "text/x-kotlin; charset=utf-8",
    ".php": "text/x-php; charset=utf-8",
    ".lua": "text/x-lua; charset=utf-8",
    ".sql": "text/x-sql; charset=utf-8",
    ".sh": "text/x-shellscript; charset=utf-8",
    ".bat": "text/x-msdos-batch; charset=utf-8",
    ".cmd": "text/x-msdos-batch; charset=utf-8",
    ".ps1": "text/x-powershell; charset=utf-8"
};

/**
 *
 * @param {string} filepath
 * @returns {string} mimetype
 */
export const getMimeType = filepath => mimeTypeMap[path.extname(filepath).toLowerCase()] ?? "application/octet-stream";

const pathMap = {
    "404.html": "./src/parseTools/404.html",
    "util.js": "./src/parseTools/util.js",
    // 不存在的图片文件重定向
    "/data/generated/material_icons/air.png": "./src/parseTools/material/air.png",
    "/data/generated/material_icons/plastic_grey.png": "./src/parseTools/material/air.png",
    "/data/generated/material_icons/plastic_grey_molten.png": "./src/parseTools/material/air.png",
    
    "/data/": noitaDataPath + "/",
    "/public/": "./src/public/",
    "/call.lua/": "/call.lua/", // 执行Lua 不做映射处理
    "/": "./src/parseTools/"
};

export const serverConfig = (() => {
    const $return = {
        /** @param {String} url */
        getPath(url) {
            for (const [urlStart, mapPath] of Object.entries(pathMap)) {
                if (url.startsWith(urlStart)) {
                    return mapPath + url.slice(urlStart.length);
                }
            }
            return url;
        }
    };
    return $return;
})();

const escapeHtml = (() => {
    const regex = /[&<>"']/g;
    const escape_map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    };
    const replacefn = char => escape_map[char];
    return str => str.replace(regex, replacefn);
})();

export const homePage = () => {
    const listItems = [];
    for (const e of fs.readdirSync("./src/parseTools/", { withFileTypes: true })) {
        if (!e.isDirectory()) continue;
        const indexPath = e.parentPath + e.name + "/index.html";
        if (!fs.existsSync(indexPath)) continue;
        const doc = XML.parse(fs.readFileSync(indexPath, "utf8"));
        const title = doc.xmlObject.html[0].head[0].title[0]("text")[0];
        listItems.push(`<li><a href="${e.name + "/index.html"}">${escapeHtml(title)}</a></li>`);
    }
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Noita数据解析工具</title>
    <style>
        * { padding: 0; margin: 0; box-sizing: border-box; }
        :root { background: #1F1F1F; color: #eeeeee; }
        body { display: grid; place-items: center; place-content: center; height: 100vh; width: 100vw; }
        h1 {margin-bottom: 20px;}
        ul { display: flex; gap: 15px; list-style: none; }
        a { color: inherit; }
    </style>
</head>
<body>
    <h1>数据解析</h1>
    <nav><ul>${listItems.join("")}</ul></nav>
</body>
</html>`;
};
