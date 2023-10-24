/** 法术数据 */
const SpellData = class {
    static iconImage = util.base64ToImg(embed(`#icon.png`));

    /** 提供投射物数据 */
    static OfferedProjectileData = class {
        /**
         * @param {String} projectileId
         * @param {Number} num_min
         * @param {Number} num_max
         * @param {Boolean} isRelatedProjectiles
         * @param {Boolean} isInCastState
         */
        constructor(projectileId, num_min, num_max, isRelatedProjectiles, isInCastState) {
            /** @type {db_entity} 投射物数据 */ this.projectileData = Entity.queryById(projectileId);
            /** @type {Number} 最小提供量 */ this.num_min = num_min;
            /** @type {Number} 最大提供量 */ this.num_max = num_max;
            /** @type {Boolean} 是否为关联投射物 能否进行追加触发 (首个投射物默认为 true) */ this.isRelatedProjectiles = isRelatedProjectiles;
            /** @type {Boolean} 处于施法块中 (能否享受施法状态中的效果) */ this.isInCastState = isInCastState;
        }
        /**
         * 获取提供投射物数据数组
         * @param {String} dataStr
         * @returns {Array<SpellData.OfferedProjectileData>}
         */
        static createDatas = dataStr => {
            const result = [];
            if (dataStr) {
                let first = true; //首个投射物默认为关联投射物 创建首个投射物后该变量值为false
                let isInCastState = true;
                let projectileId = [];
                let projectileNum_min = [];
                let projectileNum_max = [];
                let current = projectileId;
                let projectileNum_min_number = 0;
                let projectileNum_max_number = 0;
                for (let i = 0; i < dataStr.length; i++) {
                    const char = dataStr[i];
                    switch (char) {
                        case "!" /* 直接提供投射物 */:
                            isInCastState = true;
                            current = projectileNum_min;
                            break;
                        case "?" /* 间接提供投射物 */:
                            current = projectileNum_min;
                            isInCastState = false;
                            break;
                        case "~" /* 不定数量投射物 */:
                            current = projectileNum_max;
                            break;
                        case " " /* 切换至下种投射物 */:
                            if (projectileNum_min.length > 0) projectileNum_min_number = parseInt(projectileNum_min.join(""));
                            else projectileNum_min_number = 1;
                            if (projectileNum_max.length > 0) projectileNum_max_number = parseInt(projectileNum_max.join(""));
                            else projectileNum_max_number = projectileNum_min_number;
                            result.push(Object.freeze(new this(projectileId.join(""), projectileNum_min_number, projectileNum_max_number, first, isInCastState)));
                            first = false;
                            projectileId = [];
                            projectileNum_min = [];
                            projectileNum_max = [];
                            current = projectileId;
                            break;
                        default:
                            current.push(char);
                    }
                }
                if (projectileNum_min.length > 0) projectileNum_min_number = parseInt(projectileNum_min.join(""));
                else projectileNum_min_number = 1;
                if (projectileNum_max.length > 0) projectileNum_max_number = parseInt(projectileNum_max.join(""));
                else projectileNum_max_number = projectileNum_min_number;
                result.push(Object.freeze(new this(projectileId.join(""), projectileNum_min_number, projectileNum_max_number, first, isInCastState)));
            }
            return result;
        };
    };
    /** 抽取数据 */
    static DrawingData = class {
        /**
         * 获取提供抽取数数据数组
         * @param {String} dataStr
         */
        constructor(dataStr) {
            let C = [],
                H = [],
                T_count = [],
                T_delay = [],
                D = [];
            let current = C;
            for (let char of dataStr)
                switch (char) {
                    case "H":
                        current = H;
                        break;
                    case "T":
                        current = T_count;
                        break;
                    case ":":
                        current = T_delay;
                        break;
                    case "D":
                        current = D;
                        break;
                    default:
                        current.push(char);
                }
            C = Number(C.join(""));
            H = Number(H.join(""));
            T_count = Number(T_count.join(""));
            T_delay = Number(T_delay.join(""));
            D = Number(D.join(""));
            /** @type {Number} 普通抽取 */ this.common = Number.isNaN(C) ? 0 : C;
            /** @type {Number} 碰撞抽取 */ this.hit = Number.isNaN(H) ? 0 : H;
            /** @type {{count:Number,delay:Number}} 定时抽取 */ this.timer = {
                count: Number.isNaN(T_count) ? 0 : T_count,
                delay: Number.isNaN(T_delay) ? 0 : T_delay
            };
            /** @type {Number} 失效抽取 */ this.death = Number.isNaN(D) ? 0 : D;
        }
    };
    /** 法术生成数据 -1表示非该等级法术 */
    static SpawningData = class {
        /** @type {Number} */ prob_lv0 = -1;
        /** @type {Number} */ prob_lv1 = -1;
        /** @type {Number} */ prob_lv2 = -1;
        /** @type {Number} */ prob_lv3 = -1;
        /** @type {Number} */ prob_lv4 = -1;
        /** @type {Number} */ prob_lv5 = -1;
        /** @type {Number} */ prob_lv6 = -1;
        /** @type {Number} */ prob_lv7 = -1;
        /** @type {Number} */ prob_lv10 = -1;
        /** @type {String} 生成解锁条件 */ requiresFlag = "None";
        /**
         *
         * @param {String} levels
         * @param {String} probs
         */
        constructor(levels, probs, requiresFlag) {
            if (requiresFlag) this.requiresFlag = requiresFlag;
            //转为数组
            const levels_ = levels.split(",");
            const probs_ = probs.split(",");
            const len = levels_.length;
            for (let i = 0; i < len; i++) {
                // this[`prob_lv${levels_[i]}`] = Number(probs_[i]); //效率似乎不行
                const prob = Number(probs_[i]);
                switch (levels_[i]) {
                    case "0":
                        this.prob_lv0 = prob;
                        break;
                    case "1":
                        this.prob_lv1 = prob;
                        break;
                    case "2":
                        this.prob_lv2 = prob;
                        break;
                    case "3":
                        this.prob_lv3 = prob;
                        break;
                    case "4":
                        this.prob_lv4 = prob;
                        break;
                    case "5":
                        this.prob_lv5 = prob;
                        break;
                    case "6":
                        this.prob_lv6 = prob;
                        break;
                    case "7":
                        this.prob_lv7 = prob;
                        break;
                    case "10":
                        this.prob_lv10 = prob;
                }
            }
        }
    };

    /** @typedef {Set<SpellData>} SpellSet 法术集合 */
    static data = {
        /** @type {Map<String,SpellData>} id  data */ id_map: new Map(),
        /** @type {Map<String,SpellData>} */ name_map: new Map(),

        /** @type {SpellSet} 所有法术 */ all: new Set(),

        /** @type {SpellSet} 投射物类型法术 */ type_projectile: new Set(),
        /** @type {SpellSet} 静态投射物类型法术 */ type_staticProjectile: new Set(),
        /** @type {SpellSet} 修正类型法术 */ type_modifier: new Set(),
        /** @type {SpellSet} 多重类型法术 */ type_drawMany: new Set(),
        /** @type {SpellSet} 材料类型法术 */ type_material: new Set(),
        /** @type {SpellSet} 其他类型法术 */ type_other: new Set(),
        /** @type {SpellSet} 实用类型法术 */ type_utility: new Set(),
        /** @type {SpellSet} 被动类型法术 */ type_passive: new Set(),

        /** @type {SpellSet} 0级法术 */ level_0: new Set(),
        /** @type {SpellSet} 1级法术 */ level_1: new Set(),
        /** @type {SpellSet} 2级法术 */ level_2: new Set(),
        /** @type {SpellSet} 3级法术 */ level_3: new Set(),
        /** @type {SpellSet} 4级法术 */ level_4: new Set(),
        /** @type {SpellSet} 5级法术 */ level_5: new Set(),
        /** @type {SpellSet} 6级法术 */ level_6: new Set(),
        /** @type {SpellSet} 7级法术 */ level_7: new Set(),
        /** @type {SpellSet} 10级法术 */ level_10: new Set(),

        /** @type {SpellSet} 影响存在时间的法术 */ lifetime_mod: new Set(),
        /** @type {SpellSet} 增加存在时间的法术 */ lifetime_up: new Set(),
        /** @type {SpellSet} 减少存在时间的法术 */ lifetime_down: new Set(),

        /** @type {SpellSet} 不耗蓝的法术 */ mana_0: new Set(),
        /** @type {SpellSet} 低耗蓝的法术 */ mana_drainlowly: new Set(),
        /** @type {SpellSet} 回蓝的法术 */ mana_increase: new Set(),

        /** @type {SpellSet} 叠加额外修正的法术 */ extra_modifier: new Set(),

        /** @type {SpellSet} 影响投射物速度的法术 */ speed_mod: new Set(),

        /** @type {SpellSet} 带有抽取的法术 */ draw: new Set(),
        /** @type {SpellSet} 带有基础抽取的法术 */ draw_common: new Set(),
        /** @type {SpellSet} 带有碰撞触发抽取的法术 */ draw_hit: new Set(),
        /** @type {SpellSet} 带有定时触发抽取的法术 */ draw_timer: new Set(),
        /** @type {SpellSet} 带有失效触发抽取的法术 */ draw_death: new Set(),

        /** @type {SpellSet} 影响伤害的法术 */ damage_mod: new Set(),

        /** @type {SpellSet} 影响[投射物]伤害的法术 */ damage_mod_projectile: new Set(),
        /** @type {SpellSet} 影响[近战]伤害的法术 */ damage_mod_melee: new Set(),
        /** @type {SpellSet} 影响[雷电]伤害的法术 */ damage_mod_electricity: new Set(),
        /** @type {SpellSet} 影响[火焰]伤害的法术 */ damage_mod_fire: new Set(),
        /** @type {SpellSet} 影响[爆炸]伤害的法术 */ damage_mod_explosion: new Set(),
        /** @type {SpellSet} 影响[冰冻]伤害的法术 */ damage_mod_ice: new Set(),
        /** @type {SpellSet} 影响[切割]伤害的法术 */ damage_mod_slice: new Set(),
        /** @type {SpellSet} 影响[治疗]伤害的法术 */ damage_mod_healing: new Set(),
        /** @type {SpellSet} 影响[诅咒]伤害的法术 */ damage_mod_curse: new Set(),
        /** @type {SpellSet} 影响[穿凿]伤害的法术 */ damage_mod_drill: new Set(),
        /** @type {SpellSet} 影响[神圣]伤害的法术 */ damage_mod_holy: new Set(),

        /** @type {Array<SpellData>} 生成需要解锁法术 */
        spawnRequiresFlag: new Set()
    };
    /** ⚪️ 空法术 @type {SpellData} */ static $NULL;
    /** @type {Number} 辅助变量 用于记录法术图标索引 */ static #index = 0;
    static #typeList = [/* 无 */ "null", /* 投射物 */ "projectile", /* 静态投射物 */ "staticProjectile", /* 修正 */ "modifier", /* 多重 */ "drawMany", /* 材料 */ "material", /* 其它 */ "other", /* 实用 */ "utility", /* 被动 */ "passive"];
    /** @type {Number} 图标索引 */ #_index;

    /** @param {Array} datas */
    constructor(datas) {
        /** @type {typeof SpellData} */
        this.#_index = SpellData.#index;
        SpellData.#index++;
        /** @type {String} `★主键` 法术标识符 */ this.id = datas[0];
        /** @type {String} 中文译名 */ this.name = datas[1];
        /** @type {String} 基础描述 */ this.description = datas[2];
        /** @type {String} 额外描述 */ this.extraDescription = datas[3];
        /** @type {String} 法术类型 */ this.type = SpellData.#typeList[datas[4]];
        /** @type {Number} 最大使用次数 */ this.maxUse = datas[5]; // -1 代表无限
        /** @type {Boolean} 禁止无限法术 */ this.neverUnlimited = datas[6] === 1;
        /** @type {Number} 法力消耗 */ this.manaDrain = datas[7];
        /** @type {SpellData.SpawningData} 生成数据 */ this.spawningData = new SpellData.SpawningData(datas[8], datas[9], datas[40]);
        /** @type {Number} 售价 */ this.price = datas[10];
        /** @type {Array<SpellData.OfferedProjectileData>} 提供投射物 */ this.offeredProjectiles = SpellData.OfferedProjectileData.createDatas(datas[11]);
        /** @type {String} 被动效果 */ this.passiveEffect = datas[12];
        /** @type {SpellData.DrawingData} 提供抽取数 */ this.draw = new SpellData.DrawingData(datas[13]);
        /** @type {Number} 施放延迟 */ this.fireRateWait = datas[14];
        /** @type {Number} 暴击率 */ this.damageCriticalChance = datas[15];
        /** @type {DamageData} 伤害提升 */ this.damageMod = Object.freeze(new DamageData(datas[16]));
        /** @type {Number} 爆炸半径 */ this.explosionRadius = datas[17];
        /** @type {Number} 散射 */ this.spreadDegrees = datas[18];
        /** @type {Number} 阵型分布 */ this.patternDegrees = datas[19];
        /** @type {Number} 投射物速度 */ this.speedMultiplier = datas[20];
        /** @type {Number} 投射物子速度 */ this.childSpeedMultiplier = datas[21];
        /** @type {Number} 存在时间 */ this.lifetime = datas[22];
        /** @type {Number} 弹跳次数 */ this.bounces = datas[23];
        /** @type {Number} 击退力度 */ this.knockbackForce = datas[24];
        /** @type {Boolean} 启用友伤 */ this.friendlyFire = datas[25] === 1;
        /** @type {Number} **<未知>** 可能是废弃的削弱后座力的属性 */ this.dampening = datas[26];
        /** @type {Number} 抖屏力度 */ this.screenshake = datas[27];
        /** @type {Number} 电弧施放数量 */ this.lightningCount = datas[28];
        /** @type {String} 材料类型 */ this.material = datas[29];
        /** @type {Number} 材料数量 */ this.materialAmount = datas[30];
        /** @type {String} 轨迹材料 */ this.trailMaterial = datas[31];
        /** @type {Number} 轨迹材料数量 */ this.trailMaterialAmount = datas[32];
        /** @type {Number} 受重力影响度 */ this.gravity = datas[33];
        /** @type {Number} **<装饰性>** 伤害粒子数量 */ this.goreParticles = datas[34];
        /** @type {Number} **<待确定>** 碰撞箱大小 */ this.ragdollFx = datas[35];
        /** @type {String} 附加实体 */ this.extraEntities = datas[36];
        /** @type {String} 游戏效果实体 */ this.gameEffectEntities = datas[37];
        /** @type {Number} 后座力 */ this.recoilKnockback = datas[38];
        /** @type {Number} 充能时间 */ this.reloadTime = datas[39];
        /** @type {Function|null} 法术行为 */ this.action = datas[41];
    }
    /** 获取图标 */
    async getIcon() {
        const canvas = document.createElement("canvas");
        // canvas.ariaLabel BUG! Firefox浏览器下是无法让属性显示在html标签中的
        canvas.setAttribute("aria-label", `法术图标:${this.name}`); // 无障碍标注
        canvas.width = 16;
        canvas.height = 16;
        canvas.getContext("2d").drawImage(await SpellData.iconImage, (this.#_index - 1) * 16, 0, 16, 16, 0, 0, 16, 16);
        return canvas;
    }

    /**
     * 通过 `法术ID` 获取法术数据
     * @param {SpellIdEnum} id 法术ID
     * @returns {SpellData} 法术数据
     */
    static queryById = id => {
        const result = this.data.id_map.get(id);
        if (result) return result;
        else return this.$NULL;
    };
    /**
     * 通过 `法术名称` 获取法术数据
     * @param {SpellNameEnum} name 法术名称
     * @returns {SpellData} 法术数据
     */
    static queryByName = name => {
        const result = this.data.name_map.get(name);
        if (result) return result;
        else return this.$NULL;
    };

    static queryByExp = (() => {
        /** @type {util.parse.Token} */ let currentToken = undefined;
        /** @type {SpellGroup|undefined} 当前表达式 */ let currentExpression = undefined;
        /** @param {String} info */ const consoleError = info => {
            const e = new SyntaxError(`${info} index:${currentToken.index}`);
            if (currentExpression) console.error(currentToken.index, e, currentExpression);
            else console.error(currentToken.index, e);
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
            /** 法术标签 */
            ST: {
                id: "SPELL_TAG",
                color: "#FFFF80",
                bgColor: "#FFFF8040",
                fontWeight: "700",
                needBlank: true
            },
            BRACKET_SL: {
                id: "BRACKET_SMALL_LEFT",
                data: "(",
                color: "#CE9178",
                bgColor: "#00000000",
                fontWeight: "700",
                needBlank: true
            },
            BRACKET_SR: {
                id: "BRACKET_SMALL_RIGHT",
                data: ")",
                color: "#CE9178",
                bgColor: "#00000000",
                fontWeight: "700",
                needBlank: true
            },
            /** 逻辑非 */
            NOT: {
                id: "NOT",
                data: "!",
                color: "#CE9178",
                bgColor: "#00000000",
                fontWeight: "700",
                needBlank: true
            },
            /** 逻辑或 */
            OR: {
                id: "OR",
                data: "|",
                color: "#CE9178",
                bgColor: "#00000000",
                fontWeight: "700",
                needBlank: true
            },
            /** 逻辑与 */
            AND: {
                id: "AND",
                data: "&",
                color: "#CE9178",
                bgColor: "#00000000",
                fontWeight: "700",
                needBlank: true
            },
            UND: {
                id: "UND"
            }
        };
        const Token = util.parse.Token;
        class SpellGroup {
            type = "SPELL_GROUP";
            /** @type {String} 逻辑运算符 */
            operator = "";
            data1 = null;
            data2 = null;
            /**
             * @type {Number}
             * ### 匹配状态
             * * 0:未开始
             * * 1:等待匹配逻辑运算符
             * * 2:等待匹配法术标签/ID/组
             * * -1:完成
             * @memberof SpellGroup
             */
            dataState = 0;
            /**
             * @type {Number}
             * ### 匹配状态
             * * 0: 无需括号
             * * 1: 等待右括号
             * * -1: 括号已成对
             * @memberof SpellGroup
             */
            bracketState = 0;
            constructor() {}
        }
        class SpellTag {
            type = "SPELL_TAG";
            data = "";
            constructor(data) {
                this.data = data;
            }
        }
        class SpellId {
            type = "SPELL_ID";
            data = "";
            constructor(data) {
                this.data = data;
            }
        }
        /**
         * 根据AST获取法术数据数组
         * @param {{type: String, data: String, data1: String?, data2: String?}} expression
         * @returns {Set<db_sepll>}
         */
        const getSpellDatas = expression => {
            switch (expression.type) {
                case "SPELL_ID":
                    return [this.queryById(expression.data)];
                case "SPELL_TAG":
                    const _ = this.data;
                    switch (expression.data) {
                        case "all":
                            return this.data.all;
                        //#region 法术类型
                        case "type_projectile":
                            return _.type_projectile;
                        case "type_staticProjectile":
                            return _.type_staticProjectile;
                        case "type_modifier":
                            return _.type_modifier;
                        case "type_drawMany":
                            return _.type_drawMany;
                        case "type_material":
                            return _.type_material;
                        case "type_other":
                            return _.type_other;
                        case "type_utility":
                            return _.type_utility;
                        case "type_passive":
                            return _.type_passive;
                        //#endregion

                        //#region 法术等级
                        case "level_0":
                            return _.level_0;
                        case "level_1":
                            return _.level_1;
                        case "level_2":
                            return _.level_2;
                        case "level_3":
                            return _.level_3;
                        case "level_4":
                            return _.level_4;
                        case "level_5":
                            return _.level_5;
                        case "level_6":
                            return _.level_6;
                        case "level_7":
                            return _.level_7;
                        case "level_10":
                            return _.level_10;
                        //#endregion

                        case "draw":
                            return _.draw;
                        case "draw_common":
                            return _.draw_common;
                        case "draw_hit":
                            return _.draw_hit;
                        case "draw_timer":
                            return _.draw_timer;
                        case "draw_death":
                            return _.draw_death;

                        case "lifetime_mod":
                            return _.lifetime_mod;
                        case "lifetime_up":
                            return _.lifetime_up;
                        case "lifetime_down":
                            return _.lifetime_down;

                        case "mana_0":
                            return _.mana_0;
                        case "mana_drainlowly":
                            return _.mana_drainlowly;
                        case "mana_increase":
                            return _.mana_increase;
                        //#region 伤害修正
                        case "speed_mod":
                            return _.speed_mod;
                        case "damage_mod":
                            return _.damage_mod;
                        case "damage_mod_projectile":
                            return _.damage_mod_projectile;
                        case "damage_mod_melee":
                            return _.damage_mod_melee;
                        case "damage_mod_electricity":
                            return _.damage_mod_electricity;
                        case "damage_mod_fire":
                            return _.damage_mod_fire;
                        case "damage_mod_explosion":
                            return _.damage_mod_explosion;
                        case "damage_mod_ice":
                            return _.damage_mod_ice;
                        case "damage_mod_slice":
                            return _.damage_mod_slice;
                        case "damage_mod_healing":
                            return _.damage_mod_healing;
                        case "damage_mod_curse":
                            return _.damage_mod_curse;
                        case "damage_mod_drill":
                            return _.damage_mod_drill;
                        case "damage_mod_holy":
                            return _.damage_mod_holy;
                        //#endregion
                        default:
                            console.warn("暂不支持的法术法术标签", expression);
                            return new Set();
                    }
                case "SPELL_GROUP":
                    switch (expression.operator) {
                        case "AND": {
                            //取交集
                            const s1 = getSpellDatas(expression.data1);
                            const a2 = Array.from(getSpellDatas(expression.data2));
                            /** @type {Set<SpellData>} */
                            const s3 = new Set();
                            const l = a2.length;
                            for (let i = 0; i < l; i++) if (s1.has(a2[i])) s3.add(a2[i]);
                            return s3;
                        }
                        case "OR": {
                            //取并集
                            return new Set([...getSpellDatas(expression.data1), ...getSpellDatas(expression.data2)]);
                        }
                        case "NOT": {
                            //取补集
                            const a2 = Array.from(getSpellDatas(expression.data2));
                            const result = new Set(this.data.all);
                            const l = a2.length;
                            for (let i = 0; i < l; i++) result.delete(a2[i]);
                            return result;
                        }
                    }
            }
        };
        /**
         * 通过 `表达式` 获取法术数据
         * @param {SpellTagEnum|SpellId} exp 查询表达式
         * @returns {Array<SpellData>} 法术数据
         */
        return exp => {
            console.groupCollapsed("法术查询表达式解析: %c`%s`", "color:#25AFF3", exp);
            currentToken = undefined;
            console.groupCollapsed("🏷️ Tokenization");
            //#region 令牌化 Tokenization
            const tokens = [];
            Token.logData.init();
            const EL = exp.length;
            for (let i = 0; i < EL; i++) {
                const char = exp[i];
                if (Token.regs.word.test(char)) {
                    //属于单词成分
                    //作为token开头字符
                    if (currentToken === undefined) currentToken = new Token(tokenEnum.SI, i);
                    currentToken.push(char);
                } else {
                    //遇到以下字符需要结束当前token
                    if (currentToken) {
                        currentToken.finish();
                        tokens.push(currentToken);
                        currentToken = undefined;
                    }
                    // 跳过空白符
                    if (!Token.regs.blank.test(char))
                        switch (char) {
                            case "#":
                                currentToken = new Token(tokenEnum.ST, i);
                                currentToken.push(char);
                                break;
                            case "(":
                                tokens.push(new Token(tokenEnum.BRACKET_SL, i));
                                break;
                            case ")":
                                tokens.push(new Token(tokenEnum.BRACKET_SR, i));
                                break;
                            case "!":
                                tokens.push(new Token(tokenEnum.NOT, i));
                                break;
                            case "|":
                                tokens.push(new Token(tokenEnum.OR, i));
                                break;
                            case "&":
                                tokens.push(new Token(tokenEnum.AND, i));
                                break;
                            default:
                                currentToken = new Token(tokenEnum.UND, i);
                                und.data = char;
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
            //#endregion
            Token.log();
            console.groupEnd();

            console.groupCollapsed("🍁 AST");
            //#region 生成AST
            const TL = tokens.length;
            /** @type {Array<Object>} 表达式栈 */
            const expressions = [];

            currentExpression = undefined;
            /** @type {SpellGroup|undefined} 根表达式 */
            let rootExpression = undefined;
            for (let j = 0; j < TL; j++) {
                currentToken = tokens[j];
                currentExpression = expressions.at(-1);
                switch (currentToken.type) {
                    case "SPELL_ID": {
                        const spellId = new SpellId(currentToken.data);
                        if (currentExpression) {
                            if (currentExpression.dataState === 0) {
                                currentExpression.data1 = spellId;
                                currentExpression.dataState = 1;
                            } else if (currentExpression.dataState === 2) {
                                const subExpression = new SpellGroup();
                                subExpression.data1 = spellId;
                                // 子表达式更新匹配状态 已匹配第一个法术ID
                                subExpression.dataState = 1;
                                currentExpression.data2 = subExpression;
                                //更新匹配状态 完成匹配!
                                currentExpression.dataState = -1;
                                expressions.push(subExpression);
                            } else {
                                consoleError(`缺少运算符连接`);
                                return [];
                            }
                        } else {
                            rootExpression = new SpellGroup();

                            rootExpression.data1 = spellId;
                            rootExpression.dataState = 1;
                            expressions.push(rootExpression);
                        }
                        break;
                    }
                    case "SPELL_TAG":
                        if (currentExpression) {
                            if (currentExpression.dataState === 0) {
                                currentExpression.data1 = new SpellTag(currentToken.data.slice(1));
                                currentExpression.dataState = 1;
                            } else if (currentExpression.dataState === 2) {
                                const subExpression = new SpellGroup();

                                subExpression.data1 = new SpellTag(currentToken.data.slice(1));
                                // 子表达式更新匹配状态 已匹配第一个法术标签
                                subExpression.dataState = 1;

                                currentExpression.data2 = subExpression;
                                //更新匹配状态 完成匹配!
                                currentExpression.dataState = -1;
                                expressions.push(subExpression);
                            } else {
                                consoleError(`缺少运算符连接`);
                                return [];
                            }
                        } else {
                            rootExpression = new SpellGroup();
                            rootExpression.data1 = new SpellTag(currentToken.data.slice(1));
                            rootExpression.dataState = 1;
                            expressions.push(rootExpression);
                        }
                        break;
                    case "BRACKET_SMALL_LEFT": {
                        const subExpression = new SpellGroup();
                        subExpression.dataState = 0;
                        subExpression.bracketState = 1;
                        if (currentExpression) {
                            if (currentExpression.dataState === 0) {
                                currentExpression.data1 = subExpression;
                                expressions.push(subExpression);
                                currentExpression.dataState = 1;
                            } else if (currentExpression.dataState === 2) {
                                currentExpression.data2 = subExpression;
                                expressions.push(subExpression);
                                currentExpression.dataState = -1; //完成匹配
                            } else {
                                consoleError(`缺少运算符连接`);
                                return [];
                            }
                        } else {
                            // 根表达式不存在时 左括号开头 这里应该默认多一层表达式 否则右括号完成该表达式匹配后仍然有后续逻辑运算符会导致匹配出错
                            rootExpression = new SpellGroup();
                            rootExpression.data1 = subExpression;
                            rootExpression.dataState = 1;
                            expressions.push(rootExpression, subExpression);
                        }
                        break;
                    }
                    case "BRACKET_SMALL_RIGHT":
                        if (currentExpression) {
                            if (currentExpression.dataState === 2) {
                                consoleError(`${currentToken.data} 缺少法术标签或法术ID连接`);
                                return [];
                            } else {
                                let pairedBracket = false; //取消无意义法术组时可能会丢失需要匹配的左括号 这里需要记录是否在取消无意义法术组中已经完成了括号配对
                                if (currentExpression.dataState === 1) {
                                    pairedBracket = currentExpression.bracketState === 1;
                                    const parentExpression = expressions.at(-2);
                                    if (parentExpression.dataState === 1) parentExpression.data1 = currentExpression.data1;
                                    else if (parentExpression.dataState === -1) parentExpression.data2 = currentExpression.data1;
                                    expressions.pop();
                                    currentExpression = expressions.at(-1);
                                }
                                if (!pairedBracket) {
                                    while (currentExpression.bracketState !== 1) {
                                        if (expressions.length > 1) {
                                            expressions.pop();
                                            currentExpression = expressions.at(-1);
                                        } else {
                                            consoleError(`不成对的括号`);
                                            return [];
                                        }
                                    }
                                    currentExpression.bracketState = -1;
                                }
                                // 你永远也等不到运算符了 所以你应该是一个法术标签/ID 而不是法术标签组
                                if (currentExpression.dataState === 1) {
                                    const parentExpression = expressions.at(-2);
                                    if (parentExpression.dataState === 1) parentExpression.data1 = currentExpression.data1;
                                    else if (parentExpression.dataState === -1) parentExpression.data2 = currentExpression.data1;
                                    expressions.pop();
                                    currentExpression = expressions.at(-1);
                                }
                                //防止根表达式弹出
                                if (expressions.length > 1) expressions.pop();
                            }
                        } else {
                            consoleError(`不成对的括号`);
                            return [];
                        }
                        break;
                    case "NOT": {
                        const subExpression = new SpellGroup();
                        subExpression.dataState = 2;
                        subExpression.data1 = null;
                        subExpression.operator = "NOT";
                        if (currentExpression) {
                            if (currentExpression.dataState === 0) {
                                currentExpression.data1 = subExpression;
                                currentExpression.dataState = 1;
                                expressions.push(subExpression);
                            } else if (currentExpression.dataState === 2) {
                                currentExpression.data2 = subExpression;
                                currentExpression.dataState = -1;
                                expressions.push(subExpression);
                            } else if (currentExpression.dataState === 1) {
                                consoleError("! 不可以用于连接两个法术标签或法术ID");
                                return [];
                            }
                        } else {
                            rootExpression = subExpression;
                            expressions.push(subExpression);
                        }
                        break;
                    }
                    case "OR":
                        if (currentExpression) {
                            if (currentExpression.dataState === 1) {
                                currentExpression.dataState = 2;
                                currentExpression.operator = "OR";
                            } else if (currentExpression.dataState === 2) {
                                consoleError("已存在逻辑运算符");
                                return [];
                            }
                        } else {
                            consoleError("缺少被连接的法术标签或ID");
                            return [];
                        }
                        break;
                    case "AND":
                        if (currentExpression) {
                            if (currentExpression.dataState === 1) {
                                currentExpression.dataState = 2;
                                currentExpression.operator = "AND";
                            } else if (currentExpression.dataState === 2) {
                                consoleError("已存在逻辑运算符");
                                return [];
                            }
                        } else {
                            consoleError("缺少被连接的法术标签或ID");
                            return [];
                        }
                        break;
                }
            }
            currentExpression = expressions[expressions.length - 1];
            // 你永远也等不到运算符了 所以你应该是一个法术标签/ID 而不是法术标签组
            if (currentExpression.dataState === 1) {
                const parentExpression = expressions.at(-2);
                if (parentExpression) {
                    if (parentExpression.dataState === 1) parentExpression.data1 = currentExpression.data1;
                    else if (parentExpression.dataState === -1) parentExpression.data2 = currentExpression.data1;
                    expressions.pop();
                    currentExpression = expressions.at(-1);
                } else rootExpression = currentExpression.data1;
            }
            if (rootExpression.data2 === null) {
                consoleError("缺少连接的法术标签或ID");
                return [];
            }

            //#endregion
            console.log(rootExpression);
            //#region 解析AST
            const result = getSpellDatas(rootExpression);
            console.table(result, ["id", "name", "description"]);
            //#endregion
            console.groupEnd();
            console.groupEnd();
            return [...result];
        };
    })();

    /** 初始化数据库 */
    static init() {
        this.$NULL = Object.freeze(new this(["_NULL", "空白", "NULL", "额外描述", 0, -1, 0, 0, "", "", 0, "", "", "", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, "", 0, "", 0, 0, 0, 0, "", "", 0, 0, "", ""]));

        /** #data: [法术数据](data.js) @type {Array} */
        const datas = embed(`#data.js`);
        for (let i = 0; i < datas.length; i++) {
            const data = Object.freeze(new this(datas[i]));
            const storage = this.data;
            storage.all.add(data);
            storage.id_map.set(data.id, data);
            storage.name_map.set(data.name, data);
            switch (data.type) {
                case "projectile":
                    storage.type_projectile.add(data);
                    break;
                case "staticProjectile":
                    storage.type_staticProjectile.add(data);
                    break;
                case "modifier":
                    storage.type_modifier.add(data);
                    break;
                case "drawMany":
                    storage.type_drawMany.add(data);
                    break;
                case "material":
                    storage.type_material.add(data);
                    break;
                case "other":
                    storage.type_other.add(data);
                    break;
                case "utility":
                    storage.type_utility.add(data);
                    break;
                case "passive":
                    storage.type_passive.add(data);
                    break;
            }
            const spawningData = data.spawningData;
            if (spawningData.prob_lv0 > -1) storage.level_0.add(data);
            if (spawningData.prob_lv1 > -1) storage.level_1.add(data);
            if (spawningData.prob_lv2 > -1) storage.level_2.add(data);
            if (spawningData.prob_lv3 > -1) storage.level_3.add(data);
            if (spawningData.prob_lv4 > -1) storage.level_4.add(data);
            if (spawningData.prob_lv5 > -1) storage.level_5.add(data);
            if (spawningData.prob_lv6 > -1) storage.level_6.add(data);
            if (spawningData.prob_lv7 > -1) storage.level_7.add(data);
            if (spawningData.prob_lv10 > -1) storage.level_10.add(data);
            if (spawningData.requiresFlag !== "None") storage.spawnRequiresFlag.add(data);
            const draw = data.draw;
            if (draw.common > 0) {
                storage.draw.add(data);
                storage.draw_common.add(data);
            }
            if (draw.hit > 0) {
                storage.draw.add(data);
                storage.draw_hit.add(data);
            }
            if (draw.timer.count > 0) {
                storage.draw.add(data);
                storage.draw_timer.add(data);
            }
            if (draw.death > 0) {
                storage.draw.add(data);
                storage.draw_death.add(data);
            }

            if (data.lifetime) {
                storage.lifetime_mod.add(data);
                if (data.lifetime > 0) storage.lifetime_up.add(data);
                else storage.lifetime_down.add(data);
            }

            if (data.manaDrain < 5) {
                storage.mana_drainlowly.add(data);
                if (data.manaDrain === 0) storage.mana_0.add(data);
                else storage.mana_increase.add(data);
            }

            if (data.speedMultiplier !== 1) {
                storage.speed_mod.add(data);
            }

            const damageMod = data.damageMod;

            if (damageMod.projectile) {
                storage.damage_mod_projectile.add(data);
                storage.damage_mod.add(data);
            }
            if (damageMod.melee) {
                storage.damage_mod_melee.add(data);
                storage.damage_mod.add(data);
            }
            if (damageMod.electricity) {
                storage.damage_mod_electricity.add(data);
                storage.damage_mod.add(data);
            }
            if (damageMod.fire) {
                storage.damage_mod_fire.add(data);
                storage.damage_mod.add(data);
            }
            if (damageMod.explosion) {
                storage.damage_mod_explosion.add(data);
                storage.damage_mod.add(data);
            }
            if (damageMod.ice) {
                storage.damage_mod_ice.add(data);
                storage.damage_mod.add(data);
            }
            if (damageMod.slice) {
                storage.damage_mod_slice.add(data);
                storage.damage_mod.add(data);
            }
            if (damageMod.healing) {
                storage.damage_mod_healing.add(data);
                storage.damage_mod.add(data);
            }
            if (damageMod.curse) {
                storage.damage_mod_curse.add(data);
                storage.damage_mod.add(data);
            }
            if (damageMod.drill) {
                storage.damage_mod_drill.add(data);
                storage.damage_mod.add(data);
            }
            if (damageMod.holy) {
                storage.damage_mod_holy.add(data);
                storage.damage_mod.add(data);
            }
        }
    }
};
