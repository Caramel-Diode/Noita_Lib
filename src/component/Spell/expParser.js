const err = (...args) => new SyntaxError(String.raw(...args));
const { isBlank, isWordPart } = Lexer;
/* prettier-ignore */
const lexer = new Lexer([
    Lexer.preset.BLANK,
    Lexer.preset.SPELL_ID,
    Lexer.preset.SPELL_TAG,
    { id: "PARENTHESE_LEFT", data: "(" },
    { id: "PARENTHESE_RIGHT", data: ")" },
    { id: "NOT", data: "!" },
    { id: "OR", data: "|" },
    { id: "AND", data: "&" },
    { id: "DIFF", data: "-" },
    { id: "XOR", data: "^" }
]);

class LogicExp {
    /**
     * @type {0|1|2|-1}
     * ### 匹配状态
     * * 0:未开始
     * * 1:等待匹配逻辑运算符
     * * 2:等待匹配法术标签/ID/组
     * * -1:完成
     */
    state = 0;
    /**
     * @type {0|1|-1}
     * ### 括号匹配状态
     * * 0: 无需括号
     * * 1: 等待右括号
     * * -1: 括号已成对
     */
    parenthese = 0;
    #data1;
    #data2;
    #operator;
    /** @returns {"LOGIC_EXP"} */
    get type() {
        return "LOGIC_EXP";
    }

    set data1(value) {
        if (!this.#data1) this.state = 1;
        this.#data1 = value;
    }

    get data1() {
        return this.#data1;
    }

    set data2(value) {
        if (!this.#data2) this.state = -1;
        this.#data2 = value;
    }

    get data2() {
        return this.#data2;
    }

    /** @param {"OR"|"AND"|"NOT"|"DIFF"|"XOR"} value */
    set operator(value) {
        if (!this.#operator) this.state = 2;
        this.#operator = value;
    }

    /** @returns {"OR"|"AND"|"NOT"|"DIFF"|"XOR"} */
    get operator() {
        return this.#operator;
    }

    constructor(data1, data2, operator) {
        if (data1) this.data1 = data1;
        if (data2) this.data2 = data2;
        if (operator) this.operator = operator;
    }
}
/**
 * 根据AST获取法术数据数组
 * @param {{type: "SPELL_ID" | "SPELL_TAG", data: string} | LogicExp} exp
 * @returns {Set<SpellData>}
 */
const getSpellDatas = exp => {
    let result = null;
    switch (exp.type) {
        case "SPELL_ID":
            console.log(`%c${exp.data}`, "background: #19A85A; color: #fff; padding: 0 2px; font-weight: bolder; border-radius: 2px;");
            return new Set([SpellData.query(exp.data)]);
        case "SPELL_TAG":
            console.log(`%c${exp.data}`, "background: #E1761C; color: #fff; padding: 0 2px; font-weight: bolder; border-radius: 2px;");
            result = SpellData.tagSets[exp.data];
            if (result) return result;
            else {
                console.warn("暂不支持的法术法术标签", exp);
                return new Set();
            }
        case "LOGIC_EXP":
            const { data1, data2, operator } = exp;
            // 空括号视为空集
            if (!operator) {
                console.log("%cNULL", "color: #A8524D");
                return new Set();
            }
            console.group(`%c${operator}`, "color: #AD71F2");
            switch (operator) {
                case "XOR":
                    result = getSpellDatas(data1).symmetricDifference(getSpellDatas(data2));
                    break;
                case "AND":
                    result = getSpellDatas(data1).intersection(getSpellDatas(data2));
                    break;
                case "OR":
                    result = getSpellDatas(data1).union(getSpellDatas(data2));
                    break;
                case "DIFF":
                    if (data1) {
                        result = getSpellDatas(data1).difference(getSpellDatas(data2));
                        break;
                    }
                case "NOT":
                    result = SpellData.tagSets.all.difference(getSpellDatas(data2));
                    break;
                default:
                    console.error(exp);
                    throw new Error("内部错误,运算符丢失");
            }
            console.groupEnd();
            return result;
    }
};

/** @type {Map<string,Set<SpellData>>} */
const resultCache = new Map();

/**
 * 通过 `表达式` 获取法术数据
 * @param {string} source 查询表达式
 * @returns {Array<SpellData>} 法术数据
 * @throws {SyntaxError}
 */
const parse = source => {
    if (!source) return [];
    // 优先从缓存中获取
    let result = resultCache.get(source);
    if (result) {
        console.groupCollapsed("法术查询表达式缓存命中: %c`%s`", "color:#44cf8e", source);
        console.log(result);
        console.groupEnd();
        return Object.assign([...result], { exp: source });
    }
    //#region 生成AST
    /** @type {Array<LogicExp>} 表达式栈 */
    const exps = [new LogicExp()];
    let rootExp = exps[0];
    /** 括号计数 左括号+1 右括号-1 用于快速判断括号是否成对 */
    let parenthese = 0;
    for (const { type, data, range } of lexer.tokenise(source)) {
        /** @type {LogicExp|undefined} 当前表达式 */
        let currentExp = exps.at(-1);
        switch (type) {
            case "SPELL_ID":
            case "SPELL_TAG":
                if (currentExp.state === 0) currentExp.data1 = { type, data };
                else if (currentExp.state === 2) exps.push((currentExp.data2 = new LogicExp({ type, data })));
                else throw err`缺少运算符连接 at:${range.start}`;
                break;
            case "PARENTHESE_LEFT": {
                parenthese++;
                const subExp = new LogicExp();
                subExp.parenthese = 1;
                if (currentExp.state === 0) exps.push((currentExp.data1 = subExp));
                else if (currentExp.state === 2) exps.push((currentExp.data2 = subExp));
                else throw err`缺少运算符连接 at:${range.start}`;
                break;
            }
            case "PARENTHESE_RIGHT":
                if (!parenthese) throw err`不成对的括号 at:${range.start}`;
                if (currentExp.state === 2) throw err`${data} 缺少法术标签或法术ID连接 at:${range.start}`;
                let pairedBracket = false;
                if (currentExp.state === 0) {
                    currentExp.state = -1; // 空括号表示空集
                    // 只有左括号会新建一个空表达式 所以上个token一定是左括号 直接完成配对
                    currentExp.parenthese = -1;
                    exps.pop(); // 弹出当前表达式 更新当前表达式指向
                    currentExp = exps.at(-1);
                }
                // 当前表达式不再有运算符连接 弹出
                else if (currentExp.state === 1) {
                    // 取消无意义法术组时可能会丢失需要匹配的左括号 这里需要记录是否在取消无意义法术组中已经完成了括号配对
                    // 当前表达式有左括号时消耗此右括号匹配
                    let pairedBracket = currentExp.parenthese === 1;
                    if (pairedBracket) currentExp.parenthese = -1;
                    const parentExp = exps.at(-2);
                    if (parentExp.state === 1) parentExp.data1 = currentExp.data1;
                    else if (parentExp.state === -1) parentExp.data2 = currentExp.data1;
                    // else ... 这里不会有其它状态了
                    exps.pop(); // 弹出当前表达式 更新当前表达式指向
                    currentExp = exps.at(-1);
                    // 如果括号没有被消耗则向上查找未匹配右括号的父级表达式
                    if (!pairedBracket) {
                        while (currentExp.parenthese !== 1) {
                            exps.pop();
                            currentExp = exps.at(-1);
                        }
                        currentExp.parenthese = -1;
                        exps.pop(); // 弹出当前表达式 更新当前表达式指向
                        currentExp = exps.at(-1);
                    }
                }
                parenthese--;
                break;
            case "NOT": {
                const subExp = new LogicExp(null, null, "NOT");
                if (currentExp.state === 0) exps.push((currentExp.data1 = subExp));
                else if (currentExp.state === 2) exps.push((currentExp.data2 = subExp));
                else if (currentExp.state === 1) throw err`不可以用于连接两个法术标签或法术ID ! at:${range.start}`;
                break;
            }
            case "DIFF": // -
                // 等同 NOT
                if (currentExp.state === 0) currentExp.data1 = null;
            case "AND": // &
            case "XOR": // ^
            case "OR": // |
                if (currentExp.state === 1) currentExp.operator = type;
                else if (currentExp.state === 0) throw err`缺少被连接的法术标签或ID at:${range.start}`;
                else if (currentExp.state === 2) throw err`已存在逻辑运算符 at:${range.start}`;
                break;
            case "EOF":
                while (1) {
                    /** @type {LogicExp} */
                    const parentExp = exps.at(-2);
                    if (currentExp.state === 1) {
                        if (!parentExp) {
                            rootExp = currentExp = currentExp.data1;
                            break;
                        }
                        if (parentExp.state === 1) parentExp.data1 = currentExp.data1;
                        else if (parentExp.state === -1) parentExp.data2 = currentExp.data1;
                        exps.pop();
                        currentExp = exps.at(-1);
                        continue;
                    } else if (currentExp.state === -1) {
                        if (!parentExp) {
                            rootExp = currentExp = exps.at(-1);
                            break;
                        }
                        exps.pop();
                        currentExp = exps.at(-1);
                        continue;
                    } else if (currentExp.state === 2) throw err`缺少连接的法术标签或ID at:${range.start}`;
                }
                //简化判断↓ if(rootExp.type === "LOGICAL_EXPRESSION" &&  rootExp.data2 === null)
                if (rootExp.data2 === null) throw err`缺少连接的法术标签或ID at:${range.start}`;
        }
    }
    //#endregion

    // 缓存结果
    console.groupCollapsed("AST: " + JSON.stringify(source));
    resultCache.set(source, (result = getSpellDatas(rootExp)));
    console.groupEnd();
    return Object.assign([...result], { exp: source });
};
