const flatted = {};
const main = (obj, path = "") => {
    let isEnd = true;
    for (const key in obj) {
        if (isNaN(key)) {
            const target = obj[key];
            isEnd = false;
            main(target, path + "/" + key);
        }
    }
    if (isEnd) flatted[path.slice(1)] = obj;

    return flatted;
};
console.log(main(x));
console.log(tags);

// 处理展平后的数据
const { freeze } = Object;
/**
 * 将数字转为8位 bit 数组
 * @callback to8Bits
 * @param {Number} num
 * @param {Boolean} toBoolean
 * @returns {[0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1]}
 */
/**
 * 将数字转为16位 bit 数组
 * @callback to16Bits
 * @param {Number} num
 * @param {Boolean} toBoolean
 * @returns {[0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1]}
 */
/**
 * 将数字转为32位 bit 数组
 * @callback to32Bits
 * @param {Number} num
 * @param {Boolean} toBoolean
 * @returns {[0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1]}
 */

/**
 * @type {to8Bits & {16: to16Bits, 32: to32Bits}}
 */
const toBits = (num, toBoolean = false) => {
    const bits = new Array(8);
    if (toBoolean) for (let i = 7; i >= 0; i--) bits[i] = ((num >> i) & 1) === 1;
    else for (let i = 7; i >= 0; i--) bits[i] = (num >> i) & 1;
    return bits;
};

toBits[16] = (num, toBoolean = false) => {
    const bits = new Array(16);
    if (toBoolean) for (let i = 15; i >= 0; i--) bits[i] = ((num >> i) & 1) === 1;
    else for (let i = 15; i >= 0; i--) bits[i] = (num >> i) & 1;
    return bits;
};

toBits[32] = (num, toBoolean = false) => {
    const bits = new Array(32);
    if (toBoolean) for (let i = 31; i >= 0; i--) bits[i] = ((num >> i) & 1) === 1;
    else for (let i = 31; i >= 0; i--) bits[i] = (num >> i) & 1;
    return bits;
};

class DamageData {
    /** @type {['projectile', 'melee', 'electricity', 'fire', 'explosion', 'ice', 'slice', 'healing', 'curse', 'drill', 'holy', 'overeating', 'physicsHit', 'poison', 'radioactive']} */
    static types = Object.freeze(Object.keys(new this("")));
    /** @type {"multipliers"|"values"} 数值类型 */ #type;
    //#region 成员...
    /**
     * ![](data:image/webp;base64,UklGRmoAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCAAAAABDzD/ERFCURsp0Eji+C5gfc3hIaL/4fMhRNMOx3HEA1ZQOCAkAAAAMAEAnQEqDgAOAAEAHCWkAANwAP73nf//o3X/+jPf//0bsAAA) [`投射物`](https://noita.wiki.gg/zh/wiki/伤害类型#投射物伤害)
     * @type {Number}
     */
    projectile;
    /**
     * ![](data:image/webp;base64,UklGRmQAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCUAAAABDzD/ERFCUSNJyu7dlwyR/4SsnABcEBHR/2hOW6BZqSbakRZFAFZQOCAYAAAAMAEAnQEqDgAOAAEAHCWkAANwAP79wIAA) [`近战`](https://noita.wiki.gg/zh/wiki/伤害类型#近战伤害)
     * @type {Number}
     */
    melee;
    /**
     * ![](data:image/webp;base64,UklGRmAAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCEAAAABDzD/ERHCTNs2kQKgVMb/KqQCGJCI/gdirWN8PrWOcRwAVlA4IBgAAAAwAQCdASoOAA4AAQAcJaQAA3AA/v3AgAA=) [`雷电`](https://noita.wiki.gg/zh/wiki/伤害类型#雷电伤害)
     * @type {Number}
     */
    electricity;
    /**
     * ![](data:image/webp;base64,UklGRl4AAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSB8AAAABDzD/ERHCTNs2lQJgVMIfVQH0HoaI/ocxImPsvlIAAFZQOCAYAAAAMAEAnQEqDgAOAAEAHCWkAANwAP79wIAA) [`火焰`](https://noita.wiki.gg/zh/wiki/伤害类型#火焰伤害)
     * @type {Number}
     */
    fire;
    /**
     * ![](data:image/webp;base64,UklGRmAAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCEAAAABDzD/ERGCSAAiqMZ4YLxqjAduRPQ/oqgsh+G+h6EsowgAVlA4IBgAAAAwAQCdASoOAA4AAQAcJaQAA3AA/v3AgAA=) [`爆炸`](https://noita.wiki.gg/zh/wiki/伤害类型#爆炸伤害)
     * @type {Number}
     */
    explosion;
    /**
     * ![](data:image/webp;base64,UklGRmAAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCEAAAABDzD/ERFCUSNJysKXDMH598QgIqL/sdpq3bvH42B58AMAVlA4IBgAAAAwAQCdASoOAA4AAQAcJaQAA3AA/v3AgAA=) [`冰冻`](https://noita.wiki.gg/zh/wiki/伤害类型#冰冻伤害)
     * @type {Number}
     */
    ice;
    /**
     * ![](data:image/webp;base64,UklGRmAAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCIAAAABDzD/ERFCIRtJEMKoHMAmA39an0ZE/+PraxxjJETkedoWVlA4IBgAAAAwAQCdASoOAA4AAQAcJaQAA3AA/v3AgAA=) [`切割`](https://noita.wiki.gg/zh/wiki/伤害类型#切割伤害)
     * @type {Number}
     */
    slice;
    /**
     * ![](data:image/webp;base64,UklGRloAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSBsAAAABDzD/ERFCQSQb1EMw/du8Bv4yRPQ/aDv8o20AVlA4IBgAAAAwAQCdASoOAA4AAQAcJaQAA3AA/v3AgAA=) [`治疗`](https://noita.wiki.gg/zh/wiki/伤害类型#治疗伤害)
     * @type {Number}
     */
    healing;
    /**
     * ![](data:image/webp;base64,UklGRmYAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCcAAAABDzD/ERFCSSRJzgWarJyDFf/0xJyAhS8iov9xfs5mv/kBgM3e2AAAVlA4IBgAAAAwAQCdASoOAA4AAQAcJaQAA3AA/v3AgAA=) [`诅咒` ](https://noita.wiki.gg/zh/wiki/伤害类型#诅咒伤害)
     * @type {Number}
     */
    curse;
    /**
     * ![](data:image/webp;base64,UklGRmAAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCEAAAABDzD/ERFCMSNJ0BiMyh7f9tdqjYj+RwilOI7vO04pIQAAVlA4IBgAAAAwAQCdASoOAA4AAQAcJaQAA3AA/v3AgAA=) [`穿凿`](https://noita.wiki.gg/zh/wiki/伤害类型#穿凿伤害)
     * @type {Number}
     */
    drill;
    /**
     * ![](data:image/webp;base64,UklGRlwAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSB4AAAABDzD/ERFCIcBE0ADuEQo+gLCCiOh/mNbrjclkTANWUDggGAAAADABAJ0BKg4ADgABABwlpAADcAD+/cCAAA==) [`神圣`](https://noita.wiki.gg/zh/wiki/伤害类型#神圣)
     * @type {Number}
     */
    holy;
    /**
     * ![](data:image/webp;base64,UklGRmAAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCIAAAABDzD/ERFCcdo2UCDfgPffMgP0WCOi/yFEKUkyDM/zflsWVlA4IBgAAAAwAQCdASoOAA4AAQAcJaQAA3AA/v3AgAA=) [`过饱和`](https://noita.wiki.gg/zh/wiki/伤害类型#暴食伤害)
     * @type {Number}
     */
    overeating;
    /**
     * ![](data:image/webp;base64,UklGRmQAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCUAAAABDzD/ERFCUSNJyiT7JUlrfQSsmBPAICKi/7Hy9PgJovQ0OQQBAFZQOCAYAAAAMAEAnQEqDgAOAAEAHCWkAANwAP79wIAA) [`物理`](https://noita.wiki.gg/zh/wiki/伤害类型#物理伤害)
     * @type {Number}
     */
    physicsHit;
    /**
     * ![](data:image/webp;base64,UklGRl4AAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSB8AAAABDzD/ERHCVCQb7z0B9G8j0gXwaWSI6H+MLkVtfxQFAFZQOCAYAAAAMAEAnQEqDgAOAAEAHCWkAANwAP79wIAA) [`紫毒`](https://noita.wiki.gg/zh/wiki/伤害类型#紫毒伤害)
     * @type {Number}
     */
    poison;
    /**
     * ![](data:image/webp;base64,UklGRmQAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCYAAAABDzD/ERFCQds2TKUCCJUBeOBHaAAGJKL/kSQzMyS5sSFJ5/PzAFZQOCAYAAAAMAEAnQEqDgAOAAEAHCWkAANwAP79wIAA) [`放射/绿毒`](https://noita.wiki.gg/zh/wiki/伤害类型#绿毒伤害)
     * @type {Number}
     */
    radioactive;

    //#endregion

    /**
     * @param {String} exp 伤害数据表达式
     * @param {Number} [defaultValue] 默认值
     * @param {"multipliers"|"values"} [type]
     */
    constructor(exp, defaultValue = 0, type = "values") {
        this.#type = type;
        const P = [],
            M = [],
            L = [],
            F = [],
            E = [],
            I = [],
            S = [],
            H = [],
            C = [],
            D = [],
            V = [],
            Y = [],
            N = [],
            R = [],
            O = [];
        let target = P;
        const targets = { P, M, L, F, E, I, S, H, C, D, V, Y, N, R, O };
        for (let i = 0; i < exp.length; i++) {
            const char = exp[i];
            if ("PMLFEISHCDVYNRO".includes(char)) target = targets[char];
            else target.push(char);
        }
        const toNumber = data => (data.length ? +data.join("") : defaultValue);
        this.projectile = toNumber(P);
        this.melee = toNumber(M);
        this.electricity = toNumber(L);
        this.fire = toNumber(F);
        this.explosion = toNumber(E);
        this.ice = toNumber(I);
        this.slice = toNumber(S);
        this.healing = toNumber(H);
        this.curse = toNumber(C);
        this.drill = toNumber(D);
        this.overeating = toNumber(V);
        this.physicsHit = toNumber(Y);
        this.poison = toNumber(N);
        this.radioactive = toNumber(R);
        this.holy = toNumber(O);
    }

    get #_XML() {
        let tag = "";
        if (this.#type === "multipliers") tag = "damage_multipliers";
        else tag = "damage_by_type";
        const cache = [];
        cache.push(`projectile="`, this.projectile, `" `);
        cache.push(`melee="`, this.melee, `" `);
        cache.push(`electricity="`, this.electricity, `" `);
        cache.push(`fire="`, this.fire, `" `);
        cache.push(`explosion="`, this.explosion, `"`);
        cache.push(`ice="`, this.ice, `" `);
        cache.push(`slice="`, this.slice, `" `);
        cache.push(`healing="`, this.healing, `" `);
        cache.push(`curse="`, this.curse, `" `);
        cache.push(`drill="`, this.drill, `" `);
        cache.push(`overeating="`, this.overeating, `" `);
        cache.push(`physics_hit="`, this.physicsHit, `" `);
        cache.push(`poison="`, this.poison, `" `);
        cache.push(`radioactive="`, this.radioactive, `" `);
        cache.push(`holy="`, this.holy, `" `);
        return `<${tag} ${cache.join("")}><${tag}/>`;
    }

    get #_exp() {
        const cache = [];
        if (this.#type === "multipliers") {
            if (1 !== this.projectile) cache.push("P", this.projectile);
            if (1 !== this.melee) cache.push("M", this.melee);
            if (1 !== this.electricity) cache.push("L", this.electricity);
            if (1 !== this.fire) cache.push("F", this.fire);
            if (1 !== this.explosion) cache.push("E", this.explosion);
            if (1 !== this.ice) cache.push("I", this.ice);
            if (1 !== this.slice) cache.push("S", this.slice);
            if (1 !== this.healing) cache.push("H", this.healing);
            if (1 !== this.curse) cache.push("C", this.curse);
            if (1 !== this.drill) cache.push("D", this.drill);
            if (1 !== this.overeating) cache.push("V", this.overeating);
            if (1 !== this.physicsHit) cache.push("Y", this.physicsHit);
            if (1 !== this.poison) cache.push("N", this.poison);
            if (1 !== this.radioactive) cache.push("R", this.radioactive);
            if (1 !== this.holy) cache.push("O", this.holy);
        } else {
            if (this.projectile) cache.push("P", this.projectile);
            if (this.melee) cache.push("M", this.melee);
            if (this.electricity) cache.push("L", this.electricity);
            if (this.fire) cache.push("F", this.fire);
            if (this.explosion) cache.push("E", this.explosion);
            if (this.ice) cache.push("I", this.ice);
            if (this.slice) cache.push("S", this.slice);
            if (this.healing) cache.push("H", this.healing);
            if (this.curse) cache.push("C", this.curse);
            if (this.dirll) cache.push("D", this.dirll);
            if (this.overeating) cache.push("V", this.overeating);
            if (this.physicsHit) cache.push("Y", this.physicsHit);
            if (this.poison) cache.push("N", this.poison);
            if (this.radioactive) cache.push("R", this.radioactive);
            if (this.holy) cache.push("O", this.holy);
        }
        return cache.join("");
    }

    /**
     * 转为字符串
     * @param {"XML"|"exp"} [format] 转换格式
     */
    toString(format = "exp") {
        if (format === "exp") return this.#_exp;
        else return this.#_XML;
    }
}

/** 范围值 */
class RangeValue {
    /** 是否为固定值 */
    isFixed = false;
    /**
     * @overload
     * @param {String} exp 范围表达式
     * 支持以下三种表示
     * * `>=min`
     * * `<=max`
     * * `min~max`
     * * `value`
     */

    /**
     * @overload
     * @param {Number} min 最小值
     * @param {Number} max 最大值
     */

    /**
     * @overload
     * @param {Number} value 固定值
     */

    constructor(...args) {
        if (args.length > 1) {
            let [v1, v2] = args;
            if (Number.isFinite(v1)) this.median = v2;
            else if (Number.isFinite(v2)) this.median = v1;
            else this.median = (v1 + v2) / 2;
            if (v1 > v2) [this.max, this.min] = args;
            else if (v1 < v2) [this.min, this.max] = args;
            else {
                this.min = this.max = v1;
                this.isFixed = true;
            }
        } else if (typeof args[0] === "string") {
            /** @type {String} */
            const exp = args[0];
            if (exp.startsWith(">=")) {
                this.median = this.min = Number(exp.slice(2));
                this.max = Infinity;
            } else if (exp.startsWith("<=")) {
                this.median = this.max = Number(exp.slice(2));
                this.min = -Infinity;
            } else if (exp.includes("~")) {
                const [min, max] = exp.split("~");
                this.min = Number(min);
                this.max = Number(max);
                if (this.max < this.min) [this.min, this.max] = [this.max, this.min];
                this.median = (this.min + this.max) / 2;
            } else {
                this.min = this.max = this.median = Number(exp);
                this.isFixed = true;
            }
        } else if (typeof args[0] === "number") {
            this.median = this.min = this.max = args[0];
            this.isFixed = true;
        }
        freeze(this);
    }

    /** @param {String} [unitSymbol] 单位符号 */
    toString(unitSymbol = "") {
        if (this.max === Infinity) return "≥ " + this.min + unitSymbol;
        if (this.min === -Infinity) return "≤ " + this.max + unitSymbol;
        if (this.max - this.min) return `${this.min}${unitSymbol} ~ ${this.max}${unitSymbol}`;
        else return this.median + unitSymbol;
    }

    /**
     * 返回一个同步修改最大值和最小值的新Range对象
     * @param {(value:Number)=>Number} callback
     */
    withChange(callback) {
        return new RangeValue(callback(this.min), callback(this.max));
    }
}

class EntityData {
    static ProjectileComponent = class ProjectileComponent {
        /**
         * @param {Array} data
         */
        constructor(data) {
            [
                this.friendlyFire, //================ [0] 友方伤害
                this.explosionDamageMortals, //====== [1] 爆炸造成伤害
                this.explosionDontDamageShooter, //== [2] 爆炸无自伤
                this.collideWithEntities, //========= [3] 命中实体
                this.collideWithWorld, //============ [4] 命中地形
                this.damageScaledBySpeed, //========= [5] 差速伤害加成
                this.dieOnLiquidCollision, //======== [6] 接触液体时失效
                this.dieOnLowVelocity, //============ [7] 低速时失效
                this.onCollisionDie, //============== [8] 碰撞(命中)时失效
                this.onDeathExplode, //============== [9] 失效时爆炸
                this.onLifetimeOutExplode, //======== [10] 失效时爆炸
                this.onCollisionSpawnEntity, //====== [11] 在碰撞时生成实体
                this.spawnEntityIsProjectile, //===== [12] 生成实体是投射物 (具备施法者信息)
                this.penetrateEntities, //=========== [13] 穿透实体
                this.penetrateWorld, //============== [14] 穿透地形
                this.doMovetoUpdate //=============== [15] 不产生命中
            ] = toBits[16](data[0], true);
            this.damage = new DamageData(data[1]);
            this.explosionRadius = data[2];
            data[6] ??= 0;
            this.lifetime = new RangeValue(data[3] - data[6], data[3] + data[6]);
            this.speed = new RangeValue(data[4], data[5]);
            this.spreadDegrees = data[7] ?? 0;
            this.knockbackForce = data[8] ?? 0;
            this.bounces = data[9];
            this.damageFrequency = data[10] ?? 1;
            this.bloodCountMultiplier = data[11] ?? 1;
            this.collideWithShooterFrames = data[12] ?? -1;
            this.damageGameEffectEntities = data[13];
            this.collisionEntity = data[14];
            this.explosionEntity = data[15];
            this.explosionKnockbackForce = data[16] ?? 1;
        }
    };

    static DamageModelComponent = class DamageModelComponent {
        /** @param {Array} data  */
        constructor(data) {
            this.maxHp = data[0];
            this.bloodMaterial = data[1];
            this.bloodSprayMaterial = data[2];
            this.ragdollMaterial = data[3];
            this.materialDamageData = data[4];
            this.airInLungsMax = data[5];
            this.airLackOfDamage = data[6];
            this.fireProbabilityOfIgnition = data[7];
            this.fireDamageIgnitedAmount = data[8];
            this.fireDamageAmount = data[9];
            this.fallingDamage = new RangeValue(data[11], data[10]);
            this.fallingDamageHeight = new RangeValue(data[13], data[12]);
            this.criticalDamageResistance = data[14];
            this.wetStatusEffectDamage = data[15];
            this.damageMultipliers = data[16];
            [
                this.airNeeded, //============ [0] 需要呼吸
                this.isOnFire, //============= [1] 始终燃烧
                this.fallingDamages, //======= [2] 有摔落伤害
                this.createRagdoll, //======== [3] 遗留尸体
                this.uiReportDamage, //======= [4] 扣血显示
                this.physicsObjectsDamage //== [5] 受冲击伤害
            ] = toBits(data[17], true);
        }
    };

    static AnimalAIComponent = class AnimalAIComponent {
        /**
         * @param {Array} data
         */
        constructor(data) {
            this.dashDamage = data[0];
            this.dashDistance = data[1];
            this.dashFramesCD = data[2];
            this.dashSpeed = data[3];
            this.meleeDamage = new RangeValue(data[4], data[3]);
            this.meleeMaxDistance = data[6];
            this.food = data[7];
            [
                this.attackOnlyIfAttacked, //====== [0] 不主动攻击(仅反击)
                this.canFly, //==================== [1] 可以飞行
                this.canWalk, //=================== [2] 可以行走
                this.defecatesAndPees, //========== [3] 排泄
                this.dontCounterAttackOwnHerd, //== [4] 同阵营误伤不还手
                this.senseCreatures, //============ [5] 寻敌
                this.senseCreaturesThroughWalls, // [6] 透视寻底
                this.triesToRangedAttackFriends //= [7] 使用远程攻击攻击友方 (辅助形怪物)
            ] = toBits(data[8], true);
        }
    };

    static AIAttackComponent = class AIAttackComponent {
        /**
         *
         * @param {Array} data
         */
        constructor(data) {
            this.entity = data[0];
            this.count = new RangeValue(data[1], data[2]);
            this.distance = new RangeValue(data[3], data[4]);
            this.framesBetween = data[5];
            this.framesBetweenGlobal = data[6] ?? data[5];
            this.stateDurationFrames = data[7];
            this.useProbability = data[8] ?? 1;
        }
    };

    static VariableStorageComponent = class VariableStorageComponent {
        /**
         * @param {Array} data
         */
        constructor(data) {
            [this.string = "", this.bool = false, this.float = 0, this.int = 0] = data;
        }
    };

    static LifetimeComponent = class lifetimeComponent {
        /**
         * @param {Number} data
         */
        constructor(data) {
            this.lifetime = data;
        }
    };

    static GenomeDataComponent = class GenomeDataComponent {
        /**
         * @param {Array} data
         */
        constructor(data) {
            this.foodChainRank = data[0];
            this.herd = data[1];
            [
                this.berserkDontAttackFriends, //= [0] 狂暴不攻击友方
                this.isPredator //================ [1] 肉食性
            ] = toBits(data[2], true);
        }
    };

    static LoadEntitiesComponent = class LoadEntitiesComponent {
        /**
         * @param {Array|Number} data
         */
        constructor(data) {
            if (typeof data === "number") this.count = new RangeValue(data);
            else this.count = new RangeValue(...data);
        }
    };

    static AreaDamageComponent = class AreaDamageComponent {
        /**
         * @param {Array} data
         */
        constructor(data) {
            this.width = data[0];
            this.height = data[1];
            this.damage = new DamageData(data[2]);
            this.damageFrequency = data[3] ?? 1;
            this.circleRadius = data[4] ?? 0;
        }
    };

    static ExplodeOnDamageComponent = class ExplodeOnDamageComponent {
        /**
         * @param {Array} data
         */
        constructor(data) {
            this.damage = data[0];
            this.radius = data[1];
            this.damageMortals = data[2];
            this.explodeOnDamagePercent = data[3] ?? 1;
            this.explodeOnDeathPercent = data[4] ?? 1;
            this.physicsBodyModifiedDeathProbability = data[5] ?? 0;
            this.physicsBodyDestructionRequired = data[6] ?? 0.5;
            this.entity = data[7];
            this.knockbackForce = data[8] ?? 1;
        }
    };

    static ExplosionComponent = class ExplosionComponent {
        // 触发爆炸条件
        static triggerType = [, "ON_HIT", "ON_TIMER", "ON_DEATH"];
        /**
         * @param {Array} data
         */
        constructor(data) {
            this.trigger = ExplosionComponent.triggerType[data[0]];
            this.damage = data[1];
            this.radius = data[2];
            this.damageMortals = data[3];
            this.entity = data[4];
            this.knockbackForce = data[5];
            this.killEntity = Boolean(data[6]);
            data[7] ??= 0;
            data[8] ??= 0;
            this.delay = new RangeValue(data[7] - data[8], data[7] + data[8]);
        }
    };

    static LightningComponent = class LightningComponent {
        constructor(data) {
            [
                this.explosionDamageMortals, //=== [0] 爆炸造成伤害
                this.explosionType, //============ [1] 爆炸具有闪电链
                this.isProjectile //============== [2] 视作投射物
            ] = toBits(data[0], true);
            this.explosionDamage = data[1];
            this.explosionRadius = data[2];
            this.explosionEntity = data[3];
            this.explosionKnockbackForce = data[4] ?? 1;
        }
    };

    static GameAreaEffectComponent = class GameAreaEffectComponent {
        /**
         * @param {Array} data
         */
        constructor(data) {
            [this.radius, this.cd = -1] = data;
        }
    };

    static HomingComponent = class HomingComponent {
        /**
         * @param {Array} data
         */
        constructor(data) {
            [
                this.targetWhoShot, //=========== [0] 追踪施法者(回旋镖)
                this.justRotateWowardsTarget, //= [1] 仅转向而不改变速度
                this.predefinedTarget, //======== [2] 目标标签反选
                this.lookForRootEntitiesOnly //== [3] 仅追踪根实体
            ] = toBits(data[0], true);
            this.distance = data[1];
            this.targetingCoeff = data[2];
            this.velocityMultiplier = data[3];
            this.maxTurnRate = data[4];
            this.targetTag = data[5] ?? "homing_target";
        }
    };

    static MagicConvertMaterialComponent = class MagicConvertMaterialComponent {
        /**
         * @param {Array} data
         */
        constructor(data) {
            [
                this.convertEntities, //= [0] 转化实体
                this.isCircle, //======== [1] 是圆形
                this.fromAnyMaterial, //= [2] 任何原料
                this.killWhenFinished //= [3] 完成后清除实体
            ] = toBits(data[0], true);
            this.radius = data[1];
            this.fromMaterial = data[2] ?? "air";
            this.toMaterial = data[3];
            this.stepsPerFrame = data[4];
            this.reaction = Object.create(null);
            /** @type {Array<String>} */
            const from_ = (data[5] ?? "").split(",");
            /** @type {Array<String>} */
            const to_ = (data[6] ?? "").split(",");

            for (let i = 0; i < from_.length; i++) {
                this.reaction[from_[i]] = to_[i];
            }
        }
    };

    static CellEaterComponent = class CellEaterComponent {
        /**
         * @param {Array} data
         */
        constructor(data) {
            [
                this.eatDynamicPhysicsBodies, //= [0] 能破坏物理刚体
                this.limitedMaterials, //======== [1] 为true 表示仅能吞噬材料表中物质 否则表示能吞噬材料表外的其它物质
                this.onlyStain //=============== [2] 仅吞噬污渍
            ] = toBits(data[0], true);
            this.radius = data[1];
            this.eatProbability = data[2];
            this.ignoredMaterial = data[3];
            this.ignored_material_tag = data[4];
            this.materials = (data[5] ?? "").split(",");
        }
    };

    /** @param {{[key :Number]: Array<String|Number>}} data */
    constructor(data) {
        // [0] 号位 基本信息
        this.name = data[0][0];
        const bits = [];
        for (let i = 1; i < data[0].length; i++) bits.push(...toBits[32](data[0][i]));
        this.tags = [];
        for (let i = 0; i < tags.length; i++) {
            if (bits[i]) this.tags.push(tags[i]);
        }
        // [1] 号位 投射物组件
        if (data[1]) this.projectileComponent = new EntityData.ProjectileComponent(data[1]);
        // [2] 号位 伤害模型组件
        if (data[2]) this.damageModelComponent = new EntityData.DamageModelComponent(data[2]);
        // [3] 号位 动物行为组件
        if (data[3]) this.animalAIComponent = new EntityData.AnimalAIComponent(data[3]);
        // [4] 号位 变量存储组件
        if (data[4]) {
            this.variableStorageComponent = Object.create(null);
            for (const key in data[4]) this.variableStorageComponent[key] = new EntityData.VariableStorageComponent(data[4][key]);
        }
        // [5] 号位 (远程)攻击行为组件
        if (data[5]) this.aIAttackComponent = data[5].map(e => new EntityData.AIAttackComponent(e));
        // [6] 号位 存在时间组件
        if (data[6]) this.lifetimeComponent = new EntityData.LifetimeComponent(data[6]);
        // [7] 号位 基因组数据组件
        if (data[7]) this.genomeDataComponent = new EntityData.GenomeDataComponent(data[7]);
        // [8] 号位 加载实体组件
        if (data[8]) {
            this.loadEntitiesComponent = Object.create(null);
            for (const key in data[8]) this.loadEntitiesComponent[key] = new EntityData.LoadEntitiesComponent(data[8][key]);
        }
        // [9] 号位 伤害领域组件
        if (data[9]) this.areaDamageComponent = data[9].map(e => new EntityData.AreaDamageComponent(e));
        // [10] 号位 受损爆炸组件
        if (data[10]) this.explodeOnDamageComponent = new EntityData.ExplodeOnDamageComponent(data[10]);
        // [11] 号位 爆炸组件
        if (data[11]) this.explosionComponent = new EntityData.ExplosionComponent(data[11]);
        // [12] 号位 闪电组件
        if (data[12]) this.lightningComponent = new EntityData.LightningComponent(data[12]);
        // [13] 号位 游戏效果组件
        if (data[13]) this.gameAreaEffectComponent = data[13].map(e => new EntityData.GameAreaEffectComponent(e));
        // [14] 号位 追踪组件
        if (data[14]) this.homingComponent = data[14].map(e => new EntityData.HomingComponent(e));
        // [15] 号位 物质转化组件
        if (data[15]) this.magicConvertMaterialComponent = data[15].map(e => new EntityData.MagicConvertMaterialComponent(e));
        // [16] 号位 物质转化组件
        if (data[16]) this.cellEaterComponent = data[16].map(e => new EntityData.CellEaterComponent(e));
    }
}
for (const path in flatted) {
    const data = flatted[path];
    console.log(path);
    console.log(new EntityData(data));
}
