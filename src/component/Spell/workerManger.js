/// 多线程尝试
const workerFn = () => {
    class Token {
        static logData = {
            tokens: [],
            main: [],
            styles: [],
            baseStyle: "border-radius: 2px;padding: 1px 1px;line-height: 20px;",
            init() {
                this.tokens = [];
                this.main = [];
                this.styles = [];
            }
        };
        static log() {
            console.debug(this.logData.main.join(""), ...this.logData.styles);
            console.table(this.logData.tokens, ["type", "index", "data"]);
        }
        /** @type { String } */
        type = "";
        /** @type { String|Number } */
        data = "";
        /** @type { Array < String >} */
        #tempData = [];
        /** @type { String } */
        index = -1;
        /** @type { Object } */
        #enum;
        finish() {
            Token.logData.tokens.push(this);
            if (this.#tempData.length > 0) {
                let tempData = this.#tempData.join("");
                if (this.#enum.type === "number") {
                    this.data = Number(tempData);
                } else {
                    this.data = tempData;
                }
                this.#tempData = [];
            }
            const logData = this.constructor.logData;
            if (this.#enum.needBlank) {
                logData.main.push("%c ");
                logData.styles.push("line-height: 20px;");
            }
            logData.main.push(`%c${this.data}`);
            logData.styles.push(`${logData.baseStyle}color:${this.#enum.color};font-weight:${this.#enum.fontWeight};background-color:${this.#enum.bgColor};`);
        }
        push(char) {
            this.#tempData.push(char);
        }

        constructor(tokenEnum, index) {
            if (tokenEnum) {
                this.#enum = tokenEnum;
                this.type = tokenEnum.id;
                if (tokenEnum.data) {
                    this.data = tokenEnum.data;
                    this.finish();
                }
            }
            if (index !== undefined) {
                this.index = index;
            }
        }
    }
};

/**
 * 根据AST获取法术数据数组
 * @param {{type: String, data: String, data1: String?, data2: String?}} exp
 * @returns {Set<SpellData>}
 */
const getSpellDatas = exp => {
    switch (exp.type) {
        case "SPELL_ID":
            return new Set([SpellData.query(exp.data)]);
        case "SPELL_TAG":
            const result = SpellData.data[exp.data];
            if (result) return result;
            else {
                console.warn("暂不支持的法术法术标签", exp);
                return new Set();
            }

        case "SPELL_GROUP":
            switch (exp.operator) {
                case "AND":
                    return getSpellDatas(exp.data1).intersection(getSpellDatas(exp.data2)); //取交集 采用polyfill函数
                case "OR":
                    return getSpellDatas(exp.data1).union(getSpellDatas(exp.data2)); //取并集 采用polyfill函数
                case "NOT":
                    return SpellData.data.all.difference(getSpellDatas(exp.data2)); //取补集 采用polyfill函数
            }
    }
};

/** CPU 核心数 */
const cpuCores = navigator.hardwareConcurrency ?? 8;

/** @type {Array<Worker>} worker列表 */
const workers = new Array(Math.ceil(cpuCores / 2));

/** @type {Array<{exp:String,resolves:Array<Function>}>} 解析任务列表 */
const tasks = [];

/** @type {Map<String,Set<SpellData>>} 解析结果缓存 */
const resultCache = new Map();

let isOver = true;
const url = URL.createObjectURL(new Blob([workerFn.toString() + "()"]));
for (let i = 0; i < workers.length; i++) {
    const worker = new Worker(url, { name: "noitaLib:spellExpParser." + i });
    workers[i] = worker;
    worker.addEventListener("message", ({ data }) => {
        // 在完成任务后分配尝试新任务
        if (data.type === "finish") {
            // 缓存解析结果
            if (data.result) resultCache.set(data.exp, data.result);

            const { exp, resolves } = tasks.shift() ?? {};
            if (exp) {
                worker.addEventListener(
                    "message",
                    ({ data: { type, result } }) => {
                        if (type === "finish") {
                            if (result) {
                                const set = getSpellDatas(result);
                                resultCache.set(data.exp, set);
                                resolves.forEach(e => e(set));
                            }
                        }
                    },
                    { once: true }
                );
                worker.postMessage({ type: "exp", exp });
            } else isOver = true;
        }
    });
}

/** @param {String} exp */
const main = exp => {
    // 缓存命中
    const result = resultCache.get(exp);
    if (result) return Promise.resolve(result);

    // 加入解析任务队列 等待解析结果
    $: {
        const { promise, reject, resolve } = Promise.withResolvers();
        for (let i = 0; i < tasks.length; i++) {
            const { exp: exp_, resolves } = tasks[i];
            if (exp === exp_) {
                resolves.push(resolve);
                break $;
            }
        }
        tasks.push({ exp, resolves: [resolve] });
    }

    // 仅在结束时重新唤醒worker
    if (isOver) {
        isOver = false;
        for (let i = 0; i < workers.length; i++) workers[i].postMessage("start");
    }
};
