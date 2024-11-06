class Icon extends $icon(16, "法术") {
    static urls = new SpriteSpliter("SpellIcons", embed(`#icon.png`)).results;
    /** @type {SpellData?} */ #data;

    /** @param {SpellData} data  */
    constructor(data) {
        super();
        this.#data = data;
    }

    connectedCallback() {
        // const data = this.#data ?? SpellData.query(this.getAttribute("spell.id"));
        const data = this.#data ?? SpellData.query(this.dataset.id);
        this.alt = data.name;
        this.src = data.asyncIconUrl;
    }
}

Icon.$defineElement("-spell");

/** @typedef {import("TYPE").SpellId} SpellId */
/** @typedef {import("TYPE").SpellName} SpellName */
/** @typedef {import("TYPE").SpellAlias} SpellAlias */
/**
 * @template {SpellId} T
 * @typedef {import("TYPE").SpellData<T>} SpellData
 */

class SpellData {
    // static #iconGen = new IconGenerator(embed(`#icon.png`));
    //prettier-ignore
    static { delete this.prototype.constructor; } // 禁止从实例访问构造器
    /** 法术等级 */
    static lvs = ["lv0", "lv1", "lv2", "lv3", "lv4", "lv5", "lv6", "lv7", "lv10"];

    static ProjectileData = class ProjectileData {
        /** 类型映射表 */
        static #typeMap = ["common", "relate", "cast", "orbit", "bounce", "low-speed", "death", "hit", "timer"];
        /** @type {Number} 最小数量 */ amountMin = 1;
        /** @type {Number} 最大数量 */ amountMax = 1;
        /**
         * @type {"common"|"relate"|"cast"|"orbit"|"bounce"|"low-speed"|"death"|"hit"|"timer"} 类型(关联投射物的方式)
         * * `common`: 提供给施法块/作为关联投射物(享受修正)
         * * `relate`: 作为关联投射物(享受修正)
         * * `cast`: 提供给施法块(享受修正)
         * * `orbit` : 作为环绕投射物
         * * `bounce` : 作为弹跳时发射的投射物
         * * `low-speed` : 作为低速时发射的投射物
         * * `death` : 作为失效时发射的投射物
         * * `hit` : 作为碰撞时发射的投射物
         * * `timer` : 作为定时发射的投射物
         */
        type = "common";
        /** @type {Number} 失效触发抽取数 */ drawCount_Death = 0;
        /** @type {Number} 碰撞触发抽取数 */ drawCount_Hit = 0;
        /** @type {Number} 定时触发抽取数 */ drawCount_Timer = 0;
        /** @type {Number} 定时触发延迟 */ drawDelay_Timer = 0;
        /** @param {String} exp */
        constructor(exp) {
            const [projectileId, _exp = []] = exp.split(":");
            if (projectileId.endsWith("_nil")) this.projectile = null;
            else {
                /** @type {import("@entity").EntityData} 投射物数据 */
                this.projectile = Entity.query(projectileId);
                let target = "amountMin"; // 数据目标
                let cache = [];
                const temp = {
                    amountMin: 1,
                    amountMax: 1,
                    drawCount_Death: 0,
                    drawCount_Hit: 0,
                    drawCount_Timer: 0,
                    drawDelay_Timer: 0,
                    typeIndex: 0
                };
                for (let i = 0; i <= _exp.length; i++) {
                    const char = _exp[i];
                    switch (char) {
                        case "~":
                            temp[target] = +cache.join("");
                            cache = [];
                            target = "amountMax";
                            break;
                        case "D":
                            temp[target] = +cache.join("");
                            cache = [];
                            target = "drawCount_Death";
                            break;
                        case "H":
                            temp[target] = +cache.join("");
                            cache = [];
                            target = "drawCount_Hit";
                            break;
                        case "T":
                            temp[target] = +cache.join("");
                            cache = [];
                            target = "drawCount_Timer";
                            break;
                        case "!":
                            temp[target] = +cache.join("");
                            cache = [];
                            target = "drawDelay_Timer";
                            break;
                        case "#":
                            temp[target] = +cache.join("");
                            cache = [];
                            target = "typeIndex";
                            break;
                        case undefined: // exp结束
                            temp[target] = +cache.join("");
                            break;
                        default: //数字
                            cache.push(char);
                    }
                }
                if (temp.amountMin === 0) temp.amountMin = 1; //空字符串会被转为0 投射物数量至少为1
                if (temp.amountMin > temp.amountMax) temp.amountMax = temp.amountMin;
                this.amountMin = temp.amountMin;
                this.amountMax = temp.amountMax;
                this.type = SpellData.ProjectileData.#typeMap[temp.typeIndex];
                this.drawCount_Death = temp.drawCount_Death;
                this.drawCount_Hit = temp.drawCount_Hit;
                this.drawCount_Timer = temp.drawCount_Timer;
                this.drawDelay_Timer = temp.drawDelay_Timer;
            }
            Object.freeze(this);
        }

        /** @param {String} exp */
        static createDatas(exp) {
            const result = [];
            if (exp) {
                const exps = exp.split(" ");
                for (let i = 0; i < exps.length; i++) {
                    const data = new this(exps[i]);
                    if (data.projectile) result.push(data);
                }
            }
            return Object.freeze(result);
        }
    };

    /** 法术生成数据 -1表示非该等级法术 */
    static SpawningData = class SpawningData {
        static sum = { prob_lv0: 0, prob_lv1: 0, prob_lv2: 0, prob_lv3: 0, prob_lv4: 0, prob_lv5: 0, prob_lv6: 0, prob_lv7: 0, prob_lv10: 0 };
        /** @type {Number} */ prob_lv0 = -1;
        /** @type {Number} */ [0] = -1;
        /** @type {Number} */ prob_lv1 = -1;
        /** @type {Number} */ [1] = -1;
        /** @type {Number} */ prob_lv2 = -1;
        /** @type {Number} */ [2] = -1;
        /** @type {Number} */ prob_lv3 = -1;
        /** @type {Number} */ [3] = -1;
        /** @type {Number} */ prob_lv4 = -1;
        /** @type {Number} */ [4] = -1;
        /** @type {Number} */ prob_lv5 = -1;
        /** @type {Number} */ [5] = -1;
        /** @type {Number} */ prob_lv6 = -1;
        /** @type {Number} */ [6] = -1;
        /** @type {Number} */ prob_lv7 = -1;
        /** @type {Number} */ [7] = -1;
        /** @type {Number} */ prob_lv10 = -1;
        /** @type {Number} */ [10] = -1;
        /** @type {String} 生成解锁条件 */ requiresFlag;
        /** @type {Array<"lv0"|"lv1"|"lv2"|"lv3"|"lv4"|"lv5"|"lv6"|"lv7"|"lv10">} */ lvs = [];
        /** @type {Array<"lv0"|"lv1"|"lv2"|"lv3"|"lv4"|"lv5"|"lv6"|"lv7"|"lv10">} */ lvs_nonzero = [];
        /**
         * @param {{[key: Number]:Number}} probs
         * @param {String} requiresFlag
         */
        constructor(probs, requiresFlag) {
            if (requiresFlag) this.requiresFlag = requiresFlag;
            for (const key in probs) {
                const lv = `lv${key}`;
                const probKey = `prob_${lv}`;
                const value = probs[key];
                this[probKey] = value;
                this[key] = value;
                this.lvs.push(lv);
                if (value > 0) this.lvs_nonzero.push(lv);
                SpawningData.sum[probKey] += value * 1e4; // 此处解决精度问题 记得用的时候 /10000
            }
            Object.freeze(this.lvs);
            Object.freeze(this.lvs_nonzero);
        }
        /**
         * @param {"lv0"|"lv1"|"lv2"|"lv3"|"lv4"|"lv5"|"lv6"|"lv7"|"lv10"} lv 法术等级
         * @returns 百分比形式的概率
         */
        percentage(lv) {
            const key = `prob_${lv}`;
            const value = this[key];
            if (value <= 0) return 0;
            // return value * 10000 / SpawningData.sum[key] * 100; 简化计算
            return (1e6 * value) / SpawningData.sum[key];
        }

        /** 原始数据 */
        get raw() {
            const lv_cache = [];
            const prob_cache = [];
            for (const lv of this.lvs) {
                const n = lv.slice(2);
                lv_cache.push(n);
                prob_cache.push(this[n]);
            }
            return {
                lv: lv_cache.join(","),
                prob: prob_cache.join(",")
            };
        }

        /**
         * @param {(lv:"lv0"|"lv1"|"lv2"|"lv3"|"lv4"|"lv5"|"lv6"|"lv7"|"lv10",prob:Number) => void} callabck
         */
        forEach(callabck) {
            for (const lv of this.lvs) callabck(lv, this[key.slice(2)]);
        }
    };

    static ModifierAction = class ModifierAction {
        /** 属性缩写映射表 */
        static #abbrMap = {
            //简写:全称(in js)
            frw: "fireRateWait",
            spm: "speed",
            exr: "explosionRadius",
            spd: "spreadDegrees",
            pad: "patternDegrees",
            dmM: "meleeDamage",
            dmP: "projectileDamage",
            dmL: "electricityDamage",
            dmF: "fireDamage",
            dmE: "explosionDamage",
            dmI: "iceDamage",
            dmS: "sliceDamage",
            dmH: "healingDamage",
            dmC: "curseDamage",
            dmD: "drillDamage",
            dmV: "overeatingDamage", // 不存在
            dmY: "physicsHitDamage", // 不存在
            dmN: "poisonDamage", // 不存在
            dmR: "radioactiveDamage", // 不存在
            dmO: "holyDamage", // 不存在
            dcc: "damageCriticalChance",
            kbf: "knockbackForce",
            mel: "material",
            mea: "materialAmount",
            tme: "trailMaterial",
            tma: "trailMaterialAmount",
            boc: "bounces",
            fyf: "friendlyFire",
            lft: "lifetime",
            exe: "extraEntities",
            gee: "gameEffectEntities",
            rlt: "reloadTime",
            rkb: "recoil"
        };
        /** @param {String} data */
        constructor(data) {
            if (data) {
                const parts = data.split("#");
                let /** @type {String} */ before, /** @type {String} */ after, /** @type {String} */ common;
                if (parts.length === 2) [before, after] = parts;
                else common = parts[0];
                if (common) this.#parse(common, "none");
                else {
                    this.#parse(before, "before");
                    this.#parse(after, "after");
                }
            }
        }
        /** @param {String} data */
        #parse(data, pos) {
            if (data) {
                const parts = data.split(";");
                for (let i = 0; i < parts.length; i++) {
                    const part = parts[i];
                    /** @type {String} */
                    const prop = ModifierAction.#abbrMap[part.slice(0, 3)];
                    const type = part.slice(3, 4);
                    const data = part.slice(4);
                    let value;
                    switch (prop) {
                        case "meleeDamage":
                        case "projectileDamage":
                        case "electricityDamage":
                        case "fireDamage":
                        case "explosionDamage":
                        case "iceDamage":
                        case "sliceDamage":
                        case "healingDamage":
                        case "curseDamage":
                        case "drillDamage":
                        case "overeatingDamage":
                        case "physicsHitDamage":
                        case "poisonDamage":
                        case "radioactiveDamage":
                        case "holyDamage":
                            value = data * 25;
                            break;
                        case "fireRateWait":
                        case "speed":
                        case "explosionRadius":
                        case "spreadDegrees":
                        case "patternDegrees":
                        case "damageCriticalChance":
                        case "knockbackForce":
                        case "materialAmount":
                        case "trailMaterialAmount":
                        case "bounces":
                        case "friendlyFire":
                        case "lifetime":
                        case "reloadTime":
                        case "recoil":
                            value = +data;
                            break;
                        case "extraEntities":
                        case "gameEffectEntities":
                            value = data.split(",").map(Entity.query);
                            break;
                        case "material":
                        case "trailMaterial":
                            value = data;
                    }
                    this[prop] = { pos, type, value };
                }
            }
        }
    };

    /** @typedef {Set<SpellData>} SpellSet 法术集合 */
    static tagSets = {
        /** @type {SpellSet} 所有法术 */ all: new Set(),

        /** @type {SpellSet} 投射物类型法术 */ type_projectile: new Set(),
        /** @type {SpellSet} 静态投射物类型法术 */ type_staticProjectile: new Set(),
        /** @type {SpellSet} 修正类型法术 */ type_modifier: new Set(),
        /** @type {SpellSet} 多重类型法术 */ type_drawMany: new Set(),
        /** @type {SpellSet} 材料类型法术 */ type_material: new Set(),
        /** @type {SpellSet} 其他类型法术 */ type_other: new Set(),
        /** @type {SpellSet} 实用类型法术 */ type_utility: new Set(),
        /** @type {SpellSet} 被动类型法术 */ type_passive: new Set(),

        /** @type {SpellSet} 0级法术 */ lv0: new Set(),
        /** @type {SpellSet} 1级法术 */ lv1: new Set(),
        /** @type {SpellSet} 2级法术 */ lv2: new Set(),
        /** @type {SpellSet} 3级法术 */ lv3: new Set(),
        /** @type {SpellSet} 4级法术 */ lv4: new Set(),
        /** @type {SpellSet} 5级法术 */ lv5: new Set(),
        /** @type {SpellSet} 6级法术 */ lv6: new Set(),
        /** @type {SpellSet} 7级法术 */ lv7: new Set(),
        /** @type {SpellSet} 10级法术 */ lv10: new Set(),

        /** @type {SpellSet} 影响存在时间的法术 [自动管理 直接添加到对应的存在时间修改类型即可] */
        get lifetime_mod() {
            return new Set([...this.lifetime_up, ...this.lifetime_down]);
        },
        /** @type {SpellSet} 增加存在时间的法术 */ lifetime_up: new Set(),
        /** @type {SpellSet} 减少存在时间的法术 */ lifetime_down: new Set(),

        /** @type {SpellSet} 不耗蓝的法术 */ mana_0: new Set(),
        /** @type {SpellSet} 低耗蓝的法术 */ mana_drainlowly: new Set(),
        /** @type {SpellSet} 回蓝的法术 */ mana_increase: new Set(),

        /** @type {SpellSet} 叠加额外修正的法术 */ extra_modifier: new Set(),

        /** @type {SpellSet} 影响投射物速度的法术 */ speed_mod: new Set(),

        /** @type {SpellSet} 带有抽取的法术 [自动管理 直接添加到对应抽取类型即可] */
        get draw() {
            return new Set([...this.draw_common, ...this.draw_hit, ...this.draw_timer, ...this.draw_death]);
        },

        /** @type {SpellSet} 带有基础抽取的法术 */ draw_common: new Set(),
        /** @type {SpellSet} 带有碰撞触发抽取的法术 */ draw_hit: new Set(),
        /** @type {SpellSet} 带有定时触发抽取的法术 */ draw_timer: new Set(),
        /** @type {SpellSet} 带有失效触发抽取的法术 */ draw_death: new Set(),

        /** @type {SpellSet} 影响伤害的法术 [自动管理 直接添加到具体伤害类型中即可] */
        get damage_mod() {
            return this.damage_reset.union(this.damage_add.union(this.damage_sub));
        },

        get damage_add() {
            const cache = [];
            for (const type of DamageData.types) {
                const key = `damage_add_${type}`;
                if (key in this) cache.push(...this[key]);
            }
            return new Set(cache);
        },

        get damage_sub() {
            const cache = [];
            for (const type of DamageData.types) {
                const key = `damage_sub_${type}`;
                if (key in this) cache.push(...this[key]);
            }
            return new Set(cache);
        },

        get damage_reset() {
            const cache = [];
            for (const type of DamageData.types) {
                const key = `damage_reset_${type}`;
                if (key in this) cache.push(...this[key]);
            }
            return new Set(cache);
        },

        /** @return {SpellSet} 影响[投射物]伤害的法术 */
        get damage_mod_projectile() {
            return this.damage_reset_projectile.union(this.damage_add_projectile.union(this.damage_sub_projectile));
        },
        /** @type {SpellSet} 增加[投射物]伤害的法术 */ damage_add_projectile: new Set(),
        /** @type {SpellSet} 减少[投射物]伤害的法术 */ damage_sub_projectile: new Set(),
        /** @type {SpellSet} 重置[投射物]伤害的法术 */ damage_reset_projectile: new Set(),

        /** @return {SpellSet} 影响[近战]伤害的法术 */
        get damage_mod_melee() {
            return this.damage_reset_melee.union(this.damage_add_melee.union(this.damage_sub_melee));
        },
        /** @type {SpellSet} 增加[近战]伤害的法术 */ damage_add_melee: new Set(),
        /** @type {SpellSet} 减少[近战]伤害的法术 */ damage_sub_melee: new Set(),
        /** @type {SpellSet} 重置[近战]伤害的法术 */ damage_reset_melee: new Set(),

        /** @return {SpellSet} 影响[雷电]伤害的法术 */
        get damage_mod_electricity() {
            return this.damage_reset_electricity.union(this.damage_add_electricity.union(this.damage_sub_electricity));
        },
        /** @type {SpellSet} 增加[雷电]伤害的法术 */ damage_add_electricity: new Set(),
        /** @type {SpellSet} 减少[雷电]伤害的法术 */ damage_sub_electricity: new Set(),
        /** @type {SpellSet} 重置[雷电]伤害的法术 */ damage_reset_electricity: new Set(),

        /** @return {SpellSet} 影响[火焰]伤害的法术 */
        get damage_mod_fire() {
            return this.damage_reset_fire.union(this.damage_add_fire.union(this.damage_sub_fire));
        },
        /** @type {SpellSet} 增加[火焰]伤害的法术 */ damage_add_fire: new Set(),
        /** @type {SpellSet} 减少[火焰]伤害的法术 */ damage_sub_fire: new Set(),
        /** @type {SpellSet} 重置[火焰]伤害的法术 */ damage_reset_fire: new Set(),

        /** @return {SpellSet} 影响[爆炸]伤害的法术 */
        get damage_mod_explosion() {
            return this.damage_reset_explosion.union(this.damage_add_explosion.union(this.damage_sub_explosion));
        },
        /** @type {SpellSet} 增加[爆炸]伤害的法术 */ damage_add_explosion: new Set(),
        /** @type {SpellSet} 减少[爆炸]伤害的法术 */ damage_sub_explosion: new Set(),
        /** @type {SpellSet} 减少[爆炸]伤害的法术 */ damage_reset_explosion: new Set(),

        /** @return {SpellSet} 影响[冰冻]伤害的法术 */
        get damage_mod_ice() {
            return this.damage_reset_ice.union(this.damage_add_ice.union(this.damage_sub_ice));
        },
        /** @type {SpellSet} 增加[冰冻]伤害的法术 */ damage_add_ice: new Set(),
        /** @type {SpellSet} 减少[冰冻]伤害的法术 */ damage_sub_ice: new Set(),
        /** @type {SpellSet} 重置[冰冻]伤害的法术 */ damage_reset_ice: new Set(),

        /** @return {SpellSet} 影响[切割]伤害的法术 */
        get damage_mod_slice() {
            return this.damage_reset_slice.union(this.damage_add_slice.union(this.damage_sub_slice));
        },
        /** @type {SpellSet} 增加[切割]伤害的法术 */ damage_add_slice: new Set(),
        /** @type {SpellSet} 减少[切割]伤害的法术 */ damage_sub_slice: new Set(),
        /** @type {SpellSet} 重置[切割]伤害的法术 */ damage_reset_slice: new Set(),

        /** @return {SpellSet} 影响[治疗]伤害的法术 */
        get damage_reset_healing() {
            return this.damage_reset_healing.union(this.damage_add_healing.union(this.damage_sub_healing));
        },
        /** @type {SpellSet} 增加[治疗]伤害的法术 */ damage_add_healing: new Set(),
        /** @type {SpellSet} 减少[治疗]伤害的法术 */ damage_sub_healing: new Set(),
        /** @type {SpellSet} 重置[治疗]伤害的法术 */ damage_reset_healing: new Set(),

        /** @return {SpellSet} 影响[诅咒]伤害的法术 */
        get damage_mod_curse() {
            return this.damage_reset_curse.union(this.damage_add_curse.union(this.damage_sub_curse));
        },
        /** @type {SpellSet} 增加[诅咒]伤害的法术 */ damage_add_curse: new Set(),
        /** @type {SpellSet} 减少[诅咒]伤害的法术 */ damage_sub_curse: new Set(),
        /** @type {SpellSet} 重置[诅咒]伤害的法术 */ damage_reset_curse: new Set(),

        /** @return {SpellSet} 影响[穿凿]伤害的法术 */
        get damage_mod_drill() {
            return this.damage_reset_drill.union(this.damage_add_drill.union(this.damage_sub_drill));
        },
        /** @type {SpellSet} 增加[穿凿]伤害的法术 */ damage_add_drill: new Set(),
        /** @type {SpellSet} 减少[穿凿]伤害的法术 */ damage_sub_drill: new Set(),
        /** @type {SpellSet} 重置[穿凿]伤害的法术 */ damage_reset_drill: new Set(),

        /** @return {SpellSet} 影响[神圣]伤害的法术 */
        get damage_mod_holy() {
            return this.damage_reset_holy.union(this.damage_add_holy.union(this.damage_sub_holy));
        },
        /** @type {SpellSet} 增加[神圣]伤害的法术 */ damage_add_holy: new Set(),
        /** @type {SpellSet} 减少[神圣]伤害的法术 */ damage_sub_holy: new Set(),
        /** @type {SpellSet} 重置[神圣]伤害的法术 */ damage_reset_holy: new Set(),

        /** @type {Array<SpellData>} 生成需要解锁法术 */ spawnRequiresFlag: new Set()
    };

    /** @type {Map<String,SpellData>} */
    static data = new Map();

    static #typeList = [/* 无 */ "null", /* 投射物 */ "projectile", /* 静态投射物 */ "staticProjectile", /* 修正 */ "modifier", /* 多重 */ "drawMany", /* 材料 */ "material", /* 其它 */ "other", /* 实用 */ "utility", /* 被动 */ "passive"];
    /** @type {String} 图标url */ #iconIndex;
    name;
    /**
     * @param {Array<String>} data
     * @param {Number} index
     */
    constructor(data, index) {
        // super(() => {});
        this.#iconIndex = index;
        // Reflect.defineProperty(this, "canvasIcon", { get: SpellData.#iconGen.getGeneratorFn(index * 16, 16) });
        // this.getCanvas = SpellData.#iconGen.getGeneratorFn(index * 16, 16, 16);
        //prettier-ignore
        [
            this.id, //===============[0] id
            this.name, //=============[1] 名称
            , //======================[2] 别名
            this.desc, //=============[3] 描述
            , //======================[4] 类型
            , //======================[5] 最大使用次数
            this.mana, //=============[6] 蓝耗
            this.price, //============[7] 售价
            this.passive = "", //=====[8] 被动效果
            , //======================[9] 生成概率
            , //======================[10] 生成条件
            this.draw = 0, //=========[11] 抽取数
            , //======================[12] 提供投射物
            , //======================[13] 修正行为
            this.action, //===========[14] 法术行为
            this.nameKey = "", //=====[15] 名称键 用于csv翻译映射
            this.descKey = "" //======[16] 描述键 用于csv翻译映射
        ] = data;
        this.alias = freeze(data[2] ? data[2].split(" ") : []);
        this.type = SpellData.#typeList[data[4]];
        data[5] ??= 0;
        this.unlimited = data[5] > 0;
        let maxUse = Math.abs(data[5]);
        this.maxUse = maxUse === 0 ? Infinity : maxUse;
        this.spawn = freeze(new SpellData.SpawningData(data[9], data[10] ?? ""));
        this.offeredProjectile = freeze(SpellData.ProjectileData.createDatas(data[12] ?? ""));
        this.modifierAction = freeze(new SpellData.ModifierAction(data[13] ?? ""));
    }

    /** @return {Promise<String>} */
    get asyncIconUrl() {
        return new Promise(resolve => Icon.urls.then(value => resolve(value[this.#iconIndex])));
    }

    get icon() {
        return new Icon(this);
    }

    /**
     * 创建具有剩余使用次数的法术数据实例
     * @param {Number} remain
     * @returns {SpellData & {remain:Number}}
     */
    instance(remain) {
        return Object.create(this, { remain: { value: remain } });
    }

    /**
     * 通过 `法术名称,ID,别名` 获取法术数据
     * @param {SpellId|SpellName|SpellAlias} key 查询键
     * @returns {SpellData} 法术数据
     */
    static query = key => {
        if (key[0] === "$") return this.$NULL[key] ?? this.$NULL;
        return this.data.get(key) ?? this.$NULL;
    };

    static queryByExp = (() => {
        //prettier-ignore
        embed(`#expParser.js`)
        return parse;
    })();

    static get spellTags() {
        return Reflect.ownKeys(this.tagSets).map(tag => "#" + tag);
    }

    /**
     * 注册自定义的法术标签
     * @param {String} tag
     * @param {(data:SpellData) => Boolean } predicate
     */
    static registerTag = (tag, predicate) => {
        this.tagSets[tag] = new Set([...this.tagSets.all].filter(predicate));
        return "#" + tag;
    };

    /** 初始化数据库 */
    static init() {
        /** ⚫ 空法术 @type {SpellData & {$projectile:SpellData,$staticProjectile:SpellData,$modifier:SpellData,$drawMany:SpellData,$material:SpellData,$other:SpellData,$utility:SpellData,$passive:SpellData}} */
        this.$NULL = new this(["_NULL", "空白", "", "未能获得指定法术", 0, 0, 0, 0, "", {}, "", 0, "", "", ""]);

        /** 🔴 空法术`投射物` @type {SpellData} */
        this.$NULL.$projectile = freeze(new this(["$projectile", "投射物法术", "", "占位符", 1, 0, 0, 0, "", {}, "", 0, "", "", ""]));

        /** 🟠 空法术`静态投射物` @type {SpellData} */
        this.$NULL.$staticProjectile = freeze(new this(["$staticProjectile", "静态投射物法术", "", "占位符", 2, 0, 0, 0, "", {}, "", 0, "", "", ""]));

        /** 🔵 空法术`投射修正` @type {SpellData} */
        this.$NULL.$modifier = freeze(new this(["$staticProjectile", "投射修正法术", "", "占位符", 3, 0, 0, 0, "", {}, "", 0, "", "", ""]));

        /** ⚪ 空法术`多重施放` @type {SpellData} */
        this.$NULL.$drawMany = freeze(new this(["$drawMany", "多重法术", "", "占位符", 4, 0, 0, 0, "", {}, "", 0, "", "", ""]));

        /** 🟢 空法术`材料` @type {SpellData} */
        this.$NULL.$material = freeze(new this(["$material", "材料法术", "", "占位符", 5, 0, 0, 0, "", {}, "", 0, "", "", ""]));

        /** 🟡 空法术`其他` @type {SpellData} */
        this.$NULL.$other = freeze(new this(["$other", "其他法术", "", "占位符", 6, 0, 0, 0, "", {}, "", 0, "", "", ""]));

        /** 🟣 空法术`实用` @type {SpellData} */
        this.$NULL.$utility = freeze(new this(["$utility", "实用法术", "", "占位符", 7, 0, 0, 0, "", {}, "", 0, "", "", ""]));

        /** 🟤 空法术`被动` @type {SpellData} */
        this.$NULL.$passive = freeze(new this(["$passive", "被动法术", "", "占位符", 8, 0, 0, 0, "", {}, "", 0, "", "", ""]));

        freeze(this.$NULL);

        const storage = this.tagSets;
        // toChunks(embed(`#data.js`), 17).forEach
        [...embed(`#data.js`).values().chunks(17)].forEach((v, i) => {
            const data = new this(v, i);
            //#region 向数据库中写入
            storage.all.add(data);
            // id, 正式名, 别名均创建映射
            for (const mapKey of [...data.alias, data.id, data.name]) this.data.set(mapKey, data);

            storage[`type_${data.type}`].add(data);

            for (const lv of data.spawn.lvs) storage[lv].add(data);

            if (data.spawn.requiresFlag) storage.spawnRequiresFlag.add(data);

            if (data.draw) storage.draw_common.add(data);

            for (let j = 0; j < data.offeredProjectile.length; j++) {
                const { drawCount_Hit, drawCount_Timer, drawCount_Death } = data.offeredProjectile[j];
                if (drawCount_Death) storage.draw_death.add(data);
                if (drawCount_Hit) storage.draw_hit.add(data);
                if (drawCount_Timer) storage.draw_timer.add(data);
            }

            if ("lifetime" in data.modifierAction) {
                if (data.modifierAction.lifetime.type === "+") storage.lifetime_up.add(data);
                else if (data.modifierAction.lifetime.type === "-") storage.lifetime_down.add(data);
            }

            if ("speed" in data.modifierAction) storage.speed_mod.add(data);

            for (const type of DamageData.types) {
                if (`${type}Damage` in data.modifierAction)
                    /* prettier-ignore */
                    switch (data.modifierAction[`${type}Damage`].type) {
                        case "+": storage[`damage_add_${type}`].add(data); break;
                        case "-": storage[`damage_sub_${type}`].add(data); break;
                        case "=": storage[`damage_reset_${type}`].add(data);
                    }
            }

            if (data.mana < 5) {
                storage.mana_drainlowly.add(data);
                if (data.mana === 0) storage.mana_0.add(data);
                else storage.mana_increase.add(data);
            }
            //#endregion

            freeze(data);
        });

        /// 变种 / 同类分组
        const add = (groupName, ...ids) => (this.tagSets[groupName ?? ids[0]] = new Set(ids.map(id => this.query(id))));
        const add$ = (...ids) => add(null, ...ids);
        // 火花弹 及其变种
        add$("LIGHT_BULLET", "LIGHT_BULLET_TRIGGER", "LIGHT_BULLET_TRIGGER_2", "LIGHT_BULLET_TIMER");
        // 魔法箭 及其变种
        add$("BULLET", "BULLET_TRIGGER", "BULLET_TIMER");
        // 魔法弹 及其变种
        add$("HEAVY_BULLET", "HEAVY_BULLET_TRIGGER", "HEAVY_BULLET_TIMER");
        // 能量球 及其变种
        add$("SLOW_BULLET", "SLOW_BULLET_TRIGGER", "SLOW_BULLET_TIMER");
        // 黑洞 及其变种
        add$("BLACK_HOLE", "BLACK_HOLE_DEATH_TRIGGER", "WHITE_HOLE");
        // 分裂弹 及其变种
        add$("SPITTER", "SPITTER_TIMER", "SPITTER_TIER_2", "SPITTER_TIER_2_TIMER", "SPITTER_TIER_3", "SPITTER_TIER_3_TIMER");
        // 锯片 及其变种
        add$("DISC_BULLET", "DISC_BULLET_BIG", "DISC_BULLET_BIGGER");
        // 弹性能量球 及其变种
        add$("DISC_BULLET", "BOUNCY_ORB_TIMER");
        // 闪耀投枪 及其变种
        add$("LANCE", "LANCE_HOLY");
        // 火焰弹 及其变种
        add$("GRENADE", "GRENADE_TRIGGER", "GRENADE_TIER_2", "GRENADE_TIER_3", "GRENADE_ANTI", "GRENADE_LARGE");
        // 不稳晶体 及其变种
        add$("MINE", "MINE_DEATH_TRIGGER");
        // 电浆类
        add$("LASER_EMITTER", "LASER_EMITTER_FOUR", "LASER_EMITTER_CUTTER");
        // 光剑 及其变种
        add$("LUMINOUS_DRILL", "LASER_LUMINOUS_DRILL");
        // 触手 及其变种
        add$("TENTACLE", "TENTACLE_TIMER");
        // 治疗弹 及其变种
        add$("HEAL_BULLET", "ANTIHEAL");
        // 魔法护卫 及其变种
        add$("MAGIC_SHIELD", "BIG_MAGIC_SHIELD");
        // 火球 及其变种
        add$("FIREBALL", "ICEBALL");
        // 神圣炸弹 及其变种
        add$("BOMB_HOLY", "BOMB_HOLY_GIGA");
        // 蛋 及其变种
        add$("SUMMON_EGG", "SUMMON_HOLLOW_EGG");
        // 炸药箱 及其变种
        add$("TNTBOX", "TNTBOX_BIG");
        // 死亡十字 及其变种
        add$("DEATH_CROSS", "DEATH_CROSS_BIG");
        // 雾类
        add("MIST", "MIST_RADIOACTIVE", "MIST_ALCOHOL", "MIST_SLIME", "MIST_BLOOD");
        // 传送弹 及其变种
        add$("TELEPORT_PROJECTILE", "TELEPORT_PROJECTILE_SHORT", "TELEPORT_PROJECTILE_STATIC", "SWAPPER_PROJECTILE", "TELEPORT_PROJECTILE_CLOSER");
        // 核弹 及其变种
        add$("NUKE", "NUKE_GIGA");
        // 巨型黑洞 及其变种
        add$("BLACK_HOLE_BIG", "WHITE_HOLE_BIG");
        // 终结黑洞 及其变种
        add$("BLACK_HOLE_GIGA", "WHITE_HOLE_GIGA");
        // 召唤类
        add("SUMMON", "SWARM_FLY", "SWARM_FIREBUG", "SWARM_WASP", "FRIEND_FLY");
        // 粒子屏障类
        add("WALL", "WALL_HORIZONTAL", "WALL_VERTICAL", "WALL_SQUARE");
        // 静态爆炸 及其变种
        add$("EXPLOSION", "EXPLOSION_LIGHT", "FIRE_BLAST", "POISON_BLAST", "ALCOHOL_BLAST", "THUNDER_BLAST");
        // 环类
        add("FIELD", "BERSERK_FIELD", "POLYMORPH_FIELD", "CHAOS_POLYMORPH_FIELD", "ELECTROCUTION_FIELD", "FREEZE_FIELD", "REGENERATION_FIELD", "TELEPORTATION_FIELD", "LEVITATION_FIELD", "SHIELD_FIELD");
        // 投射物领域类
        add("PROJECTILE_FIELD", "PROJECTILE_TRANSMUTATION_FIELD", "PROJECTILE_THUNDER_FIELD", "PROJECTILE_GRAVITY_FIELD");
        // 真空场类
        add("VACUUM", "VACUUM_POWDER", "VACUUM_LIQUID", "VACUUM_ENTITIES");
        // 云类
        add("CLOUD", "CLOUD_WATER", "CLOUD_OIL", "CLOUD_BLOOD", "CLOUD_ACID", "CLOUD_THUNDER");
        // 弹跳 及其变种
        add$("BOUNCE", "REMOVE_BOUNCE", "BOUNCE_EXPLOSION", "BOUNCE_SPARK", "BOUNCE_LASER", "BOUNCE_LASER_EMITTER", "BOUNCE_LARPA", "BOUNCE_SMALL_EXPLOSION", "BOUNCE_LIGHTNING", "BOUNCE_HOLE");
        // 追踪 及其变种
        add$("HOMING", "ANTI_HOMING", "HOMING_WAND", "HOMING_SHORT", "HOMING_ROTATE", "HOMING_SHOOTER", "AUTOAIM", "HOMING_ACCELERATING", "HOMING_CURSOR", "HOMING_AREA");
        // 暴击 及其变种
        add$("CRITICAL_HIT", "HITFX_BURNING_CRITICAL_HIT", "HITFX_CRITICAL_WATER", "HITFX_CRITICAL_OIL", "HITFX_CRITICAL_BLOOD");
        // 沾染特效类
        add("HITFX", "HITFX_BURNING_CRITICAL_HIT", "HITFX_CRITICAL_WATER", "HITFX_CRITICAL_OIL", "HITFX_CRITICAL_BLOOD", "HITFX_TOXIC_CHARM", "HITFX_EXPLOSION_SLIME", "HITFX_EXPLOSION_SLIME_GIGA", "HITFX_EXPLOSION_ALCOHOL", "HITFX_EXPLOSION_ALCOHOL_GIGA");
        // 投射器类
        add("RAY", "FIREBALL_RAY", "LIGHTNING_RAY", "TENTACLE_RAY", "LASER_EMITTER_RAY", "FIREBALL_RAY_LINE");
        // 效果附身类
        add("RAY_ENEMY", "FIREBALL_RAY_ENEMY", "LIGHTNING_RAY_ENEMY", "TENTACLE_RAY_ENEMY", "GRAVITY_FIELD_ENEMY");
        // 诅咒类
        add$("CURSE", "CURSE_WITHER_PROJECTILE", "CURSE_WITHER_EXPLOSION", "CURSE_WITHER_ELECTRICITY");
        // 投射物环绕类
        add("ORBIT", "ORBIT_DISCS", "ORBIT_FIREBALLS", "ORBIT_NUKES", "ORBIT_LASERS", "ORBIT_LARPA");
        // 弧类
        add("ARC", "ARC_ELECTRIC", "ARC_FIRE", "ARC_GUNPOWDER", "ARC_POISON");
        // 轨迹类
        add("TRAIL", "ACID_TRAIL", "POISON_TRAIL", "OIL_TRAIL", "WATER_TRAIL", "GUNPOWDER_TRAIL", "FIRE_TRAIL", "LARPA_CHAOS_2", "RAINBOW_TRAIL");
        // 拉帕类
        add("LARPA", "BOUNCE_LARPA", "ORBIT_LARPA", "LARPA_CHAOS", "LARPA_DOWNWARDS", "LARPA_UPWARDS", "LARPA_CHAOS_2", "LARPA_DEATH");
        // 染色类
        add("COLOR", "COLOUR_RED", "COLOUR_ORANGE", "COLOUR_GREEN", "COLOUR_YELLOW", "LARPA_UPWARDS", "COLOUR_PURPLE", "COLOUR_BLUE", "COLOUR_RAINBOW", "COLOUR_INVIS");
        // 普通抽取类
        add("BURST", "BURST_2", "BURST_3", "BURST_4", "BURST_8", "BURST_X");
        // 散射抽取类
        add("SCATTER", "SCATTER_2", "SCATTER_3", "SCATTER_4");
        // 阵型抽取类
        add("SHAPE", "I_SHAPE", "Y_SHAPE", "T_SHAPE", "W_SHAPE", "CIRCLE_SHAPE", "PENTAGRAM_SHAPE");
        // 材料环类
        add("CIRCLE", "CIRCLE_FIRE", "CIRCLE_ACID", "CIRCLE_OIL", "CIRCLE_WATER");
        // 材料液滴类
        add("MATERIAL", "MATERIAL_WATER", "MATERIAL_OIL", "MATERIAL_BLOOD", "MATERIAL_ACID", "MATERIAL_CEMENT");
        // 材料触类
        add("TOUCH", "TOUCH_GOLD", "TOUCH_WATER", "TOUCH_OIL", "TOUCH_ALCOHOL", "TOUCH_PISS", "TOUCH_GRASS", "TOUCH_BLOOD", "TOUCH_SMOKE");
        // 材料海类
        add("SEA", "SEA_LAVA", "SEA_ALCOHOL", "SEA_OIL", "SEA_WATER", "SEA_SWAMP", "SEA_ACID", "SEA_ACID_GAS", "SEA_MIMIC");
        // 陶笛音符类
        add("OCARINA", "OCARINA_A", "OCARINA_B", "OCARINA_C", "OCARINA_D", "OCARINA_E", "OCARINA_F", "OCARINA_GSHARP", "OCARINA_A2");
        // 康特勒琴音符类
        add("KANTELE", "KANTELE_A", "KANTELE_D", "KANTELE_DIS", "KANTELE_E", "KANTELE_G");
        // 随机法术类
        add("RANDOM", "RANDOM_SPELL", "DRAW_RANDOM", "DRAW_RANDOM_X3", "DRAW_3_RANDOM", "RANDOM_PROJECTILE", "RANDOM_STATIC_PROJECTILE", "RANDOM_MODIFIER");
        // 追加触发类
        add$("ADD_TRIGGER", "ADD_TIMER", "ADD_DEATH_TRIGGER");
        // 希腊字母类
        add("SYMBOL", "ALPHA", "GAMMA", "TAU", "OMEGA", "MU", "PHI", "SIGMA", "ZETA");
        // 一分多类
        add("DIVIDE", "DIVIDE_2", "DIVIDE_3", "DIVIDE_4", "DIVIDE_10");
        // 条件类
        add("IF", "IF_ENEMY", "IF_PROJECTILE", "IF_HP", "IF_HALF", "IF_END", "IF_ELSE");
        // 阵型复制类
        add("SHOT", "I_SHOT", "Y_SHOT", "T_SHOT", "W_SHOT", "QUAD_SHOT", "PENTA_SHOT", "HEXA_SHOT");
        // 置换术类
        add("ALL", "ALL_NUKES", "ALL_DISCS", "ALL_ROCKETS", "ALL_DEATHCROSSES", "ALL_BLACKHOLES", "ALL_ACID");
    }
}
