const fs = require("fs");
const path = {
    src: "./src",
    dist: "./dist",
    log: "./log",
    dist2: "D:/Project/Web/NoitaTest/js"
};

/** 工具集 */
const util = {
    /**
     * 最小化css文件
     * @param {String} d 待压缩字符串
     * @returns {String} 结果文本
     */
    min_css(d) {
        const result = [];
        let lastChar = " ";
        const reg_needBlank = /[\w%+-.()]/; //呃.. 在css函数clac中会出现 百分比数值的运算 所以这里应该包含百分号
        const dL = d.length;
        let type1_string_state = 0; //""类型字符串匹配状态 1正在字符串中 0在字符串外
        let type2_string_state = 0; //''类型字符串匹配状态 1正在字符串中 0在字符串外
        let comment_state = 0; // /**/类型注释匹配状态 0未匹配到字符 1匹配到首个字符 2正在注释中 -1匹配到首个结束字符
        for (let i = 0; i < dL; i++) {
            if (comment_state === 2) {
                if (d[i] === "*") comment_state = -1;
            } else if (comment_state === -1) {
                if (d[i] === "/") comment_state = 0;
                else comment_state = 2;
            } else if (type1_string_state === 1) {
                result.push(d[i]);
                if (d[i] === '"') {
                    type1_string_state = 0;
                    lastChar = '"';
                }
            } else if (type2_string_state === 1) {
                result.push(d[i]);
                if (d[i] === "'") {
                    type2_string_state = 0;
                    lastChar = "'";
                }
            } else if (d[i] !== "\r" && d[i] !== "\n") {
                if (lastChar === " ") {
                    if (!reg_needBlank.test(d[i])) {
                        result.pop();
                        lastChar = result[result.length - 1];
                    }
                }
                if (d[i] === " ") {
                    if (reg_needBlank.test(lastChar)) {
                        result.push(" ");
                        lastChar = " ";
                    }
                } else {
                    if (d[i] === "/") {
                        result.push("/");
                        lastChar = "/";
                        if (comment_state === 0) comment_state = 1;
                        else comment_state = 0;
                    } else if (d[i] === "*") {
                        if (comment_state === 1) {
                            comment_state = 2;
                            result.pop();
                            lastChar = result[result.length - 1];
                        } else {
                            result.push("*");
                            lastChar = "*";
                        }
                    } else {
                        comment_state = 0;
                        if (d[i] === '"') {
                            type1_string_state = 1;
                            result.push('"');
                        } else if (d[i] === "'") {
                            type2_string_state = 1;
                            result.push("'");
                        } else {
                            result.push(d[i]);
                            lastChar = d[i];
                        }
                    }
                }
            }
        }
        return result.join("").replaceAll(/0+\.(?=[d])/g, ".");
    },
    /**
     * 最小化js文件
     * @param {String} d 待压缩字符串
     * @returns {String} 结果文本
     */
    min_js(d) {
        const result = [];
        let lastChar = "";
        let char = "";
        const reg_identifier = /[\w$]/;
        let type1_string_state = 0; //``类型字符串匹配状态 1正在字符串中 0在字符串外
        let type2_string_state = 0; //""类型字符串匹配状态 1正在字符串中 0在字符串外
        let type3_string_state = 0; //''类型字符串匹配状态 1正在字符串中 0在字符串外
        let type1_comment_sate = 0; // //类型注释匹配状态 0未匹配到字符 1匹配到首个字符 2正在注释中
        let type2_comment_sate = 0; // /**/类型注释匹配状态 0未匹配到字符 1匹配到首个字符 2正在注释中 -1匹配到首个结束字符
        const dL = d.length;
        for (let i = 0; i < dL; i++) {
            char = d[i];
            if (type1_comment_sate === 2) {
                if (char === "\n") type1_comment_sate = 0; // 行注释结束
            } else if (type2_comment_sate === 2) {
                if (char === "*") type2_comment_sate = -1;
            } else if (type2_comment_sate === -1) {
                if (char === "/") type2_comment_sate = 0; // 块注释结束
                else type2_comment_sate = 2;
            } else if (type1_string_state === 1) {
                result.push(char);
                if (char === "`") {
                    // 跨行字符串结束
                    type1_string_state = 0;
                    lastChar = "`";
                }
            } else if (type2_string_state === 1) {
                result.push(char);
                if (char === '"') {
                    // 双引号字符串结束
                    type2_string_state = 0;
                    lastChar = '"';
                }
            } else if (type3_string_state === 1) {
                result.push(char);
                if (char === "'") {
                    // 单引号字符串结束
                    type3_string_state = 0;
                    lastChar = "'";
                }
            } else if (char !== "\r" && char !== "\n") {
                //换行符一律去除
                if (lastChar === " ") {
                    if (!reg_identifier.test(char)) {
                        result.pop(); //检查上个空格是否有必要性 无则去除
                        lastChar = result[result.length - 1];
                    }
                }
                if (char === " ") {
                    if (reg_identifier.test(lastChar)) {
                        //检查空格是否有必要性 无则去除
                        result.push(" ");
                        lastChar = " ";
                    }
                } else if (char === "/") {
                    if (type1_comment_sate === 1) {
                        // 行注释语法成立 删除之前的一个 "/"
                        result.pop();
                        lastChar = result[result.length - 1];
                        type1_comment_sate = 2;
                        type2_comment_sate = 0;
                    } else {
                        result.push("/");
                        lastChar = "/";
                        type1_comment_sate = 1;
                        type2_comment_sate = 1;
                    }
                } else {
                    type1_comment_sate = 0; // 非 "/" 行级语法不成立 状态初始化
                    if (char === "*") {
                        if (type2_comment_sate === 1) {
                            // 块注释语法成立 删除之前的一个 "/"
                            result.pop();
                            lastChar = result[result.length - 1];
                            type2_comment_sate = 2;
                        } else {
                            result.push("*");
                            lastChar = "*";
                        }
                    } else {
                        type2_comment_sate = 0; // 非 "*" 块级语法不成立 状态初始化
                        if (char === "`") {
                            // 跨行字符串语法成立
                            type1_string_state = 1;
                            result.push("`");
                        } else if (char === '"') {
                            // 双引号字符串语法成立
                            type2_string_state = 1;
                            result.push('"');
                        } else if (char === "'") {
                            // 单引号字符串语法成立
                            type3_string_state = 1;
                            result.push("'");
                        } else {
                            result.push(char);
                            lastChar = char;
                        }
                    }
                }
            }
        }
        return result.join("").replaceAll(/0+\.(?=[d])/g, "."); // 压缩小数表达式
    },
    embed_files: (() => {
        let matchData = [];
        /** 重置匹配计数器 */
        const resetMatchDataCount = () => {
            for (let e of matchData) e.count = 0;
        };
        /**
         * @param {Array} targets 被替换数据
         * @param {Array} datas 替换数据
         */
        return (targets, datas) => {
            /** 被替换数据长度 */
            const tL = targets.length;
            /** 替换数据长度 */
            const dL = datas.length;
            const results = [];
            matchData = [];
            // 初始化匹配计数数据
            for (let i = 0; i < dL; i++) {
                matchData.push({
                    keyword: `"${datas[i].filename}"`,
                    count: 0,
                    keywordLength: datas[i].filename.length + 2
                });
            }
            for (let i = 0; i < tL; i++) {
                let tDL = targets[i].data.length;
                /** 结果替换 */
                const data = [];
                for (let j = 0; j < tDL; j++) {
                    // 获取当前字符
                    const char = targets[i].data[j];
                    data.push(char);
                    // 进入datas匹配关键词
                    for (let k = 0; k < dL; k++) {
                        // console.log(`当前字符:${char}\t匹配字符:${matchData[k].keyword[matchData[k].count]}`);
                        if (char === matchData[k].keyword[matchData[k].count]) {
                            // console.log(`${matchData[k].keyword} | ${matchData[k].keyword[matchData[k].count]} 匹配成功 计数器:${matchData[k].count} / ${matchData[k].keywordLength - 1}`);
                            matchData[k].count += 1;
                            if (matchData[k].count === matchData[k].keywordLength) {
                                // 匹配成功字符数等于关键词字符数时匹配成功
                                // console.log(`匹配成功:${matchData[k].keyword} 移除字符数:${matchData[k].keywordLength}`);
                                data.splice(
                                    // 替换数据
                                    /* 删除起始索引 */ data.length - matchData[k].keywordLength,
                                    /* 删除长度 */ matchData[k].keywordLength,
                                    /* 新增数据 */ datas[k].data
                                );
                                resetMatchDataCount(); // 重置所有匹配计数器
                                break;
                            }
                        } else {
                            // 匹配失败计数器归零
                            // console.log(`${matchData[k].keyword} | ${matchData[k].keyword[matchData[k].count]} 匹配失败 计数器清零`);
                            matchData[k].count = 0;
                        }
                    }
                }
                results.push({
                    filename: targets[i].filename,
                    data: data.join("")
                });
            }
            return results;
        };
    })()
};
/** 日志信息 */
const logData = {
    sum: 0,
    js: { sum: 0, detail: [] },
    css: { sum: 0, detail: [] },
    base64: { sum: 0, detail: [] }
};
/** @param {File} file */
const addLog = file => {
    let target = null;
    switch (file.type) {
        case "js":
            target = logData.js;
            break;
        case "css":
            target = logData.css;
            break;
        case "bin":
            target = logData.base64;
            break;
    }
    if (target) {
        target.detail.push(`    "${file.dirpath}/${file.name}" ${file.data.length}\n`);
        target.sum += file.data.length;
    }
};
const genLog = () => {
    const buildLogPath = `${path.log}/build.log`;
    const distFile = new File(`${path.dist}/noitaLib.js`, false);
    const logFile = new File(buildLogPath, false);
    // const lastSum = Number(logFile.data.match(/(?<=\[总计\] )\d+/g)?.at(-1)),
    //     lastSum_js = Number(logFile.data.match(/(?<=\[js\] )\d+/g)?.at(-1)),
    //     lastSum_css = Number(logFile.data.match(/(?<=\[css\] )\d+/g)?.at(-1)),
    //     lastSum_base64 = Number(logFile.data.match(/(?<=\[base64\] )\d+/g)?.at(-1));
    // let sumDiff = 0,
    //     sumDiff_js = 0,
    //     sumDiff_css = 0,
    //     sumDiff_base64 = 0;
    // if (lastSum) sumDiff = logData.sum - lastSum;
    // if (lastSum_js) sumDiff = logData.js.sum - lastSum_js;
    // if (lastSum_css) sumDiff = logData.css.sum - lastSum_css;
    // if (lastSum_base64) sumDiff = logData.base64.sum - lastSum_base64;
    const dt = new Date();
    const datetimeStr = `${dt.getFullYear()}-${(dt.getMonth() + 1).toString().padStart(2, "0")}-${dt.getDate().toString().padStart(2, "0")} ${dt.getHours().toString().padStart(2, "0")}:${dt.getMinutes().toString().padStart(2, "0")}:${dt.getSeconds().toString().padStart(2, "0")}.${dt.getMilliseconds().toString().padStart(3, "0")}`;
    let temp = [];

    temp.push(datetimeStr, ` [info] [总计] ${logData.sum} `);

    temp.push(` ${Math.round(distFile.size / 1024)}KB \n`);
    temp.push(`  [js] ${logData.js.sum} `);

    temp.push("\n", ...logData.js.detail);
    temp.push(`  [css] ${logData.css.sum} `);

    temp.push("\n", ...logData.css.detail);
    temp.push(`  [base64] ${logData.base64.sum} `);

    temp.push("\n", ...logData.base64.detail);
    const result = temp.join("");
    console.log(result);
    fs.appendFileSync(buildLogPath, result);
};

class File {
    /**
     * @typedef {Object} EmbeddingPoint
     * @prop {String} src 插入源
     * @prop {Array<String>} srcChars 插入源字符数组(缓存)
     * @prop {String} data 插入数据
     */
    /** @typedef {"js"|"css"|"bin"} FileType */
    static readFileopt_text = { encoding: "utf8", flag: "r" };
    static readFileopt_bin = { encoding: "base64", flag: "r" };
    static typeMap = new Map([
        ["js", "js"],
        ["css", "css"],
        ["png", "bin"]
    ]);
    /** 嵌入点 @type {Array<EmbeddingPoint>} */ embeddingPoints = [];
    /** 连接数据 @type {Array<Object>} */ #connectData = [];
    /**
     * @param {String} path 文件路径
     * @param {Boolean} [neddAddLog] 文件路径
     * @param {Boolean} compress 是否进行压缩
     */
    constructor(path, neddAddLog = true) {
        /** @type {typeof File} */ const _ = this.constructor;
        const pathData = path.split("/");
        /** @type {String} 文件名 */ this.name = pathData.pop();
        /** @type {String} 所在路径 */ this.dirpath = pathData.join("/");
        /** @type {FileType} 类型 */ this.type = _.typeMap.get(path.split(".").at(-1));
        /** @type {String} 数据 */ this.data = "";
        /** @type {Number} 体积 */ this.size = fs.statSync(path).size;
        switch (this.type) {
            case "js":
                this.data = util.min_js(fs.readFileSync(path, _.readFileopt_text));
                break;
            case "css": //作为字符串嵌入 取消转义
                this.data = `String.raw\`${util.min_css(fs.readFileSync(path, _.readFileopt_text))}\``;
                break;
            case "bin": //作为字符串嵌入
                this.data = `\`data:image/png;base64,${fs.readFileSync(path, _.readFileopt_bin)}\``;
                break;
            default:
                this.data = fs.readFileSync(path, _.readFileopt_text);
        }
        if (neddAddLog) addLog(this);
    }

    #loadEmbeddingPoint() {
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
            relativePath: false
        };
        let embeddingIndex = 0;
        /** @type {"e"|"m"|"b"|"d"|"("|"`"|")"|";"} */
        let char;
        const matchFail = () => {
            matchState = 0;
            embeddingPoint = { srcChars: [] };
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
                                this.#connectData.push({ data: partCache.join("") });
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
        this.#connectData.push({
            data: partCache.join("")
        });
    }
    embed() {
        this.#loadEmbeddingPoint();
        for (let i = 0; i < this.embeddingPoints.length; i++) {
            const embeddingPoint = this.embeddingPoints[i];
            const embeddingFile = new File(embeddingPoint.src);
            embeddingFile.embed();
            embeddingPoint.data = embeddingFile.data;
        }
        const temp = [];
        for (let i = 0; i < this.#connectData.length; i++) {
            temp.push(this.#connectData[i].data);
        }
        this.data = temp.join("");
        // console.log(this.data);
    }
}

const index = new File(`${path.src}/index.js`);
index.embed();
logData.sum = index.data.length;
fs.writeFileSync(`${path.dist}/noitaLib.js`, index.data);
fs.writeFileSync(`${path.dist2}/noitaLib.js`, index.data);
fs.writeFileSync(`${path.dist}/noitaLib.mjs`, index.data.replace(`"use strict";`, `"use strict";export `));
const params = process.argv.slice(2);
if (!params.includes("-nolog")) {
    //命令行参数 `-nolog` 不生成日志
    genLog();
}
