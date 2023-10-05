DB.perk = class {
    /** @type {Promise<HTMLImageElement>} 图标精灵图 */
    static iconImage = utilities.base64ToImg("perkIcon.png");
    static iconImage_greedCurse = utilities.base64ToImg("perkIcon_greedCurse.png");
    static data = {
        id_map: new Map(),
        name_map: new Map()
    };
    /**
     * ⚪️ 空天赋  
     * @type {DB.perk} 
     */
    static $NULL;
    /** @type {Number} 辅助变量 用于记录天赋图标索引 */
    static #index = 0;
    //#region 成员
    /** @type {Number} 图标索引 */#_index;
    /** @type {String} `★主键` 天赋标识符 */id;
    /** @type {String} 中文译名 */name;
    /** @type {String} 基础描述 */description;
    /** @type {String} 类型 [特殊,普通,一次性,精粹] */type;
    /** @type {Number} 堆叠极限 */maxStack;
    /** @type {Number} 天赋池允许存在的最大数量 */maxInPool;
    /** @type {String} 游戏效果 */gameEffect;
    /** @type {Boolean} 敌人能否使用 */usableByEnemies;
    //#endregion

    constructor(dataArray) {
        /** @type {typeof DB.perk} */
        const _ = this.constructor;
        /** @type {Number} 图标索引 */
        this.#_index = _.#index;
        _.#index++;
        this.id = dataArray[0];
        this.name = dataArray[1];
        this.description = dataArray[2];
        switch (dataArray[3]) {
            case 0: this.type = "null"; break; //特殊
            case 1: this.type = "common"; break; //普通
            case 2: this.type = "disposable"; break; //一次性
            case 3: this.type = "essence"; break; //精粹
            default:
                console.error("未知的天赋类型");
                this.type = "undefined";
        }
        this.maxStack = dataArray[4];
        this.maxInPool = dataArray[5];
        this.gameEffect = dataArray[6];
        this.usableByEnemies = dataArray[7] === 1;

    };

    async getIcon() {
        const canvas = document.createElement("canvas");
        // canvas.ariaLabel BUG! Firefox浏览器下是无法让属性显示在html标签中的
        canvas.setAttribute("aria-label", `天赋图标:${this.name}`);// 无障碍标注
        canvas.width = 12;
        canvas.height = 12;
        canvas.getContext("2d").drawImage(await this.constructor.iconImage, (this.#_index - 1) * 12, 0, 12, 12, 0, 0, 12, 12);
        return canvas;
    };

    static queryById = id => {
        const result = this.data.id_map.get(id);
        if (result) return result;
        else return this.$NULL;
    };

    static queryByName = name => {
        const result = this.data.id_map.get(name);
        if (result) return result;
        else return this.$NULL;
    };

    /** 初始化数据库 */
    static init() {
        this.$NULL = Object.freeze(new this(["_NULL", "空白", "NULL", 0, 128, 0, "", 0]));
        // data : 嵌入天赋数据
        /** @type {Array} */
        const datas = "perkData.jsonc";
        for (let i = 0; i < datas.length; i++) {
            const data = Object.freeze(new this(datas[i]));
            const storage = this.data;
            storage.id_map.set(data.id, data);
            storage.name_map.set(data.name, data);
        }
        // 特殊天赋 --- 贪婪诅咒
        const greedCurse = new this(["GREED_CURSE", "贪婪诅咒", "敌人会掉落3倍的黄金，但你要承受恐怖的诅咒！", 0, 128, 0, "", 0]);
        this.#index --;
        greedCurse.getIcon = async () => {
            const canvas = document.createElement("canvas");
            // canvas.ariaLabel BUG! Firefox浏览器下是无法让属性显示在html标签中的
            canvas.setAttribute("aria-label", `天赋图标:${this.name}`);// 无障碍标注
            canvas.width = 16;
            canvas.height = 16;
            canvas.getContext("2d").drawImage(await this.iconImage_greedCurse, 0, 0, 16, 16, 0, 0, 16, 16);
            return canvas;
        };
        const greedCurse_freeze = Object.freeze(greedCurse);
        this.data.id_map.set(greedCurse_freeze.id, greedCurse_freeze);
        this.data.name_map.set(greedCurse_freeze.name, greedCurse_freeze);
    }

};