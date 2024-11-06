class EntityData {
    /** @type {Array<String>} */
    static #tags;

    /** @type {{[key: String]: EntityData}} */
    static data = {};

    static Component = class Component {
        get $type() {
            return this.constructor.name;
        }

        static Projectile = class ProjectileComponent extends Component {
            /**
             * @param {Array} data
             */
            constructor(data) {
                super();
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
                    this.onLifetimeOutExplode, //======== [10] 存在时间结束时爆炸
                    this.onCollisionSpawnEntity, //====== [11] 在碰撞时生成实体
                    this.spawnEntityIsProjectile, //===== [12] 生成实体是投射物 (具备施法者信息)
                    this.penetrateEntities, //=========== [13] 穿透实体
                    this.penetrateWorld, //============== [14] 穿透地形
                    this.doMovetoUpdate //=============== [15] 不产生命中
                ] = toBits[16](data[0], true);
                /** @type {DamageData} 伤害表 */
                this.damage = new DamageData(data[1]);
                /** @type {Number} 爆炸半径 */
                this.explosionRadius = data[2];
                data[6] ??= 0;
                /** @type {RangeValue} 存在时间 */
                this.lifetime = new RangeValue(data[3] - data[6], data[3] + data[6]);
                /** @type {RangeValue} 飞行速度 */
                this.speed = new RangeValue(data[4], data[5]);
                /** @type {Number} 散射 */
                this.spreadDegrees = data[7] ?? 0;
                /** @type {Number} 击退 */
                this.knockbackForce = data[8] ?? 0;
                /** @type {Number} 弹跳次数 */
                this.bounces = data[9];
                /** @type {Number} 伤害间隔 */
                this.damageInterval = data[10] ?? 1;
                /** @type {Number} 榨血系数? */
                this.bloodCountMultiplier = data[11] ?? 1;
                /** @type {Number} 安全时间 */
                this.collideWithShooterFrames = data[12] ?? -1;
                /** @type {String} 游戏效果实体 */
                this.damageGameEffectEntities = data[13];
                /** @type {String} 碰撞加载实体 */
                this.collisionEntity = data[14];
                /** @type {String} 爆炸加载实体 */
                this.explosionEntity = data[15];
                /** @type {Number} 爆炸击退系数 */
                this.explosionKnockbackForce = data[16] ?? 1;
            }
        };

        static DamageModel = class DamageModelComponent extends Component {
            /** @param {Array} data  */
            constructor(data) {
                super();
                /** @type {Number} 生命值上限 */
                this.maxHp = data[0];
                /** @type {String} 血液材料 */
                this.bloodMaterial = data[1];
                /** @type {String} 飞溅血液材料 */
                this.bloodSprayMaterial = data[2];
                /** @type {String} 身体材料 */
                this.ragdollMaterial = data[3];
                /** @type {{[key: String]: Number}} 材料伤害表 */
                this.materialDamageData = data[4];
                /** @type {Number} 肺容量 */
                this.airInLungsMax = data[5];
                /** @type {Number} 窒息伤害 */
                this.airLackOfDamage = data[6];
                this.fireProbabilityOfIgnition = data[7];
                this.fireDamageIgnitedAmount = data[8];
                this.fireDamageAmount = data[9];
                this.fallingDamage = new RangeValue(data[11], data[10]);
                this.fallingDamageHeight = new RangeValue(data[13], data[12]);
                this.criticalDamageResistance = data[14];
                this.wetStatusEffectDamage = data[15];
                this.damageMultipliers = new DamageData(data[16], 1);
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

        static AnimalAI = class AnimalAIComponent extends Component {
            /**
             * @param {Array} data
             */
            constructor(data) {
                super();
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

        static AIAttack = class AIAttackComponent extends Component {
            /**
             *
             * @param {Array} data
             */
            constructor(data) {
                super();
                this.entity = data[0];
                this.count = new RangeValue(data[1], data[2]);
                this.distance = new RangeValue(data[3], data[4]);
                this.framesBetween = data[5];
                this.framesBetweenGlobal = data[6] ?? data[5];
                this.stateDurationFrames = data[7];
                this.useProbability = data[8] ?? 1;
            }
        };

        static VariableStorage = class VariableStorageComponent extends Component {
            /**
             * @param {Array} data
             */
            constructor(data) {
                super();
                [this.string = "", this.bool = false, this.float = 0, this.int = 0] = data;
            }
        };

        static Lifetime = class lifetimeComponent extends Component {
            /**
             * @param {Number|[Number,Number]} data
             */
            constructor(data) {
                super();
                if (Array.isArray(data)) this.lifetime = new RangeValue(...data);
                else this.lifetime = data;
            }
        };

        static GenomeData = class GenomeDataComponent extends Component {
            /**
             * @param {Array} data
             */
            constructor(data) {
                super();
                this.foodChainRank = data[0];
                this.herd = data[1];
                [
                    this.berserkDontAttackFriends, //= [0] 狂暴不攻击友方
                    this.isPredator //================ [1] 肉食性
                ] = toBits(data[2], true);
            }
        };

        static LoadEntities = class LoadEntitiesComponent extends Component {
            /**
             * @param {Array|Number} data
             */
            constructor(data) {
                super();
                if (typeof data === "number") this.count = new RangeValue(data);
                else this.count = new RangeValue(...data);
            }
        };

        static AreaDamage = class AreaDamageComponent extends Component {
            /**
             * @param {Array} data
             */
            constructor(data) {
                super();
                /** @type {AABB} 尺寸 */
                this.size = new AABB(data[0], data[1]);
                this.damage = new DamageData(data[2]);
                /** @type {Number} 伤害间隔 */
                this.damageInterval = data[3] ?? 1;
                /** @type {Number} 圆形范围半径 */
                this.circleRadius = data[4] ?? 0;
            }
        };

        static ExplodeOnDamage = class ExplodeOnDamageComponent extends Component {
            /**
             * @param {Array} data
             */
            constructor(data) {
                super();
                /** @type {Number} 爆炸伤害 */
                this.damage = data[0];
                /** @type {Number} 爆炸半径 */
                this.radius = data[1];
                /** @type {Boolean} 爆炸有伤害 */
                this.damageMortals = data[2];
                /** @type {Number} 受伤爆炸概率 */
                this.explodeOnDamagePercent = data[3] ?? 1;
                /** @type {Number} 失效爆炸概率 */
                this.explodeOnDeathPercent = data[4] ?? 1;
                /** @type {Number} 受损失效概率 */
                this.physicsBodyModifiedDeathProbability = data[5] ?? 0;
                /** @type {Number} 损毁所需受损占比 */
                this.physicsBodyDestructionRequired = data[6] ?? 0.5;
                /** @type {String} 加载实体 */
                this.entity = data[7];
                /** @type {Boolean} 爆炸击退系数 */
                this.knockbackForce = data[8] ?? 1;
            }
        };

        static Explosion = class ExplosionComponent extends Component {
            // 触发爆炸条件
            static triggerType = [, "ON_HIT", "ON_TIMER", "ON_DEATH"];
            /**
             * @param {Array} data
             */
            constructor(data) {
                super();
                /** @type {"ON_HIT"|"ON_TIMER"|"ON_DEATH"} 爆炸条件 */
                this.trigger = ExplosionComponent.triggerType[data[0]];
                /** @type {Number} 爆炸伤害 */
                this.damage = data[1];
                /** @type {Number} 爆炸半径 */
                this.radius = data[2];
                /** @type {Boolean} 爆炸有伤害 */
                this.damageMortals = Boolean(data[3]);
                /** @type {String} 加载实体 */
                this.entity = data[4];
                /** @type {Boolean} 爆炸击退系数 */
                this.knockbackForce = Boolean(data[5] ?? true);
                /** @type {Boolean} 爆炸后清除实体 */
                this.killEntity = Boolean(data[6]);
                data[7] ??= 0;
                data[8] ??= 0;
                /** @type {RangeValue} 定时时长 */
                this.delay = new RangeValue(data[7] - data[8], data[7] + data[8]);
            }
        };

        static Lightning = class LightningComponent extends Component {
            constructor(data) {
                super();
                [
                    this.explosionDamageMortals, //=== [0] 爆炸造成伤害
                    this.explosionType, //============ [1] 爆炸具有闪电链
                    this.isProjectile //============== [2] 视作投射物
                ] = toBits(data[0], true);
                /** @type {Number} 爆炸伤害 */
                this.explosionDamage = data[1];
                /** @type {Number} 爆炸半径 */
                this.explosionRadius = data[2];
                /** @type {String} 爆炸加载实体 */
                this.explosionEntity = data[3];
                /** @type {Number} 爆炸击退系数 */
                this.explosionKnockbackForce = data[4] ?? 1;
            }
        };

        static GameAreaEffect = class GameAreaEffectComponent extends Component {
            /**
             * @param {Array} data
             */
            constructor(data) {
                super();
                [this.radius, this.cd = -1] = data;
            }
        };

        static Homing = class HomingComponent extends Component {
            /**
             * @param {Array} data
             */
            constructor(data) {
                super();
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
                /** @type {String} */
                this.targetTag = data[5] ?? "homing_target";
            }
        };

        static MagicConvertMaterial = class MagicConvertMaterialComponent extends Component {
            /**
             * @param {Array} data
             */
            constructor(data) {
                super();
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
                /** @type {{[key: String]: String}} 材料转化表 */
                this.reaction = Object.create(null);
                /** @type {Array<String>} */
                const from_ = (data[5] ?? "").split(",");
                /** @type {Array<String>} */
                const to_ = (data[6] ?? "").split(",");

                for (let i = 0; i < from_.length; i++) this.reaction[from_[i]] = to_[i];
            }
        };

        static CellEater = class CellEaterComponent extends Component {
            /**
             * @param {Array} data
             */
            constructor(data) {
                super();
                [
                    this.eatDynamicPhysicsBodies, //= [0] 能破坏物理刚体
                    this.limitedMaterials, //======== [1] 为true 表示仅能吞噬材料表中物质 否则表示能吞噬材料表外的其它物质
                    this.onlyStain //================ [2] 仅吞噬污渍
                ] = toBits(data[0], true);
                /** @type {Number} 吞噬半径 */
                this.radius = data[1];
                /** @type {Number} 吞噬概率 */
                this.eatProbability = data[2];
                /** @type {String} 忽略材料 */
                this.ignoredMaterial = data[3];
                /** @type {String} 忽略材料标签 */
                this.ignoredMaterialTag = data[4];
                /** @type {Array<String>} 材料组 */
                this.materials = (data[5] ?? "").split(",");
            }
        };

        static Hitbox = class HitboxComponent extends Component {
            /**
             * @param {Array} data
             */
            constructor(data) {
                super();
                /** @type {AABB} 碰撞箱尺寸 */
                this.size = new AABB(data[0], data[1]);
                /** @type {Number} 承伤系数 */
                this.damageMultiplier = data[2] ?? 1;
            }
        };

        constructor() {}
    };

    /**
     * @param {{[key :Number]: Array<String|Number>}} data
     * @param {String} path
     */
    constructor(data, path) {
        // [0] 号位 基本信息
        this.name = data[0][0];
        if (!this.name) this.name = path;
        const bits = [];
        for (let i = 1; i < data[0].length; i++) bits.push(...toBits[32](data[0][i]));
        this.tags = [];
        /* prettier-ignore */
        for (let i = 0; i < EntityData.#tags.length; i++) 
                if (bits[i]) this.tags.push(EntityData.#tags[i]);

        const Comp = EntityData.Component;
        // [1] 号位 投射物组件
        if (data[1]) this.projectileComponent = new Comp.Projectile(data[1]);
        // [2] 号位 伤害模型组件
        if (data[2]) this.damageModelComponent = new Comp.DamageModel(data[2]);
        // [3] 号位 动物行为组件
        if (data[3]) this.animalAIComponent = new Comp.AnimalAI(data[3]);
        // [4] 号位 变量存储组件
        if (data[4]) {
            this.variableStorageComponent = Object.create(null);
            for (const key in data[4]) this.variableStorageComponent[key] = new Comp.VariableStorage(data[4][key]);
        }
        // [5] 号位 (远程)攻击行为组件
        if (data[5]) this.aIAttackComponent = data[5].map(e => new Comp.AIAttack(e));
        // [6] 号位 存在时间组件
        if (data[6]) this.lifetimeComponent = new Comp.Lifetime(data[6]);
        // [7] 号位 基因组数据组件
        if (data[7]) this.genomeDataComponent = new Comp.GenomeData(data[7]);
        // [8] 号位 加载实体组件
        if (data[8]) {
            this.loadEntitiesComponent = Object.create(null);
            for (const key in data[8]) this.loadEntitiesComponent[key] = new Comp.LoadEntities(data[8][key]);
        }
        // [9] 号位 伤害领域组件
        if (data[9]) this.areaDamageComponent = data[9].map(e => new Comp.AreaDamage(e));
        // [10] 号位 受损爆炸组件
        if (data[10]) this.explodeOnDamageComponent = new Comp.ExplodeOnDamage(data[10]);
        // [11] 号位 爆炸组件
        if (data[11]) this.explosionComponent = new Comp.Explosion(data[11]);
        // [12] 号位 闪电组件
        if (data[12]) this.lightningComponent = new Comp.Lightning(data[12]);
        // [13] 号位 游戏效果组件
        if (data[13]) this.gameAreaEffectComponent = data[13].map(e => new Comp.GameAreaEffect(e));
        // [14] 号位 追踪组件
        if (data[14]) this.homingComponent = data[14].map(e => new Comp.Homing(e));
        // [15] 号位 物质转化组件
        if (data[15]) this.magicConvertMaterialComponent = data[15].map(e => new Comp.MagicConvertMaterial(e));
        // [16] 号位 物质转化组件
        if (data[16]) this.cellEaterComponent = data[16].map(e => new Comp.CellEater(e));
        // [17] 号位 碰撞箱组件
        if (data[17]) this.hitBoxComponent = new Comp.Hitbox(data[17]);
    }

    /**
     * @param {String} path
     */
    static query(path) {
        return this.data[path] ?? { name: path, tags: [], [console.warn(path) ?? "/* undefined */"]: 0 };
    }

    static init() {
        const flatted = {};
        /**
         * 展平xml路径
         * @returns {{[key :String]:Array}}
         */
        const flatPath = (obj, path = "") => {
            let isEnd = true;
            for (const key in obj) {
                if (isNaN(key)) {
                    const target = obj[key];
                    isEnd = false;
                    flatPath(target, path + "/" + key);
                }
            }
            if (isEnd) flatted[path.slice(1)] = obj;
            return flatted;
        };
        const [raw, tags] = embed(`#data.js`);
        this.#tags = freeze(tags);
        const data = flatPath(raw);
        for (const path in data) {
            this.data[path] = new this(data[path], path);
        }
    }
}
