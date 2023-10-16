const fs = require("fs");
const srcPath = "./src";
const outPath = "./out";
const outPath2 = "D:/Project/Web/NoitaTest/js";
const readFileopt = { encoding: "utf8", flag: "r" };
const config = {
    embedImage: true,
    embedJson: true
};

/** 工具集 */
const u = {
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
        return result.join("");
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
        return result.join("");
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

// 获取图片base64数据
const getImgBase64 = () => {
    const imgPath = `${srcPath}/img`;
    return fs
        .readdirSync(imgPath)
        .filter(e => /[.]png/.test(e))
        .map(e => ({
            filename: e,
            data: `"data:image/png;base64,${fs.readFileSync(`${imgPath}/${e}`).toString("base64")}"`
        }));
};

// 获取所有压缩后的css文件
const getMinCss = () => {
    const cssPath = `${srcPath}/css`;
    return fs
        .readdirSync(cssPath)
        .filter(e => /[.]css/.test(e))
        .map(e => ({
            filename: e,
            data: u.min_css(fs.readFileSync(`${cssPath}/${e}`, readFileopt).toString())
        }));
};

// 获取所有压缩后的js文件
const getMinJs = () => {
    const jsPath = `${srcPath}/js`;
    const jsFilterCb = e => /[.]js/.test(e);
    const dirPaths = ["db", "db/data", "component", "other"];
    const result = {
        main: [],
        db: [],
        db_data: [],
        component: [],
        other: []
    };

    const main_fn = dirPath => {
        const filenames = fs.readdirSync(`${jsPath}/${dirPath}`).filter(jsFilterCb);
        for (let i = 0; i < filenames.length; i++) {
            const filePath = `${dirPath}/${filenames[i]}`;
            const data = fs.readFileSync(`${jsPath}/${filePath}`, readFileopt);
            const jsData = { filename: filePath, data: u.min_js(data.toString()) };
            switch (dirPath) {
                case "db":
                    result.db.push(jsData);
                    break;
                case "db/data":
                    result.db_data.push(jsData);
                    break;
                case "component":
                    result.component.push(jsData);
                    break;
                case "other":
                    result.other.push(jsData);
                    break;
            }
        }
    };
    const indexJsData = fs.readFileSync(`${jsPath}/index.js`, readFileopt);
    result.main.push({ type: "main", filename: "index.js", data: u.min_js(indexJsData.toString()) });
    for (let i = 0; i < dirPaths.length; i++) main_fn(dirPaths[i]);
    return result;
};

//获取所有压缩后的json文件
const getMinJson = () => {
    const jsonPath = `${srcPath}/json`;
    return fs
        .readdirSync(jsonPath)
        .filter(e => /[.]json[c]?/.test(e))
        .map(e => ({
            filename: e,
            data: u.min_js(fs.readFileSync(`${jsonPath}/${e}`, readFileopt).toString())
        }));
};

// 将所有js文件合并到index.js中
const embedJsToMainJs = jsData => {
    if (jsData.main.length > 0) {
        jsData.db = u.embed_files(jsData.db, jsData.db_data); //先将数据库数据表合并到class中
        jsData.main = u.embed_files(jsData.main, [...jsData.db, ...jsData.component, ...jsData.other]); //合并其余js
    } else console.log("index.js不存在");
    return jsData.main;
};

const logData = {
    sum: 0,
    js: { all: 0, detail: [] },
    css: { all: 0, detail: [] },
    base64: { all: 0, detail: [] },
    json: { all: 0, detail: [] }
};
const addLog = (type, ds) => {
    let target = null;
    switch (type) {
        case "js":
            target = logData.js;
            break;
        case "css":
            target = logData.css;
            break;
        case "base64":
            target = logData.base64;
            break;
        case "json":
            target = logData.json;
            break;
        case "sum":
            logData.sum = ds;
            return;
    }
    for (let i = 0; i < ds.length; i++) {
        target.detail.push("    ", ds[i].filename.split(".", 1)[0], ": ", ds[i].data.length, "\n");
        target.all += ds[i].data.length;
    }
};
const genLog = () => {
    let temp = [];
    temp.push(new Date().toLocaleString("zh-CN"), "\n");

    temp.push("#sum: ", logData.sum, "\n");

    temp.push("js:\n");
    temp.push("    #all: ", logData.js.all, "\n");
    temp.push(...logData.js.detail);

    temp.push("css:\n");
    temp.push("    #all: ", logData.css.all, "\n");
    temp.push(...logData.css.detail);

    temp.push("json:\n");
    temp.push("    #all: ", logData.json.all, "\n");
    temp.push(...logData.json.detail);

    temp.push("base64:\n");
    temp.push("    #all: ", logData.base64.all, "\n");
    temp.push(...logData.base64.detail);

    const result = temp.join("");
    console.log(result);
    return result;
};

const main = async () => {
    let cssData = getMinCss();
    addLog("css", cssData);
    let jsData = getMinJs();
    addLog("js", [...jsData.main, ...jsData.db, ...jsData.component, ...jsData.other]); //不统计数据表内容

    // 将css嵌入到js文件(仅有component会使用到css)
    jsData.component = u.embed_files(jsData.component, cssData);

    if (config.embedImage) {
        const base64Data = getImgBase64();
        addLog("base64", base64Data);
        // 将base64数据嵌入css文件 (好像现在用不到了)
        cssData = u.embed_files(cssData, base64Data);
        //将base64数据嵌入js文件(仅有db会使用到图片base64)
        jsData.db = u.embed_files(jsData.db, base64Data);
    }
    // if (config.embedJson) {
    //     let jsonData = getMinJson();
    //     addLog("json", jsonData);
    //     //将json数据嵌入js文件
    //     mainJsData = u.embed_files(mainJsData, jsonData);
    // }

    //将其它js文件嵌入index.js中
    let mainJsData = embedJsToMainJs(jsData);

    /** @type {String} */
    const result = mainJsData[0].data;
    const result_module = result.replace(`"use strict";`, `"use strict";export `);
    addLog("sum", result.length);
    fs.writeFile(`${outPath}/index.js`, result, _ => 0);
    fs.writeFile(`${outPath}/index.mjs`, result_module, _ => 0);
    fs.writeFile(`${outPath2}/noitaLib.js`, result, _ => 0);
    fs.writeFile(`${outPath}/build.log`, genLog(), _ => 0);
    console.log("构建完成");
};
main();

