/** 法杖数据 */
const WandData = class {
    /** 图标信息 */
    static IconInfo = class {
        /** @type {Promise<HTMLImageElement>} 图标精灵图 */
        static iconImage = util.base64ToImg(embed(`#icon.png`));
        /** @type {Map<String,WandData.IconInfo>}  */ static #dataMap = new Map();
        /** @type {Number} 辅助变量 用于记录法杖图标起始位置 */ static #currentOrigin = 1;
        /** @type {Number} 辅助变量 用于记录法杖图标索引 */ static #currentIndex = 1;
        /**
         * @param {Number} origin 图标起点
         * @param {Number} length 长度
         * @param {Number} index 索引
         * @param {String} name 名称
         */
        constructor(origin, length, index, name) {
            /** @type {Number} 起点 */ this.origin = origin;
            /** @type {Number} 宽度 */ this.width = length;
            /** @type {String} 索引 */ this.index = index;
            /** @type {String} 名称 */ this.name = name;
        }
        /**
         * 创建图标
         * @param {Number} length 图标长度
         * @param {String?} name 图标命名(缺省时使用索引命名)
         */
        static create(length, name = `#${this.#currentIndex}`) {
            const info = Object.freeze(new this(this.#currentOrigin, length, this.#currentIndex, name));
            this.#dataMap.set(name, info);
            this.#currentOrigin += length;
            this.#currentIndex++;
            return info;
        }
        /**
         * @param {String} name 图标名
         * @returns {WandData.IconInfo}
         */
        static get(name) {
            return this.#dataMap.get(name);
        }
        async getIcon() {
            const canvas = document.createElement("canvas");
            canvas.style.cssText = `--h:${this.width}px`;
            canvas.setAttribute("aria-label", `法杖图标 ${this.name}`); // 无障碍标注
            canvas.className = "wandIcon";
            canvas.height = this.width;
            canvas.width = 15;
            const ctx = canvas.getContext("2d");
            ctx.rotate(-Math.PI / 2);
            ctx.drawImage(await this.constructor.iconImage, this.origin, 0, this.width, 15, -this.width, 0, this.width, 15);
            return canvas;
        }
    };

    /** 法杖匹配数据 */
    static MatchData = class {
        /** @type {Array<WandData.MatchData>} */ static #dataList = [];
        constructor(datas) {
            /** @type {String} 名称 */ this.name = datas[0];
            /** @type {WandData.IconInfo} 图标信息 */ this.icon = WandData.IconInfo.create(datas[1]);
            /** @type {Number} 容量 */ this.capacity = datas[2];
            /** @type {Number} 抽取数 */ this.draw = datas[3];
            /** @type {Number} 施放延迟 */ this.fireRateWait = datas[4];
            /** @type {Number} 充能时间 */ this.reloadTime = datas[5];
            /** @type {Boolean} 乱序 */ this.shuffle = datas[6] === 1;
            /** @type {Number} 散射角度 */ this.spreadDegrees = datas[7];
        }
        static init() {
            /** #data: [常规法杖模板数据](template.match.data.js) @type {Array} */
            const datas = embed(`#template.match.data.js`);
            for (let i = 0; i < datas.length; i++) this.#dataList.push(Object.freeze(new this(datas[i])));
        }
        /** 通过属性获取部分属性 */
        static getInfo = (() => {
            /**
             * 范围值取中位数
             * @param {NumRangeOrConstant} value
             * @returns {Number}
             */
            const getMedian = value => {
                if (typeof value === "number") return value;
                else return (value.min + value.max) / 2;
            };
            const clamp = util.math.clamp;
            const random = util.math.random;
            /**
             * @param {WandData} data
             * @returns {{icon:WandData.IconInfo,name:String}}
             */
            return data => {
                /** @type {{icon:WandData.IconInfo,name:String}} 返回结果 */
                const result = {};
                const fireRateWait = getMedian(data.fireRateWait),
                    draw = getMedian(data.draw),
                    capacity = getMedian(data.capacity),
                    spreadDegrees = getMedian(data.spreadDegrees),
                    reloadTime = getMedian(data.reloadTime);

                const limit_fireRateWait = clamp((fireRateWait + 5) / 7, 0, 4),
                    limit_draw = clamp(draw - 1, 0, 2),
                    limit_capacity = clamp(capacity / 3 - 1, 0, 7),
                    limit_spreadDegrees = clamp(spreadDegrees / 5 - 1, 0, 2),
                    limit_reloadTime = clamp(reloadTime / 25 + 0.8, 0, 2);

                let bestScore = 1000;
                const wid = this.#dataList;
                const len = wid.length;
                for (let i = 0; i < len; i++) {
                    const e = wid[i];
                    let score = Math.abs(limit_fireRateWait - e.fireRateWait) * 2; /* 施放延迟 权重2 */
                    score += Math.abs(limit_draw - e.draw) * 20 /* 施放数 权重 20 */;
                    score += Math.abs(data.shuffle - e.shuffle) * 30 /* 乱序 权重 30 */;
                    score += Math.abs(limit_capacity - e.capacity) * 5 /* 容量 权重 5 */;
                    score += Math.abs(limit_spreadDegrees - e.spreadDegrees) /* 散射 权重 1 */;
                    score += Math.abs(limit_reloadTime - e.reloadTime) /* 充能时间 权重 1 */;
                    score = Math.floor(score);
                    if (score <= bestScore) {
                        bestScore = score;
                        result.icon = e.icon;
                        result.name = e.name;
                        if (score === 0 && random(100) < 33) break;
                    }
                }
                return result;
            };
        })();
    };

    /** 法杖预设模板 */
    static presetTemplate = class {
        static generateData = (() => {
            /**
             * 生成法杖数据
             * @param {Number} cost 属性点数
             * @param {Number} level 法杖等级
             * @param {Boolean} unshuffle 必定否杖
             */
            return (cost, level, force_unshuffle) => {};
        })();
        /** @type {Map<String,WandData.presetTemplate>} */ static dataMap = new Map();
        constructor(datas) {
            /** @type {String} 名称 */ this.name = datas[0];
            //图标长度为0代表法杖图标自动生成
            if (datas[1] === 0) this.icon = null;
            else {
                /** @type {WandData.IconInfo} 图标信息 */
                this.icon = WandData.IconInfo.create(datas[1], datas[0]);
            }
        }
        static init() {
            /** #data: [预设法杖模板数据](template.preset.data.js) @type {Array} */
            const datas = embed(`#template.preset.data.js`);
            for (let i = 0; i < datas.length; i++) {
                const data = Object.freeze(new this(datas[i]));
                this.dataMap.set(data.name, data);
            }
        }
    };

    /** 法术配方解析  */
    static #spellRecipeParse = (() => {
        /** @type {util.parse.Token} */ let currentToken = undefined;
        /** @param {String} info */ const consoleError = info => {
            const e = new SyntaxError(`${info} index:${currentToken.index}`);
            console.error(currentToken.index, e);
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
            /** 重复次数1 */
            TR1: {
                id: "TIME_OF_REPETITION1",
                type: "number",
                color: "#7FB717",
                bgColor: "#00000000",
                fontWeight: "400"
            },
            /** 重复次数2 */
            TR2: {
                id: "TIME_OF_REPETITION2",
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
            /**  重复次数1声明符 */
            COLON: {
                id: "COLON",
                data: ":",
                color: "#CE9178",
                bgColor: "#00000000",
                fontWeight: "700"
            },
            /**  重复次数2声明符 */
            WAVE: {
                id: "WAVE",
                data: "~",
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
        const Token = util.parse.Token;
        /**
         * 法术序列解析
         * @param {String} expressionStr 表达式
         * @returns {Array<SpellData>}
         */
        return expressionStr => {
            if (expressionStr.length > 0) {
                console.groupCollapsed("法术序列表达式解析: %c`%s`", "color:#25AFF3", expressionStr);
                currentToken = undefined;
                console.groupCollapsed("🏷️ Tokenization");
                //#region 令牌化 Tokenization
                /** @type {Array<util.parse.Token>} */
                const tokens = [];
                Token.logData.init();
                const EL = expressionStr.length;
                for (let i = 0; i < EL; i++) {
                    const char = expressionStr[i];
                    if (Token.regs.number.test(char)) {
                        // 数字开头的token为重复次数
                        if (currentToken === undefined) {
                            const lastToken = tokens.at(-1);
                            if (lastToken.type === "COLON") {
                                //上个token是":" 则该数字表示重复次数1
                                currentToken = new Token(tokenEnum.TR1, i);
                            } else if (lastToken.type === "WAVE") {
                                //上个token是"~" 则该数字表示重复次数2
                                currentToken = new Token(tokenEnum.TR2, i);
                            } else if (lastToken.type === "CARET") {
                                //上个token是"^" 则该数字表示剩余次数
                                currentToken = new Token(tokenEnum.REMAIN, i);
                            } else {
                                currentToken = new Token(tokenEnum.UND, i);
                                consoleError("法术ID不允许数字开头 数字必须用于表示法术重复次数或法术剩余次数");
                                return [];
                            }
                            currentToken.push(char);
                        } else currentToken.push(char);
                    } else if (Token.regs.word.test(char)) {
                        // 字母开头的token为法术ID或可替换法术表达式
                        if (currentToken === undefined) {
                            if (tokens.at(-1)?.type === "BRACKET_SQUARE_LEFT") currentToken = new Token(tokenEnum.RSE, i);
                            else currentToken = new Token(tokenEnum.SI, i);
                        }
                        currentToken.push(char);
                    } else if (Token.regs.operator1.test(char)) {
                        if (currentToken === undefined) {
                            if (tokens.at(-1)?.type === "BRACKET_SQUARE_LEFT") {
                                currentToken = new Token(tokenEnum.RSE);
                            }
                            currentToken.push(char);
                        } else if (currentToken.type === "REPLACEABLE_SPELL_EXPRESSION") {
                            currentToken.push(char);
                        } else {
                            consoleError(`不合法的字符: "${char}"`);
                            console.log("该运算符必须出现在法术查询表达式中");
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
                    } else if (char === "#") {
                        if (currentToken === undefined) {
                            if (tokens.at(-1)?.type === "BRACKET_SQUARE_LEFT") {
                                currentToken = new Token(tokenEnum.RSE);
                            }
                            currentToken.push(char);
                        } else if (currentToken.type === "REPLACEABLE_SPELL_EXPRESSION") {
                            currentToken.push(char);
                        } else {
                            consoleError(`不合法的字符: "${char}"`);
                            console.log("法术标签必须出现在法术查询表达式中");
                            return [];
                        }
                    } else {
                        // 遇到以下字符需要结束当前token
                        if (currentToken) {
                            currentToken.finish();
                            tokens.push(currentToken);
                            currentToken = undefined;
                        }
                        switch (char) {
                            case ":":
                                tokens.push(new Token(tokenEnum.COLON, i));
                                break;
                            case "~":
                                tokens.push(new Token(tokenEnum.WAVE, i));
                                break;
                            case "[":
                                tokens.push(new Token(tokenEnum.BRACKET_SL, i));
                                break;
                            case "]":
                                tokens.push(new Token(tokenEnum.BRACKET_SR, i));
                                break;
                            case "^":
                                tokens.push(new Token(tokenEnum.CARET, i));
                                break;
                            default:
                                currentToken = new Token(tokenEnum.UND, i);
                                currentToken.data = char;
                                consoleError(`不合法的字符: "${char}"`);
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
                /** @type {Array<SpellRecipeItem>} */
                const result = [];
                let currentSpellResult = result[0];
                const TL = tokens.length;
                for (let i = 0; i < TL; i++) {
                    currentToken = tokens[i];
                    currentSpellResult = result.at(-1);
                    switch (currentToken.type) {
                        case "SPELL_ID":
                            result.push({
                                type: "固定法术",
                                // attrStr: `spell.id="${currentToken.data}"`,
                                datas: [Spell.queryById(currentToken.data)],
                                instanceData: { remain: Infinity },
                                min: 1,
                                max: 1,
                                flag_REMAIN: false,
                                flag_TIME_OF_REPETITION: 0
                            });
                            break;
                        case "REPLACEABLE_SPELL_EXPRESSION":
                            result.push({
                                type: "可替换法术",
                                // attrStr: `spell.exp="${currentToken.data}"`,
                                datas: Spell.queryByExp(currentToken.data),
                                instanceData: { remain: Infinity },
                                min: 1,
                                max: 1,
                                flag_REMAIN: false,
                                flag_TIME_OF_REPETITION: 0
                            });
                            break;
                        case "REMAIN":
                            if (currentSpellResult) {
                                if (currentSpellResult.flag_REMAIN) consoleError("重复声明剩余次数"); // 非严重错误
                                else {
                                    // currentSpellResult.attrStr += `spell.remain=${currentToken.data}`;
                                    currentSpellResult.instanceData.remain = currentToken.data;
                                    currentSpellResult.flag_REMAIN = true;
                                }
                            } else {
                                consoleError("未指定目标法术");
                                return [];
                            }
                            break;
                        case "TIME_OF_REPETITION1":
                            if (currentSpellResult) {
                                if (currentSpellResult.flag_TIME_OF_REPETITION === 0) {
                                    const data = currentToken.data;
                                    if (data >= 0) {
                                        //次数允许为0 用于配合~表示范围
                                        currentSpellResult.min = data;
                                        currentSpellResult.max = data;
                                    } else {
                                        consoleError("重复次数不可为负数");
                                        return [];
                                    }
                                    currentSpellResult.flag_TIME_OF_REPETITION = 1;
                                } else consoleError("重复声明剩余次数"); // 非严重错误
                            } else {
                                consoleError("未指定目标法术");
                                return [];
                            }
                            break;
                        case "TIME_OF_REPETITION2":
                            if (currentSpellResult) {
                                if (currentToken.data > 0) {
                                    if (currentSpellResult.flag_TIME_OF_REPETITION === 0) {
                                        currentSpellResult.min = 0;
                                        currentSpellResult.max = currentToken.data;
                                        currentSpellResult.flag_TIME_OF_REPETITION === 2;
                                    } else if (currentSpellResult.flag_TIME_OF_REPETITION === 1) {
                                        if (currentToken.data > currentSpellResult.max) currentSpellResult.max = currentToken.data;
                                        else currentSpellResult.min = currentToken.data;
                                        currentSpellResult.flag_TIME_OF_REPETITION === 2;
                                    } else {
                                        consoleError("重复次数声明格式非法");
                                        return [];
                                    }
                                } else {
                                    consoleError("重复次数必须为正整数");
                                    return [];
                                }
                            } else {
                                consoleError("未指定目标法术");
                                return [];
                            }
                            break;
                    }
                }
                console.table(result, ["type", "min", "max", "instanceData"]);
                console.groupEnd();
                //#endregion
                console.groupEnd();

                return result;
            } else return [];
        };
    })();

    /** 通过模板获取法杖数据 */
    static getDataByTemplate(name, useRangeValue = false) {
        const templateData = this.presetTemplate.dataMap.get(name);
        if (templateData) {
            return {
                icon: templateData.icon,
                name: templateData.name,
                capacity: 0,
                draw: 0,
                fireRateWait: 0,
                reloadTime: 0,
                manaChargeSpeed: 0,
                shuffle: false,
                spreadDegrees: 0,
                speedMultiplier: 0,
                manaMax: 0,
                staticSpells: "",
                dynamicSpells: ""
            };
        } else return null;
    }

    /** @param {Array} datas */
    constructor(datas) {
        /** @type {String} 名称 */ this.name = datas[0];
        /** @type {NumRangeOrConstant} 容量 */ this.capacity = datas[2];
        /** @type {NumRangeOrConstant} 抽取数 */ this.draw = datas[3];
        /** @type {NumRangeOrConstant} 施放延迟 */ this.fireRateWait = datas[4];
        /** @type {NumRangeOrConstant} 充能时间 */ this.reloadTime = datas[5];
        /** @type {Boolean} 乱序 */ this.shuffle = datas[6];
        /** @type {NumRangeOrConstant} 散射角度 */ this.spreadDegrees = datas[7];
        /** @type {NumRangeOrConstant} 投射物速度 */ this.speedMultiplier = datas[8];
        /** @type {NumRangeOrConstant} 法力恢复速度 */ this.manaChargeSpeed = datas[9];
        /** @type {NumRangeOrConstant} 法力上限 */ this.manaMax = datas[10];
        /** @type {Array<SpellRecipeItem>} 始终施放 `法术配方表达式` */ this.staticSpells = new.target.#spellRecipeParse(datas[11]);
        /** @type {Array<SpellRecipeItem>} 活动法术 `法术配方表达式` */ this.dynamicSpells = new.target.#spellRecipeParse(datas[12]);
        // 决定法杖图标
        const iconName = datas[1];
        if (iconName === "AUTO") {
            const info = WandData.MatchData.getInfo(this);
            /** @type {WandData.IconInfo} 图标信息 */ this.icon = info.icon;
            if (this.name === "AUTO") /** @type {String} 名称 */ this.name = info.name;
        } else this.icon = WandData.IconInfo.get(iconName);
    }

    static init() {
        this.MatchData.init();
        this.presetTemplate.init();
    }
};