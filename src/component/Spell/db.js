class Icon extends $icon(16, "法术") {
    static urls = asyncSpriteUrls(embed(`#icon.png`));
    /** @type {SpellData?} */ #data;

    /** @param {SpellData} data  */
    constructor(data) {
        super();
        this.#data = data;
    }

    connectedCallback() {
        const data = this.#data ?? SpellData.query(this.getAttribute("spell.id"));
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

class SpellData extends Callable {
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
            /** @type {import("@entity").EntityData} 投射物数据 */
            this.projectile = Entity.queryById(projectileId);
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
                        temp[target] = Number(cache.join(""));
                        cache = [];
                        target = "amountMax";
                        break;
                    case "D":
                        temp[target] = Number(cache.join(""));
                        cache = [];
                        target = "drawCount_Death";
                        break;
                    case "H":
                        temp[target] = Number(cache.join(""));
                        cache = [];
                        target = "drawCount_Hit";
                        break;
                    case "T":
                        temp[target] = Number(cache.join(""));
                        cache = [];
                        target = "drawCount_Timer";
                        break;
                    case "!":
                        temp[target] = Number(cache.join(""));
                        cache = [];
                        target = "drawDelay_Timer";
                        break;
                    case "#":
                        temp[target] = Number(cache.join(""));
                        cache = [];
                        target = "typeIndex";
                    case undefined: // exp结束
                        temp[target] = Number(cache.join(""));
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
            Object.freeze(this);
        }

        /** @param {String} exp */
        static createDatas(exp) {
            const result = [];
            if (exp) {
                const exps = exp.split(" ");
                for (let i = 0; i < exps.length; i++) result[i] = new this(exps[i]);
            }
            return Object.freeze(result);
        }
    };

    /** 法术生成数据 -1表示非该等级法术 */
    static SpawningData = class SpawningData {
        static sum = { prob_lv0: 0, prob_lv1: 0, prob_lv2: 0, prob_lv3: 0, prob_lv4: 0, prob_lv5: 0, prob_lv6: 0, prob_lv7: 0, prob_lv10: 0 };
        /** @type {Number} */ prob_lv0 = -1;
        /** @type {Number} */ prob_lv1 = -1;
        /** @type {Number} */ prob_lv2 = -1;
        /** @type {Number} */ prob_lv3 = -1;
        /** @type {Number} */ prob_lv4 = -1;
        /** @type {Number} */ prob_lv5 = -1;
        /** @type {Number} */ prob_lv6 = -1;
        /** @type {Number} */ prob_lv7 = -1;
        /** @type {Number} */ prob_lv10 = -1;
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
    };

    static ModifierAction = class ModifierAction {
        static modifierPropAbbrMap = {
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
                    /** @type {"fireRateWait"|"speed"|"explosionRadius"|"spreadDegrees"|"patternDegrees"|"meleeDamage"|"projectileDamage"|"electricityDamage"|"fireDamage"|"explosionDamage"|"iceDamage"|"sliceDamage"|"healingDamage"|"curseDamage"|"drillDamage"|"overeatingDamage"|"physicsHitDamage"|"poisonDamage"|"radioactiveDamage"|"holyDamage"|"damageCriticalChance"|"knockbackForce"|"material"|"materialAmount"|"trailMaterial"|"trailMaterialAmount"|"bounces"|"friendlyFire"|"lifetime"|"extraEntities"|"gameEffectEntities"|"reloadTime"|"recoil"} */
                    const prop = ModifierAction.modifierPropAbbrMap[part.slice(0, 3)];
                    const type = part.slice(3, 4);
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
                            value = Number(part.slice(4)) * 25;
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
                        // case "extraEntities":
                        // case "gameEffectEntities":
                        case "reloadTime":
                        case "recoil":
                            value = Number(part.slice(4));
                            break;
                        case "material":
                        case "trailMaterial":
                            value = part.slice(4);
                    }
                    this[prop] = { pos, type, value };
                }
            }
        }
    };

    /** @typedef {Set<SpellData>} SpellSet 法术集合 */
    static data = {
        /** @type {Map<String,SpellData>} */ map: new Map(),
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
            const cache = [];
            for (const type of DamageData.types) {
                const key = `damage_mod_${type}`;
                if (key in this) cache.push(...this[key]);
            }
            return new Set(...cache);
        },

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

        /** @type {Array<SpellData>} 生成需要解锁法术 */ spawnRequiresFlag: new Set(),
        $update() {
            this.damage_mod = new Set();
        }
    };

    static #typeList = [/* 无 */ "null", /* 投射物 */ "projectile", /* 静态投射物 */ "staticProjectile", /* 修正 */ "modifier", /* 多重 */ "drawMany", /* 材料 */ "material", /* 其它 */ "other", /* 实用 */ "utility", /* 被动 */ "passive"];
    /** @type {String} 图标url */ #iconIndex;
    name;
    /**
     * @param {Array<String>} data
     * @param {Number} index
     */
    constructor(data, index) {
        super(() => {});
        this.#iconIndex = index;
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
        return this.data.map.get(key) ?? this.$NULL;
    };

    static queryByExp = (() => {
        //prettier-ignore
        embed(`#expParser.js`)
        return parse;
    })();

    /**
     * 注册自定义的法术标签
     * @param {String} tag
     * @param {(data:SpellData) => Boolean } predicate
     */
    static registerTag = (tag, predicate) => {
        this.data[tag] = new Set([...this.data.all].filter(predicate));
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

        const storage = this.data;
        toChunks(embed(`#data.js`), 17).forEach((v, i) => {
            const data = new this(v, i);
            //#region 向数据库中写入
            storage.all.add(data);
            // id, 正式名, 别名均创建映射
            for (const mapKey of [...data.alias, data.id, data.name]) storage.map.set(mapKey, data);

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
                if (`${type}Damage` in data.modifierAction) storage[`damage_mod_${type}`].add(data);
            }

            if (data.mana < 5) {
                storage.mana_drainlowly.add(data);
                if (data.mana === 0) storage.mana_0.add(data);
                else storage.mana_increase.add(data);
            }

            //#endregion

            freeze(data);
        });
    }
}
