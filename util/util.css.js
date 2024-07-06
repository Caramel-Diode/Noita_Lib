/**
 * 最小化css文件
 * @param {String} d 待压缩字符串
 * @returns {String} 结果文本
 */
const min = d => {
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
};

export default { min };
