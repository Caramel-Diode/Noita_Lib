// const fs = require("fs");
import fs from "fs";
import $CSS from "./util.css.js";
import $JS from "./util.javascript.js";
import md5 from "./md5.js";

const path = {
    src: "./src",
    dist: "./dist",
    dist2: "D:/Project/Web/NoitaTest/js"
};

class File {
    /**
     * @typedef {Object} EmbeddingPoint
     * @prop {String} src 插入源
     * @prop {Array<String>} srcChars 插入源字符数组(缓存)
     * @prop {String} data 插入数据
     */
    /** @typedef {"js"|"css"|"bin"} FileType */

    /**
     * @type {Map<String,File>} 文件缓存
     */
    static #fileCache = new Map();
    static readFileopt_text = { encoding: "utf8", flag: "r" };
    static readFileopt_bin = { encoding: "base64", flag: "r" };
    static typeMap = new Map([
        ["js", "js"],
        ["css", "css"],
        ["png", "bin"],
        ["webp", "bin"]
    ]);
    /** 嵌入点 @type {Array<EmbeddingPoint>} */ embeddingPoints = [];
    /** 连接数据 @type {Array<String>} */ #connectData = [];
    /** 是否嵌入了二进制文件 */
    embededBin = false;

    /**
     * @param {String} path 文件路径
     * @param {Boolean} [neddAddLog] 文件路径
     */
    constructor(path) {
        const _ = new.target;

        const pathData = path.split("/");
        /** @type {String} 文件名 */ this.name = pathData.pop();
        /** @type {String} 扩展名 */ this.extensionName = path.split(".").at(-1);
        /** @type {String} 所在路径 */ this.dirpath = pathData.join("/");
        /** @type {FileType} 类型 */ this.type = _.typeMap.get(this.extensionName);
        /** @type {String} 数据 */ this.data = "";
        /** @type {Number} 体积 */ this.size = fs.statSync(path).size;
        switch (this.type) {
            case "js":
                this.data = $JS.min(fs.readFileSync(path, _.readFileopt_text));
                break;
            case "css": //作为字符串嵌入 取消转义
                this.data = `String.raw\`${$CSS.min(fs.readFileSync(path, _.readFileopt_text))}\``;
                break;
            case "bin": //作为字符串嵌入
                switch (this.extensionName) {
                    case "png":
                        this.data = `\`data:image/png;base64,${fs.readFileSync(path, _.readFileopt_bin)}\``;
                        break;
                    case "webp":
                        this.data = `\`data:image/webp;base64,${fs.readFileSync(path, _.readFileopt_bin)}\``;
                        // console.log(this.data);
                        break;
                }
                break;
            default:
                this.data = fs.readFileSync(path, _.readFileopt_text);
        }
    }

    /** 获取文件的MD5 */
    async md5() {
        return await md5(this.dirpath + "/" + this.name);
    }

    #loadEmbeddingPoint() {
        this.#connectData = [];
        this.embeddingPoints = []; // 清空可能之前存入的数据
        const length = this.data.length;
        /**
         * #### 匹配状态
         * ##### 匹配 embed(`${path}`) 子串作为插入点
         * ---
         * 0. 未开始 | 匹配到 ";" 强制匹配结束
         * 1. 匹配函数名中 e
         * 2. 匹配函数名中 m
         * 3. 匹配函数名中 b
         * 4. 匹配函数名中 e
         * 5. 匹配函数名中 d
         * 6. 匹配到 "("
         * 7. 匹配到起始反引号 "`" 匹配路径中
         * 8. 匹配到结束反引号 "`"
         * 9. 匹配到 ")" *允许结束*
         */
        let matchState = 0;
        /**
         * 字符串片段缓存
         * @type {Array<String>}
         */
        let partCache = [];
        let tempCache = [];
        /** @type {EmbeddingPoint} */ let embeddingPoint = {
            srcChars: [],
            relativePath: false,
            toString() {
                return this.data;
            }
        };
        let embeddingIndex = 0;
        /** @type {"e"|"m"|"b"|"d"|"("|"`"|")"|";"} */
        let char;
        const matchFail = () => {
            matchState = 0;
            embeddingPoint = {
                srcChars: [],
                toString() {
                    return this.data;
                }
            };
            if (tempCache.length > 0) {
                partCache.push(...tempCache);
                tempCache = [];
            }
            partCache.push(char);
        };
        const matchSucceed = () => {
            tempCache.push(char);
            matchState++;
        };
        for (let i = 0; i < length; i++) {
            char = this.data[i];
            if (matchState === 7) {
                tempCache.push(char);
                if (char !== "`") {
                    if (char === "#") embeddingPoint.relativePath = true; //#开头表示相对路径
                    else embeddingPoint.srcChars.push(char);
                } else matchState++;
            } else {
                switch (char) {
                    case "e":
                        if (matchState === 0) {
                            matchSucceed();
                            if (partCache.length > 0) {
                                this.#connectData.push(partCache.join(""));
                                partCache = [];
                            }
                        } else if (matchState === 3) matchSucceed();
                        else matchFail();
                        break;
                    case "m":
                        if (matchState === 1) matchSucceed();
                        else matchFail();
                        break;
                    case "b":
                        if (matchState === 2) matchSucceed();
                        else matchFail();
                        break;
                    case "d":
                        if (matchState === 4) matchSucceed();
                        else matchFail();
                        break;
                    case "(":
                        if (matchState === 5) matchSucceed();
                        else matchFail();
                        break;
                    case "`":
                        if (matchState === 6) matchSucceed();
                        else matchFail();
                        break;
                    case ")":
                        if (matchState === 8) {
                            matchState = 0;
                            const tempPath = embeddingPoint.srcChars.join("");
                            if (embeddingPoint.relativePath) embeddingPoint.src = `${this.dirpath}/${tempPath}`;
                            else embeddingPoint.src = `${path.src}/${tempPath}`;
                            this.embeddingPoints.push(embeddingPoint);
                            this.#connectData.push(embeddingPoint);
                            embeddingPoint = { srcChars: [] };
                            partCache = [];
                            tempCache = [];
                        } else matchFail();
                        break;
                    default:
                        matchFail();
                }
            }
        }
        this.#connectData.push(partCache.join(""));
    }

    // 传入二进制输出路径后二进制文件将不会以base64嵌入文件 而是会以md5作为文件名输出到该路径
    async embed(binOutputPath) {
        let embededBin = false;
        this.#loadEmbeddingPoint();
        for (let i = 0; i < this.embeddingPoints.length; i++) {
            const embeddingPoint = this.embeddingPoints[i];
            //// 尝试从缓存中获取
            /** @type {File} */ let embeddingFile;
            const src = embeddingPoint.src;
            if (File.#fileCache.has(src)) embeddingFile = File.#fileCache.get(src);
            else {
                embeddingFile = new File(src);
                File.#fileCache.set(src, embeddingFile);
                if (embeddingFile.type !== "bin") await embeddingFile.embed(binOutputPath);
            }

            //// 对于二进制文件判断是否需要使用base64嵌入的模式
            if (embeddingFile.type === "bin") {
                if (binOutputPath) {
                    const filename = (await embeddingFile.md5()) + "." + embeddingFile.extensionName;
                    const _path = binOutputPath + "/" + filename;
                    if (!fs.existsSync(_path)) fs.copyFile(embeddingPoint.src, _path, () => {});
                    embeddingPoint.data = `"${filename}"`;
                } else {
                    this.embededBin = true;
                    embededBin = true;
                    embeddingPoint.data = embeddingFile.data;
                }
            } else {
                if (embeddingFile.embededBin) {
                    if (binOutputPath) {
                        if (!embeddingFile.embedingData) await embeddingFile.embed(binOutputPath);
                        embeddingPoint.data = embeddingFile.embedingData;
                    } else {
                        if (!embeddingFile.embedingData_base64) await embeddingFile.embed();
                        embeddingPoint.data = embeddingFile.embedingData_base64;
                        this.embededBin = true;
                        embededBin = true;
                    }
                } else embeddingPoint.data = embeddingFile.embedingData;
            }
        }

        // 已经嵌入依赖文件的数据
        if (embededBin) this.embedingData_base64 = this.#connectData.join("");
        else this.embedingData = this.#connectData.join("");
    }
}

const index_sf = new File(`${path.src}/index.js`);
await index_sf.embed();
fs.writeFileSync(`${path.dist}/noitaLib.sf.js`, index_sf.embedingData ?? index_sf.embedingData_base64);

// 其它目标
{
    // 测试目录
    fs.writeFileSync(`D:/Project/Web/NoitaTest/js/noitaLib.js`, index_sf.embedingData ?? index_sf.embedingData_base64);
    // 施法教学文档目录
    fs.writeFileSync(`D:/Project/Web/Noita 施法教学文档/noitaLib.js`, index_sf.embedingData ?? index_sf.embedingData_base64);
    // 直播插件目录
    fs.writeFileSync(`D:/Project/Web/直播插件/noitaLib.js`, index_sf.embedingData ?? index_sf.embedingData_base64);
}

const index_esm_sf = new File(`${path.src}/index.esm.js`);
await index_esm_sf.embed();
fs.writeFileSync(`${path.dist}/noitaLib.esm.sf.js`, index_esm_sf.embedingData ?? index_esm_sf.embedingData_base64);

const index_common = new File(`${path.src}/index.js`);
await index_common.embed(`${path.dist}`);
fs.writeFileSync(`${path.dist}/noitaLib.js`, index_common.embedingData);

const index_esm_common = new File(`${path.src}/index.esm.js`);
await index_esm_common.embed(`${path.dist}`);
fs.writeFileSync(`${path.dist}/noitaLib.esm.js`, index_esm_common.embedingData);

// const params = process.argv.slice(2);
// if (!params.includes("-nolog")) {
// }
