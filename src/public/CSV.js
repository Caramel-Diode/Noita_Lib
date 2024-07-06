/**
 * @typedef CSVCellData csv单元格数据
 * @prop {Number} row 行索引
 * @prop {Number} column 列索引
 * @prop {String} data 数据
 */
/**
 * @typedef {Object} CSVData csv数据
 * @prop {Array<String>} rowHeads 行表头
 * @prop {Array<String>} columnHeads 列表头
 * @prop {(row:String|Number,column:String|Number,data:String)=>{newRow:Boolean,newColumn:Boolean,newCell:Boolean}} set 设置数据
 * @prop {(row:String|Number,column:String|Number)=>String|Array<CSVCellData>|undefined} get 获取数据
 * @prop {(format:"CSV"|"HTML"|"MarkDown"|"MediaWiki"|"LateX",separator:String)=>String} toString 转为字符串
 * @prop {Array<CSVCellData>} cells 所有单元格数据
 */

const CSV = (() => {
    class CSVData {
        /** @type {Array<String>} */ rowHeads = [];
        /** @type {Array<String>} */ columnHeads = [];
        /** @type {Array<CSVCellData>} */ cells = [];
        /** @type {Map<String,String>} */ #dataCellsMap = new Map();
        /** @type {Map<String,Array<CSVCellData>} */ #dataCellsMap_row = new Map();
        /** @type {Map<String,Array<CSVCellData>} */ #dataCellsMap_column = new Map();
        /** 使用警告 */
        useWarn = true;
        #warn(...args) {
            if (this.useWarn) console.warn(...args);
        }
        constructor() {}

        #rowHeadToIndex(name) {
            for (let i = 0; i < this.columnHeads.length; i++) if (name === this.columnHeads[i]) return i;
            return name;
        }
        #columnHeadToIndex(name) {
            for (let i = 0; i < this.rowHeads.length; i++) if (name === this.rowHeads[i]) return i;
            return name;
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
                row = this.#rowHeadToIndex(row);
                //转化失败 新增行
                if (typeof row === "string") {
                    this.set(this.columnHeads.length, 0, row);
                    row = this.columnHeads.length - 1;
                    result.newRow = true;
                    result.newCell = true;
                }
            }
            // 将列转为索引
            if (typeof column === "string" && column !== "") {
                column = this.#columnHeadToIndex(column);
                //转化失败 新增列
                if (typeof column === "string") {
                    this.rowHeads.push(column);
                    this.set(0, this.rowHeads.length, column);
                    column = this.rowHeads.length - 1;
                    result.newColumn = true;
                    result.newCell = true;
                }
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
            if (typeof row === "string" && row !== "") {
                row = this.#rowHeadToIndex(row);
                if (typeof row === "string") return console.warn("不存在的行", row);
            }
            // 将列转为索引
            if (typeof column === "string" && column !== "") {
                column = this.#columnHeadToIndex(column);
                if (typeof column === "string") return console.warn("不存在的列", column);
            }
            if (row !== "" && column !== "") return this.#dataCellsMap.get(`(${row},${column})`);
            else if (row === "" && column !== "") return this.#dataCellsMap_column.get(column);
            else if (column === "" && row !== "") return this.#dataCellsMap_row.get(row);
            else return Object.freeze([...this.#dataCellsMap.values()]);
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
                            resultCache.push(`${this.get(row, column) ?? ""}`);
                            if (column === rowLen - 1) resultCache.push("\n");
                            else resultCache.push(separator);
                        }
                    break;
                case "HTML":
                    resultCache.push(`<table><thead><tr>`);
                    for (let column = 0; column < rowLen; column++) resultCache.push(`<th>${this.get(0, column) ?? ""}</th>`);
                    resultCache.push(`</tr></thead><tbody>`);
                    for (let row = 1; row < columnLen; row++) {
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

    /** 判断一行结束 */ const isLineEnd = char => char === "\r" || char === "\n";

    /**
     * 解析csv字符串
     * @param {String} data CSV字符串
     * @param {String} [separator] 分隔符
     * @returns {CSVData|undefined} csv数据
     */
    const parseCSV = (data, separator = ",") => {
        const len = data.length;
        /** 引号状态 @type {0|1} */ let state_quotationMark = 0;
        /** 转义符状态 @type {0|1} */ let state_escapeCharacter = 0;
        const result = new CSVData();
        /** 当前行 */ let currentRow = 0;
        /** 当前列 */ let currentColumn = 0;
        /** @type {Array<String>} */ let cellDataCache = [];
        for (let i = 0; i < len; i++) {
            const char = data[i];
            if (state_quotationMark === 1) {
                cellDataCache.push(char);
                if (char === `"`) {
                    // 双引号包裹结束
                    if (state_escapeCharacter === 0) state_quotationMark = 0;
                    // 消费转义符 `\`
                    else state_escapeCharacter = 0;
                } else if (char === "\\") {
                    if (state_escapeCharacter === 0) state_escapeCharacter = 1;
                    // 消费转义符 `\`
                    else state_escapeCharacter = 0;
                } else {
                    if (isLineEnd(char)) return console.error(new SyntaxError(`存在未闭合的引号 不应当在此处换行\n行:${currentRow}`));
                    // 消费转义符 `\`
                    state_escapeCharacter = 0;
                }
            } else {
                if (char === `"`) {
                    cellDataCache.push(char);
                    state_quotationMark = 1;
                } else if (char === separator) {
                    result.set(currentRow, currentColumn, cellDataCache.join(""));
                    cellDataCache = [];
                    currentColumn++; // 列索引增加
                } else if (isLineEnd(char)) {
                    // 对连续换行(空行)和"\r\n"(Windows换行符)特殊处理
                    if (!isLineEnd(data[i - 1])) {
                        result.set(currentRow, currentColumn, cellDataCache.join(""));
                        cellDataCache = [];
                        currentRow++; // 行索引增加
                        currentColumn = 0; // 列索引归零
                    }
                } else cellDataCache.push(char);
            }
        }
        result.set(currentRow, currentColumn, cellDataCache.join(""));
        Object.freeze(result.cells);
        return result;
    };
    return {
        parse: parseCSV
    };
})();
