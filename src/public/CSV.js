/**
 * @typedef CSVCellData csv单元格数据
 * @prop {Number} row 行索引
 * @prop {Number} column 列索引
 * @prop {String} data 数据
 */

class CSV {
    /** @type {Array<String>} 行表头 */
    rowHeads = [];
    /** @type {Array<String>} 列表头 */
    columnHeads = [];
    /** @type {Array<CSVCellData>} 所有单元格 */
    cells = [];
    /** @type {Map<String,String>} */
    #dataCellsMap = new Map();
    /** @type {Map<String,Array<CSVCellData>} */
    #dataCellsMap_row = new Map();
    /** @type {Map<String,Array<CSVCellData>} */
    #dataCellsMap_column = new Map();
    /** 使用警告 */
    useWarn = true;
    #warn(...args) {
        if (this.useWarn) console.warn(...args);
    }
    constructor() {}
    /** 判断是否为行尾 */
    static #isLineEnd = char => char === "\r" || char === "\n";
    /**
     * 解析csv字符串
     * @param {String} data CSV字符串
     * @param {String} [separator] 分隔符
     * @returns {CSV|undefined} csv数据
     */
    static parse(data, separator = ",") {
        data = this.#isLineEnd(data.at(-1)) ? data : data + "\n"; //增加EOF标志
        const len = data.length;
        const result = new this();
        /** 当前行 */
        let _row = 0;
        /** 当前列 */
        let _column = 0;
        /** 截取的起始位置 */
        let startPos = 0;
        let i = 0;
        $: for (; i < len; i++) {
            const char = data[i];
            if (char === `"`) {
                /** @type {Array<String>} */
                const cache = [];
                for (i++; i < len; i++) {
                    const char = data[i];
                    if (char === `"`) {
                        // 双引号包裹结束
                        let nextChar = data[i + 1];
                        if (nextChar === separator) {
                            result.set(_row, _column, cache.join(""));
                            _column++; // 列索引增加
                            startPos = ++i + 1;
                            continue $;
                        } else if (nextChar === `"`) i++;
                        else new SyntaxError(`双引号结束异常 at ${_row}:${_column}`);
                    }
                    cache.push(char);
                }
                throw new SyntaxError("未能匹配到结尾引号");
            } else if (char === separator) {
                result.set(_row, _column, data.slice(startPos, i));
                startPos = i + 1;
                _column++; // 列索引增加
            } else if (this.#isLineEnd(char)) {
                // 对连续换行(空行)和"\r\n"(Windows换行符)特殊处理
                if (!this.#isLineEnd(data[i - 1])) {
                    result.set(_row, _column, data.slice(startPos, i));
                    startPos = i + 2;
                    _row++; // 行索引增加
                    _column = 0; // 列索引归零
                }
            }
        }
        Object.freeze(result.cells);
        return result;
    }

    /**
     * @param {Number|String} row 行
     * @param {Number|String} column 列
     * @param {String} data 数据
     */
    set(row, column, data) {
        let result = {
            newRow: false,
            newColumn: false,
            newCell: false
        };
        //将行转为索引
        if (typeof row === "string" && row !== "") {
            const index = this.columnHeads.indexOf(column);
            //转化失败 新增行
            if (index === -1) {
                this.set(this.columnHeads.length, 0, row);
                row = this.columnHeads.length - 1;
                result.newRow = true;
                result.newCell = true;
            } else row = index;
        }
        // 将列转为索引
        if (typeof column === "string" && column !== "") {
            const index = this.columnHeads.indexOf(column);
            //转化失败 新增列
            if (index === -1) {
                this.rowHeads.push(column);
                this.set(0, this.rowHeads.length, column);
                column = this.rowHeads.length - 1;
                result.newColumn = true;
                result.newCell = true;
            } else column = index;
        }
        const dataCellObj = Object.freeze({ row, column, data });

        this.cells.push(dataCellObj);

        const key = `(${row},${column})`;
        if (this.#dataCellsMap.get(key)) result.newCell = true;
        this.#dataCellsMap.set(key, data);
        const dataCells_row = this.#dataCellsMap_row.get(row);
        if (dataCells_row) dataCells_row.push(dataCellObj);
        else this.#dataCellsMap_row.set(row, [dataCellObj]);
        if (row === 0) this.rowHeads[column] = data;
        const dataCells_column = this.#dataCellsMap_column.get(column);
        if (dataCells_column) dataCells_column.push(dataCellObj);
        else this.#dataCellsMap_column.set(column, [dataCellObj]);
        if (column === 0) this.columnHeads[row] = data;
    }
    /**
     * @param {Number|String} row 行
     * @param {Number|String} column 列
     * @returns {String} 单元格数据
     */
    get(row, column) {
        //将行转为索引
        if (typeof row === "string" && row) {
            row = this.columnHeads.indexOf(row);
            if (row === -1) return this.#warn("不存在的行", row);
        }
        // 将列转为索引
        if (typeof column === "string" && column) {
            column = this.rowHeads.indexOf(column);
            if (column === -1) return this.#warn("不存在的列", column);
        }
        if (row !== "" && column !== "") return this.#dataCellsMap.get(`(${row},${column})`);
        if (row === "" && column !== "") return this.#dataCellsMap_column.get(column);
        if (column === "" && row !== "") return this.#dataCellsMap_row.get(row);
        return Object.freeze([...this.#dataCellsMap.values()]);
    }
    /**
     * 转为字符串
     * @param {"CSV"|"HTML"|"MarkDown"|"MediaWiki"|"LateX"} [format] 格式
     * @param {String} [separator] 分隔符(仅对csv有效)
     * @returns {Sting}
     */
    toString(format = "CSV", separator = ",") {
        const resultCache = [];
        const columnLen = this.columnHeads.length;
        const rowLen = this.rowHeads.length;
        switch (format) {
            case "CSV":
                for (let row = 0; row < columnLen; row++)
                    for (let column = 0; column < rowLen; column++) {
                        let data = this.get(row, column) ?? "";
                        if (data.includes('"')) data = `"${data.replaceAll('"', '""')}"`;
                        else if (data.includes(",")) data = `"${data}"`;
                        resultCache.push(data);
                        if (column === rowLen - 1) resultCache.push("\n");
                        else resultCache.push(separator);
                    }
                break;
            case "HTML":
                resultCache.push(`<table><thead><tr>`);
                for (let column = 0; column < rowLen; column++) resultCache.push(`<th>${this.get(0, column) ?? ""}</th>`);
                resultCache.push(`</tr></thead><tbody>`);
                for (let row = 1; row < columnLen; row++) {
                    /* prettier-ignore */
                    const data = (this.get(row, 0) ?? "")
                        .replaceAll("&", "&amp;")
                        .replaceAll("<", "&lt;")
                        .replaceAll(">", "&gt;");
                    resultCache.push(`<tr><th>${this.get(row, 0) ?? ""}</th>`);
                    for (let column = 1; column < rowLen; column++) resultCache.push(`<td>${this.get(row, column) ?? ""}</td>`);
                    resultCache.push("</tr>");
                }
                resultCache.push(`</tbody></table>`);
                break;
            case "MarkDown":
                resultCache.push("|");
                for (let column = 0; column < rowLen; column++) resultCache.push(`${this.get(0, column) ?? ""}|`);
                resultCache.push("\n|:-:|");
                for (let column = 1; column < rowLen; column++) resultCache.push(`-|`);
                resultCache.push("\n");
                for (let row = 1; row < columnLen; row++) {
                    resultCache.push("|");
                    for (let column = 0; column < rowLen; column++) resultCache.push(`${this.get(row, column) ?? ""}|`);
                    resultCache.push("\n");
                }
                break;
            case "MediaWiki":
                resultCache.push(`{| class="wikitable"\n|-\n`);
                for (let column = 0; column < rowLen; column++) resultCache.push(`!${this.get(0, column) ?? ""}!`);
                resultCache.push(`\n|-\n`);
                for (let row = 1; row < columnLen; row++) {
                    for (let column = 0; column < rowLen; column++) resultCache.push(`|${this.get(row, column) ?? ""}|`);
                    resultCache.push(`\n|-\n`);
                }
                resultCache.push(`|}`);
                break;
            case "LaTeX":
                return "不想写这个";
        }
        return resultCache.join("");
    }
}
