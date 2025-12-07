/**
 * 天赋图标
 */
class Icon extends $icon(12, "天赋") {
    static urls = new SpriteSpliter("PerkIcons", embed(`#icon.png`)).results;

    /** @type {PerkData?} */ #data;

    /** @param {PerkData} data  */
    constructor(data) {
        super(12);
        this.#data = data;
    }

    connectedCallback() {
        const data = this.#data ?? PerkData.query(this.dataset.id);
        this.alt = data.name;
        this.src = data.asyncIconUrl;
    }
}

Icon.define("-perk");

/** @typedef {import("TYPE").PerkId} PerkId */
/** @typedef {import("TYPE").PerkName} PerkName */
/** @typedef {import("TYPE").PerkData} PerkData */
class PerkData {
    static data = {
        /** @type {Array<PerkData>} */ all: [],
        /** @type {Map<String,PerkData>} */ map: new Map()
    };
    /** ⚪️ 空天赋 @type {PerkData} */ static $NULL;
    /** @type {Number} 辅助变量 用于记录天赋图标索引 */ static #index = 0;
    static #typeList = [/* 特殊 */ "null", /* 普通 */ "common", /* 一次性 */ "disposable", /* 精粹 */ "essence"];
    /** @type {Number} 图标索引 */ #iconIndex;

    /** @param {Array} data */
    constructor(data, index) {
        this.#iconIndex = index;
        [
            this.id, //=============[0] id
            this.name, //===========[1] 名称
            this.desc, //===========[2] 描述
            ,
            //======================[3] 类型
            this.maxStack, //=======[4] 堆叠极限
            this.maxInPool, //======[5] 池含量
            this.gameEffect, //=====[6] 游戏效果
            ,
            //======================[7] 敌人可用性
            this.nameKey = "", //===[8] 名称翻译键
            this.descKey = "" //====[9] 描述翻译键
        ] = data;
        /** @type {String} 类型 [特殊,普通,一次性,精粹] */ this.type = PerkData.#typeList[data[3]];
        /** @type {Boolean} 敌人能否使用 */ this.usableByEnemies = data[7] === 1;
    }

    get icon() {
        return new Icon(this);
    }

    /** @return {Promise<String>} */
    get asyncIconUrl() {
        return new Promise(resolve => Icon.urls.then(value => resolve(value[this.#iconIndex])));
    }

    /**
     *  @param {PerkId|PerkName} key
     * @returns {PerkData}
     */
    static query = key => {
        if (key[0] === "$") return this.$NULL[key] ?? this.#index;
        else return this.data.map.get(key) ?? this.$NULL;
    };

    /** 初始化数据库 */
    static init() {
        this.$NULL = new this(["_NULL", "空白", "NULL", 0, 0, 0, "", 0]);
        this.$NULL.$common = freeze(new this(["$common", "普通天赋", "普通天赋", 1, 0, 0, "", 0]));
        this.$NULL.$disposable = freeze(new this(["$disposable", "一次性天赋", "一次性天赋", 2, 0, 0, "", 0]));
        this.$NULL.$essence = freeze(new this(["$essence", "精粹", "精粹", 3, 0, 0, "", 0]));
        freeze(this.$NULL);

        [...embed(`#data.js`).values().chunks(10)].forEach((v, i) => {
            const data = freeze(new this(v, i));
            const storage = this.data;
            storage.all.push(data);
            storage.map.set(data.id, data);
            storage.map.set(data.name, data);
        });

        // 特殊天赋 --- 贪婪诅咒
        const greedCurse = new this(["GREED_CURSE", "贪婪诅咒", "敌人会掉落3倍的黄金，但你要承受恐怖的诅咒！", 0, 128, 0, "", 0]);
        Object.defineProperty(greedCurse, "icon", {
            get() {
                const img = new Image();
                img.alt = `天赋图标:${this.name}`;
                img.src = embed(`#icon_greedCurse.png`);
                return img;
            }
        });
        Object.freeze(greedCurse);
        this.data.all.push(greedCurse);
        this.data.map.set(greedCurse.id, greedCurse);
        this.data.map.set(greedCurse.name, greedCurse);
    }
}
