/** [法杖数据库](wand.js) */
DB.wand = class {
    /** @type {Promise<HTMLImageElement>} 图标精灵图 */
    static iconImage = utilities.base64ToImg("wandIcon.png");

    static #wandIconData = class WandIconData {

        /** @type {Number} 辅助变量 用于记录法杖图标起始位置 */
        static #currentOrigin = 1;

        /** @type {Array<WandIconData>} 模板数据表 用于匹配图标 */
        static dataList = [];

        /** @type {String} 名称 */name;
        /** @type {Number} 图标起点 */iconOrigin;
        /** @type {Number} 图标宽度 */iconWidth;
        /** @type {Number} 容量 */capacity;
        /** @type {Number} 抽取数 */draw;
        /** @type {Number} 施放延迟 */fireRateWait;
        /** @type {Number} 充能时间 */reloadTime;
        /** @type {Boolean} 乱序 */shuffle;
        /** @type {Number} 散射 */spreadDegrees;
        /**
         * @param {[String,Number,Number,Number,Number,Number,Number,Number]} dataArray 
         */
        constructor(dataArray) {
            const _ = this.constructor;
            this.name = dataArray[0];
            this.iconOrigin = _.#currentOrigin;
            this.iconWidth = dataArray[1];
            _.#currentOrigin += this.iconWidth;
            this.capacity = dataArray[2];
            this.draw = dataArray[3];
            this.fireRateWait = dataArray[4];
            this.reloadTime = dataArray[5];
            this.shuffle = dataArray[6] === 1;
            this.spreadDegrees = dataArray[7];
        };

        static init = () => {
            // data : 嵌入法杖模板数据
            /** @type {Array} */
            const datas = "wandTemplateData.jsonc";
            for (let i = 0; i < datas.length; i++) {
                this.dataList.push(Object.freeze(new this(datas[i])));
            };
        };

    };

    /**
     * 法术序列解析
     * @param {String} expression 表达式
     * @returns {Array<DataSpell>}
     * ---
     * ## 语法规定
     * ### 基本词素
     * * `法术ID` 固定法术
     * * `:` 重复次数声名符
     * * `^` 剩余次数声明符
     * * `法术重复次数`
     * * `法术剩余次数`
     * * `[]` 不定法术
     * * ` ` 间隔符
     * 
     * 例: `BLOOD_MAGIC:2 BURST_X [#type_projectile|#type_staticProjectile|#type_material]:23` 血液魔法×2 穷尽施法 (投射物/静态投射物/材料)×23
     */
    static #spellRecipeParse = (() => {
        const consoleError = (info, index, obj) => {
            const e = new SyntaxError(`${info} index:${index}`);
            console.error(e, obj);
        };
        const regs = {
            word: /[^\s :;^<>{}\[\]()*/]/,
            number: /[0-9]/
        };

        const tokenEnum = {
            /** 法术ID */
            SI: {
                id: "SPELL_ID",
                color: "#8080FF",
                bgColor: "#8080FF40",
                fontWeight: "700",
                needBlank: true
            },
            /** 重复次数 */
            TR: {
                id: "TIME_OF_REPETITION",
                type: "number",
                color: "#7FB717",
                bgColor: "#00000000",
                fontWeight: "400"
            },
            /** 剩余次数 */
            REMAIN: {
                id: "REMAIN",
                type: "number",
                color: "#DD001B",
                bgColor: "#00000000",
                fontWeight: "400"
            },
            BRACKET_SL: {
                id: "BRACKET_SQUARE_LEFT",
                data: "[",
                color: "#CE9178",
                bgColor: "#00000000",
                fontWeight: "700",
                needBlank: true
            },
            BRACKET_SR: {
                id: "BRACKET_SQUARE_RIGHT",
                data: "]",
                color: "#CE9178",
                bgColor: "#00000000",
                fontWeight: "700"
            },
            /**  剩余次数声明符 */
            CARET: {
                id: "CARET",
                data: "^",
                color: "#CE9178",
                bgColor: "#00000000",
                fontWeight: "700"
            },
            /**  重复次数声明符 */
            COLON: {
                id: "COLON",
                data: ":",
                color: "#CE9178",
                bgColor: "#00000000",
                fontWeight: "700"
            },
            /** 可替换法术表达式 */
            RSE: {
                id: "REPLACEABLE_SPELL_EXPRESSION",
                color: "#AC71F1",
                bgColor: "#AC71F140",
                fontWeight: "400",
                reg: / [^\s :;^<>{ }\[\]()*/#]/
            },
            UND: {
                id: "UND"
            }
        };
        const Token = utilities.parse.token;
        return /** @param {String} expressionStr */ expressionStr => {
            if (expressionStr.length > 0) {
                console.groupCollapsed("法术序列表达式解析: %c`%s`", "color:#25AFF3", expressionStr);
                let currentToken = undefined;
                console.groupCollapsed("🏷️ Tokenization");
                //#region 令牌化 Tokenization
                /** @type {Array<Token>} */
                const tokens = [];
                Token.logData.init();
                const EL = expressionStr.length;
                for (let i = 0; i < EL; i++) {
                    const char = expressionStr[i];
                    if (Token.regs.number.test(char)) { // 数字开头的token为重复次数
                        if (currentToken === undefined) {
                            const lastToken = tokens.at(-1);
                            if (lastToken.type === "COLON") { //上个token是":" 则该数字表示重复次数
                                currentToken = new Token(tokenEnum.TR, i);
                            } else if (lastToken.type === "CARET") { //上个token是"^" 则该数字表示剩余次数
                                currentToken = new Token(tokenEnum.REMAIN, i);
                            } else {
                                currentToken = new Token(tokenEnum.UND, i);
                                consoleError("法术ID不允许数字开头 数字必须用于表示法术重复次数或法术剩余次数", i, currentToken);
                                return [];
                            }
                            currentToken.push(char);
                        } else currentToken.push(char);
                    } else if (Token.regs.word.test(char)) { // 字母开头的token为法术ID或可替换法术表达式
                        if (currentToken === undefined) {
                            if (tokens.at(-1)?.type === "BRACKET_SQUARE_LEFT")
                                currentToken = new Token(tokenEnum.RSE, i);
                            else
                                currentToken = new Token(tokenEnum.SI, i);
                        }
                        currentToken.push(char);
                    } else if (Token.regs.logicalOperator.test(char)) {
                        if (currentToken === undefined) {
                            if (tokens.at(-1)?.type === "BRACKET_SQUARE_LEFT") {
                                currentToken = new Token(tokenEnum.RSE);
                            }
                            currentToken.push(char);
                        } else if (currentToken.type === "REPLACEABLE_SPELL_EXPRESSION") {
                            currentToken.push(char);
                        } else {
                            consoleError(`不合法的字符: "${char}"`, i, currentToken);
                            console.log("逻辑运算符必须出现在法术查询表达式中");
                            return [];
                        }
                    } else if (Token.regs.blank.test(char)) {
                        if (currentToken) {
                            if (currentToken?.type !== "REPLACEABLE_SPELL_EXPRESSION") {
                                currentToken.finish();
                                tokens.push(currentToken);
                                currentToken = undefined;
                            }
                        }
                    }
                    else {// 遇到以下字符需要结束当前token
                        if (currentToken) {
                            currentToken.finish();
                            tokens.push(currentToken);
                            currentToken = undefined;
                        }
                        switch (char) {
                            case ":": tokens.push(new Token(tokenEnum.COLON, i)); break;
                            case "[": tokens.push(new Token(tokenEnum.BRACKET_SL, i)); break;
                            case "]": tokens.push(new Token(tokenEnum.BRACKET_SR, i)); break;
                            case "^": tokens.push(new Token(tokenEnum.CARET, i)); break;
                            default:
                                let und = new Token(tokenEnum.UND, i);
                                und.data = char;
                                consoleError(`不合法的字符: "${char}"`, i, und);
                                return [];
                        }
                    }
                }
                if (currentToken) {
                    currentToken.finish();
                    tokens.push(currentToken);
                    currentToken = undefined;
                }
                Token.log();
                console.groupEnd();
                //#endregion
                console.groupCollapsed("🍁 AST");
                //#region 生成AST
                const result = [];
                const TL = tokens.length;
                for (let i = 0; i < TL; i++) {
                    currentToken = tokens[i];
                    switch (currentToken.type) {
                        case "SPELL_ID": {
                            result.push({
                                type: "STATIC",
                                spellDatas: [DB.spell.queryById(currentToken.data)],
                                amount: 1,
                                instanceData: {
                                    remain: Infinity
                                }
                            });
                            break;
                        }
                        case "REMAIN": {
                            const lastToken = result.at(-1);
                            if (lastToken) lastToken.instanceData.remain = currentToken.data;
                            else {
                                consoleError("未指定目标法术", currentToken.index, currentToken);
                                return [];
                            }
                            break;
                        }
                        case "TIME_OF_REPETITION": {
                            const lastToken = result.at(-1);
                            if (lastToken) lastToken.amount = currentToken.data;
                            else {
                                consoleError("未指定目标法术", currentToken.index, currentToken);
                                return [];
                            }
                            break;
                        }
                        case "REPLACEABLE_SPELL_EXPRESSION": {
                            result.push({
                                type: "REPLACEABLE",
                                spellDatas: DB.spell.queryByExpression(currentToken.data),
                                amount: 1,
                                instanceData: {
                                    remain: Infinity
                                }
                            });
                            break;
                        }
                    }
                }
                console.table(result, ["type", "spellData", "amount", "instanceData"]);
                console.groupEnd();
                //#endregion
                console.groupEnd();

                return result;
            } else return [];
        };
    })();

    /** @type {String} 名称 */name;
    /** @type {Number} 图标起点 */iconOrigin;
    /** @type {Number|{min:Number,max:Number}} 图标宽度 */iconWidth;
    /** @type {Number|{min:Number,max:Number}} 容量 */capacity;
    /** @type {Number|{min:Number,max:Number}} 抽取数 */draw;
    /** @type {Number|{min:Number,max:Number}} 施放延迟 */fireRateWait;
    /** @type {Number|{min:Number,max:Number}} 充能时间 */reloadTime;
    /** @type {Boolean} 乱序 */shuffle;
    /** @type {Number|{min:Number,max:Number}} 散射 */spreadDegrees;
    /** @type {Number|{min:Number,max:Number}} 投射物速度 */speedMultiplier;
    /** @type {Number|{min:Number,max:Number}} 法力恢复速度 */manaChargeSpeed;
    /** @type {Number|{min:Number,max:Number}} 法力上限 */manaMax;
    /** @type {Array<DataSpell>} 始终施放 */staticSpells;
    /** @type {Array<DataSpell>} 活动法术 */dynamicSpells;

    /**
     * @param {Array} dataArray 
     */
    constructor(dataArray) {
        this.name = dataArray[0];
        this.capacity = dataArray[2];
        this.draw = dataArray[3];
        this.fireRateWait = dataArray[4];
        this.reloadTime = dataArray[5];
        this.shuffle = dataArray[6];
        this.spreadDegrees = dataArray[7];
        this.speedMultiplier = dataArray[8];
        this.manaChargeSpeed = dataArray[9];
        this.manaMax = dataArray[10];
        this.staticSpells = new.target.#spellRecipeParse(dataArray[11]);
        this.dynamicSpells = new.target.#spellRecipeParse(dataArray[12]);
        // 决定法杖图标
        if (dataArray[1] === "AUTO") /* 根据属性自动决定 */ {

            let fireRateWait, draw, capacity, spreadDegrees, reloadTime;
            if (typeof this.fireRateWait === "number") fireRateWait = this.fireRateWait;
            else fireRateWait = (this.fireRateWait.min + this.fireRateWait.max) / 2;
            if (typeof this.draw === "number") draw = this.draw;
            else draw = (this.draw.min + this.draw.max) / 2;
            if (typeof this.capacity === "number") capacity = this.capacity;
            else capacity = (this.capacity.min + this.capacity.max) / 2;
            if (typeof this.spreadDegrees === "number") spreadDegrees = this.spreadDegrees;
            else spreadDegrees = (this.spreadDegrees.min + this.spreadDegrees.max) / 2;
            if (typeof this.reloadTime === "number") reloadTime = this.reloadTime;
            else reloadTime = (this.reloadTime.min + this.reloadTime.max) / 2;

            const limit_fireRateWait = utilities.clamp((fireRateWait + 5) / 7, 0, 4);
            const limit_draw = utilities.clamp(draw - 1, 0, 2);
            const limit_capacity = utilities.clamp(capacity / 3 - 1, 0, 7);
            const limit_spreadDegrees = utilities.clamp(spreadDegrees / 5 - 1, 0, 2);
            const limit_reloadTime = utilities.clamp(reloadTime / 25 + 0.8, 0, 2);
            let bestScore = 1000;
            let score;
            let wandName;
            for (const e of new.target.#wandIconData.dataList) {
                score = Math.abs(limit_fireRateWait - e.fireRateWait) * 2/* 施放延迟 权重2 */;
                score += Math.abs(limit_draw - e.draw) * 20 /* 施放数 权重 20 */;
                score += Math.abs(this.shuffle - e.shuffle) * 30 /* 乱序 权重 30 */;
                score += Math.abs(limit_capacity - e.capacity) * 5 /* 容量 权重 5 */;
                score += Math.abs(limit_spreadDegrees - e.spreadDegrees) /* 散射 权重 1 */;
                score += Math.abs(limit_reloadTime - e.reloadTime) /* 充能时间 权重 1 */;
                score = Math.floor(score);
                if (score <= bestScore) {
                    bestScore = score;
                    this.iconOrigin = e.iconOrigin;
                    this.iconWidth = e.iconWidth;
                    wandName = e.name;
                    if (score === 0 && utilities.draw(0.33)) break;
                }
            }
            if (this.name === "AUTO") this.name = wandName;
        } else if (dataArray[1] !== "NONE") {

        }
    };
    static init() {
        this.#wandIconData.init();
    }
}