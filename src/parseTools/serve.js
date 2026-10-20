import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import os from "node:os";
import child_process from "node:child_process";

import { lua, noitaDataPath, saveData, openURL, XML, getMimeType, serverConfig, homePage } from "./serverUtil.js";
import { generateAnimalsEntitiesPaths } from "./generateAnimalsEntitiesPaths.js";

generateAnimalsEntitiesPaths(noitaDataPath);

const port = 9191;
const server = http.createServer(async (req, res) => {
    if (req.url === "/" || !req.url) {
        res.setHeader("Content-Type", "text/html");
        res.statusCode = 200;
        return res.end(homePage());
    }

    const $path = serverConfig.getPath(req.url);
    // console.log($path);
    if ($path.startsWith(`/call.lua/`)) {
        const url = new URL($path, `http://localhost:${port}`);
        const tempLuaPath = url.searchParams.get("path") ?? "";
        res.setHeader("Content-Type", getMimeType(url.pathname));
        let luaPath = "";
        if (tempLuaPath.startsWith("/"))
            luaPath = serverConfig.getPath(tempLuaPath); // 服务路径解析
        else {
            // 相对路径解析
            const from = new URL(req.headers.referer);
            luaPath = serverConfig.getPath(path.dirname(from.pathname) + "/" + tempLuaPath);
        }
        if (fs.existsSync(luaPath)) {
            // 这里向lua环境提供了dataPath 即Noita解包数据的路径
            const result = lua.doFile(path.resolve(luaPath), { dataPath: noitaDataPath }, true).return;
            res.statusCode = 200;
            res.end(result);
        } else {
            res.statusCode = 400;
            res.end(`lua路径无效`);
            console.warn("lua路径无效", luaPath);
        }
    } else if (fs.existsSync($path)) {
        const mimeType = getMimeType($path);

        res.setHeader("Content-Type", mimeType);
        res.statusCode = 200;
        // 自动注入依赖css和js
        if (mimeType.startsWith("text/html")) {
            let data = fs.readFileSync($path);
            const doc = XML.parse(data.toString());
            const singleTag = new Set(["br", "hr", "img", "input", "link", "meta", "area", "base", "col", "embed", "source", "track", "wbr"]);
            doc.childNodes.query(node => {
                if (!(node instanceof XML.ElementNode)) return false;
                if (!singleTag.has(node.tagName)) node.childNodes.push(new XML.TextNode(""));
                return true;
            });
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
                    <script src="/public/htmlTools.js"></script>
                    <script src="/public/cssTools.js"></script>
                    <script src="/util.js"></script>
                    ${headElement.toString().slice(6, -7)}
                </head>
                ${bodyElement.toString("RAW")}
                </html>
                `;

            res.end(data);
        } else {
            if (mimeType === "image/png") {
                res.setHeader("Cache-Control", "max-age=90");
                res.setHeader("Expires", new Date(Date.now() + 90000).toGMTString());
            }
            const stream = fs.createReadStream($path);
            stream.pipe(res);
        }
    } else {
        {
            const url = new URL($path, `http://localhost:${port}`);
            const pathToSave = url.searchParams.get("save-file");
            if (pathToSave) {
                const chunks = [];
                req.addListener("data", chunk => chunks.push(chunk));
                req.addListener("end", () => {
                    saveData(pathToSave, Buffer.concat(chunks));
                });
                res.statusCode = 200;
                return res.end();
            }
        }
        res.setHeader("Content-Type", "text/html");
        res.statusCode = 404;
        res.end(fs.readFileSync(serverConfig.getPath("404.html")));
    }
});

server.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log(`已在 http://localhost:${port} 开启服务`);
    openURL(url);
});
