const min = d => {
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
};
export default { min };
