class Icon extends $icon(15, "魔杖") {
    static img = asyncImg(embed(`#icon.png`));
    /** @typedef {{index:Number,name:String,asyncUrl:Promise<String>,length:Number,frame:Number}} IconInfo */
    /** @type {Map<String,IconInfo>}  */ static #dataMap = new Map();
    /** @type {Number} 辅助变量 用于记录法杖图标起始位置 */ static #currentOrigin = 0;
    /** @type {Number} 辅助变量 用于记录法杖图标索引 */ static #currentIndex = 1;
    #data;
    constructor(name) {
        super(); //后续需要改高度 魔杖高度不固定
        this.#data = Icon.#dataMap.get(name);
        if (this.#data) this.height = this.#data.length / this.#data.frame;
    }

    get name() {
        return this.#data?.name;
    }

    get asyncUrl() {
        return this.#data?.asyncUrl;
    }

    get index() {
        return this.#data?.index;
    }

    get length() {
        return this.#data?.length;
    }

    get frame() {
        return this.#data?.frame;
    }

    connectedCallback() {
        if (!this.#data) {
            this.#data = Icon.#dataMap.get(this.getAttribute("wand.icon"));
            this.height = this.#data.length / this.#data.frame;
        }
        if (this.#data.frame > 1) {
            this.style.setProperty("--f", this.#data.frame - 1); // 这里应该减1
            this.style.objectPosition = "center calc(var(--p,0)/var(--f,1)*100%)";
            this.style.objectFit = "cover";
            this.style.transition = "unset";
            this.#play();
        }
        this.alt = this.#data.name;
        this.src = this.#data.asyncUrl;
    }

    #play() {
        const { frame } = this.#data;
        let interval = 0;
        const fn = () => {
            if (this.isConnected) {
                interval++;
                if (interval % 2 === 0) {
                    const p = Number(this.style.getPropertyValue("--p"));
                    if (p < frame - 1) /*  这里也应该减一 */ this.style.setProperty("--p", p + 1);
                    else this.style.setProperty("--p", 0);
                }
                requestAnimationFrame(fn);
            }
        };
        fn();
    }

    /**
     * 创建图标数据缓存
     * @param {Number} length 长度
     * @param {String} [name] 名称  自动生成`#index`格式名称
     * @param {Number} [frame] 动画帧数 默认1
     */
    static cache(name = "#" + this.#currentIndex, length, frame = 1) {
        const origin = this.#currentOrigin; // 你猜我为什么要搁着单独存一下起点位置
        const asyncUrl = new Promise(async resolve => {
            const canvas = createElement("canvas");
            canvas.height = length;
            canvas.width = 15;
            const ctx = canvas.getContext("2d");
            ctx.rotate(-Math.PI / 2);
            ctx.drawImage(await this.img, origin, 0, length, 15, -length, 0, length, 15);
            canvas.toBlob(blob => resolve(URL.createObjectURL(blob)), "image/webp", 1);
        });
        this.#dataMap.set(name, freeze({ asyncUrl, index: this.#currentIndex, name, length, frame }));
        this.#currentOrigin += length;
        this.#currentIndex++;
        return name;
    }
}

Icon.$defineElement("-wand");

/** @typedef {import("TYPE").WandData} WandData */
/** @typedef {import("TYPE").WandData.IconInfo} WandData.IconInfo */
/** @typedef {import("TYPE").WandData.MatchData} WandData.MatchData */

/** 法杖数据 */
class WandData {
    /** 法杖匹配数据 */
    static MatchData = class MatchData {
        /** @type {Array<WandData.MatchData>} */ static #dataList = [];

        /** 查找图标要使用的名称 */
        #name;
        constructor(data) {
            this.#name = Icon.cache(void 0, data[0]);
            [
                ,
                //=====================[0] 宽度
                this.capacity, //======[1] 容量
                this.draw, //==========[2] 抽取数
                this.fireRateWait, //==[3] 施放延迟
                this.reloadTime, //====[4] 充能时间
                ,
                //=====================[5] 乱序
                this.spreadDegrees //==[6] 散射
            ] = data;

            /** @type {Boolean} 乱序 */ this.shuffle = data[5] === 1;
        }

        get icon() {
            return new Icon(this.#name);
        }

        static init() {
            /** #data: [常规法杖模板数据](template.match.data.js) @type {Array} */
            const datas = embed(`#template.match.data.js`);
            for (let i = 0; i < datas.length; i += 7) this.#dataList.push(Object.freeze(new this(datas.slice(i, i + 7))));
        }
        /** 通过属性获取部分属性 */
        static getInfo = (() => {
            /**
             * 范围值取中位数
             * @param {{min:Number,max:Number}|Number} value
             * @returns {Number}
             */
            const median = value => (typeof value === "number" ? value : (value.min + value.max) / 2);
            const clamp = math_.clamp;
            const random = math_.random;
            /**
             * @param {WandData} data
             * @returns {WandData.MatchData}
             */
            return data => {
                /** @type {WandData.MatchData} */ let result = {};
                const fireRateWait = median(data.fireRateWait),
                    draw = median(data.draw),
                    capacity = median(data.capacity),
                    spreadDegrees = median(data.spreadDegrees),
                    reloadTime = median(data.reloadTime);

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
                        result = e;
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

        #length;
        constructor(datas) {
            /** @type {String} 名称 */ this.name = datas[0];
            //图标长度为0代表法杖图标自动生成
            if (datas[1] === 0) this.icon = null;
            else {
                this.#length = datas[1];
                Icon.cache(datas[0], datas[1], datas[2] ?? 1);
            }
        }

        get icon() {
            if (this.#length) return new Icon(this.name);
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

    /** 解析法术配方  */
    static #parseRecipe = (() => {
        //prettier-ignore
        embed(`#expParser.js`)
        return parse;
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

    /** @param {Array} data */
    constructor(data) {
        [
            /** @type {String} 名称 */
            this.name,
            ,
            /** @type {RangeValue} 容量 */
            this.capacity,
            /** @type {RangeValue} 抽取数 */
            this.draw,
            /** @type {RangeValue} 施放延迟 */
            this.fireRateWait,
            /** @type {RangeValue} 充能时间 */
            this.reloadTime,
            /** @type {Boolean} 乱序 */
            this.shuffle,
            /** @type {RangeValue} 散射角度 */
            this.spreadDegrees,
            /** @type {RangeValue} 投射物速度 */
            this.speedMultiplier,
            /** @type {RangeValue} 法力恢复速度 */
            this.manaChargeSpeed,
            /** @type {RangeValue} 法力上限 */
            this.manaMax
        ] = data;
        /** @type {Array<SpellRecipeItem>} 始终施放 `法术配方表达式` */ this.staticSpells = WandData.#parseRecipe(data[11]);
        /** @type {Array<SpellRecipeItem>} 活动法术 `法术配方表达式` */ this.dynamicSpells = WandData.#parseRecipe(data[12]);
        // 决定法杖图标
        const iconName = data[1];
        if (iconName === "AUTO") {
            const info = WandData.MatchData.getInfo(this);
            /** @type {HTMLImageElement} 图标 */ this.icon = info.icon;
            if (this.name === "AUTO") /** @type {String} 名称 */ this.name = info.name;
        } else this.icon = new Icon(iconName);
    }

    static init() {
        this.MatchData.init();
        this.presetTemplate.init();
    }
}
