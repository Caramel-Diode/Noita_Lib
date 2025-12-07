class EntityData {
    /** @type {Array<String>} */
    static #tagMap;

    /** @type {Map<string,EntityData>} */
    static datas = new Map();
    /** @type {Map<string,Array<EntityData>>} */
    static datasNameMap = new Map();
    /** @type {{[key:string]: Set<EntityData>}} */
    static tagSets = {};

    /** @type {{[key:string]: Set<EntityData>}} */
    static componentSets = {};

    /** @type {{[key:string]: Set<EntityData>}} */
    static pathSets = {};

    /** @type {{[key:string]: Set<EntityData>}} */
    static pathSetsDeeply = {};

    static get entityComponents() {
        return Reflect.ownKeys(this.componentSets);
    }

    static get entityTags() {
        return [...this.#tagMap];
    }

    static Component = class Component {
        /**
         * @type {(index:number) => string|undefined}
         */
        static getMaterialID = (() => {
            const materialDatas = Material.datas;
            return index => materialDatas[index]?.id;
        })();
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
                ] = new Bits(data[0]).toArray(16);
                /** @type {DamageData} 伤害表 */
                this.damage = new DamageData(data[1]);
                /** @type {number} 爆炸半径 */
                this.explosionRadius = data[2];
                data[6] ??= 0;
                /** @type {RangeValue} 存在时间 */
                this.lifetime = new RangeValue(data[3] - data[6], data[3] + data[6]);
                /** @type {RangeValue} 飞行速度 */
                this.speed = new RangeValue(data[4], data[5]);
                /** @type {number} 散射 */
                this.spreadDegrees = data[7] ?? 0;
                /** @type {number} 击退 */
                this.knockbackForce = data[8] ?? 0;
                /** @type {number} 弹跳次数 */
                this.bounces = data[9] ?? 0;
                /** @type {number} 伤害间隔 */
                this.damageInterval = data[10] ?? 1;
                /** @type {number} 榨血系数? */
                this.bloodCountMultiplier = data[11] ?? 1;
                /** @type {number} 自命中延迟 */
                this.collideWithShooterFrames = data[12] ?? -1;
                /** @type {number} 挖掘等级 */
                this.destroyDurability = data[13] ?? 0;
                /** @type {number} 挖掘穿透系数 */
                this.destroyPenetrationCoeff = data[14] ?? 0;
                /** @type {number} 爆炸挖掘等级 */
                this.explosionDestroyDurability = data[15] ?? 10;
                /** @type {number} 爆炸挖掘能量 */
                this.explosionDestroyEnergy = data[16] ?? 20000;
                /** @type {string} 游戏效果实体 */
                this.damageGameEffectEntities = data[17];
                /** @type {string} 碰撞加载实体 */
                this.collisionEntity = data[18];
                /** @type {string} 爆炸加载实体 */
                this.explosionEntity = data[19];
                /** @type {number} 爆炸击退系数 */
                this.explosionKnockbackForce = data[20] ?? 1;
                /** @type {string} 爆炸生成材料 */
                this.explosionCreateMaterial = data[21] ?? "";
                /** @type {string} 可命中类型 */
                this.collideWithTag = data[22] ?? "hittable";
            }
        };

        static DamageModel = class DamageModelComponent extends Component {
            /** @param {Array} data  */
            constructor(data) {
                super();
                const { getMaterialID } = Component;
                const materialDatas = Material.datas;
                /** @type {number} 生命值上限 */
                this.maxHp = data[0];
                /** @type {string} 血液材料 */
                this.bloodMaterial = getMaterialID(data[1]);
                /** @type {string} 飞溅血液材料 */
                this.bloodSprayMaterial = getMaterialID(data[2]);
                /** @type {string} 身体材料 */
                this.ragdollMaterial = getMaterialID(data[3]);
                /** @type {{[key: String]: Number}} 材料伤害表 */
                {
                    const map = (this.materialDamageData = Object.create(null));
                    for (const [k, v] of Object.entries(data[4] ?? 0)) map[getMaterialID(k)] = v;
                    freeze(map);
                }
                /** @type {number} 肺容量 */
                this.airInLungsMax = data[5];
                /** @type {number} 窒息伤害 */
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
                ] = new Bits(data[17]).toArray(6);
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
                this.meleeDamage = new RangeValue(data[5], data[4]);
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
                ] = new Bits(data[8]).toArray(8);
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
            constructor(data, varName, path) {
                super();
                [this.string = "", this.bool = false, this.float = 0, this.int = 0] = data;
                this.varName = varName;
                // 这里如果projectile_file为空字符串则代表为本身路径
                if (varName === "projectile_file" && this.string === "") this.string = path;
            }
        };

        static Lifetime = class LifetimeComponent extends Component {
            /**
             * @param {number|[number,number]} data
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
                ] = new Bits(data[2]).toArray(2);
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
                /** @type {number} 伤害间隔 */
                this.damageInterval = data[3] ?? 1;
                /** @type {number} 圆形范围半径 */
                this.circleRadius = data[4] ?? 0;
                /** @type {string} */
                this.target = data[5];
            }
        };

        static ExplodeOnDamage = class ExplodeOnDamageComponent extends Component {
            /**
             * @param {Array} data
             */
            constructor(data) {
                super();
                /** @type {number} 爆炸伤害 */
                this.damage = data[0];
                /** @type {number} 爆炸半径 */
                this.radius = data[1];
                /** @type {Boolean} 爆炸有伤害 */
                this.damageMortals = data[2];
                /** @type {number} 受伤爆炸概率 */
                this.explodeOnDamagePercent = data[3] ?? 1;
                /** @type {number} 失效爆炸概率 */
                this.explodeOnDeathPercent = data[4] ?? 1;
                /** @type {number} 受损失效概率 */
                this.physicsBodyModifiedDeathProbability = data[5] ?? 0;
                /** @type {number} 损毁所需受损占比 */
                this.physicsBodyDestructionRequired = data[6] ?? 0.5;
                /** @type {string} 加载实体 */
                this.entity = data[7];
                /** @type {Boolean} 爆炸击退系数 */
                this.knockbackForce = data[8] ?? 1;
                /** @type {number} 爆炸挖掘等级 */
                this.explosionDestroyDurability = data[9] ?? 10;
                /** @type {number} 爆炸挖掘能量 */
                this.explosionDestroyEnergy = data[10] ?? 20000;
                /** @type {string} 爆炸生成材料 */
                this.explosionCreateMaterial = data[11] ?? "";
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
                /** @type {number} 爆炸伤害 */
                this.damage = data[1];
                /** @type {number} 爆炸半径 */
                this.radius = data[2];
                /** @type {Boolean} 爆炸有伤害 */
                this.damageMortals = !!data[3];
                /** @type {string} 加载实体 */
                this.entity = data[4];
                /** @type {Boolean} 爆炸击退系数 */
                this.knockbackForce = !!(data[5] ?? true);
                /** @type {Boolean} 爆炸后清除实体 */
                this.killEntity = !!data[6];
                /** @type {number} 爆炸挖掘等级 */
                this.explosionDestroyDurability = data[7] ?? 10;
                /** @type {number} 爆炸挖掘能量 */
                this.explosionDestroyEnergy = data[8] ?? 20000;
                /** @type {string} 爆炸生成材料 */
                this.explosionCreateMaterial = data[9] ?? "";
                data[10] ??= 0;
                data[11] ??= 0;
                /** @type {RangeValue} 定时时长 */
                this.delay = new RangeValue(data[10] - data[11], data[10] + data[11]);
            }
        };

        static Lightning = class LightningComponent extends Component {
            constructor(data) {
                super();
                [
                    this.explosionDamageMortals, //=== [0] 爆炸造成伤害
                    this.explosionType, //============ [1] 爆炸具有闪电链
                    this.isProjectile //============== [2] 视作投射物
                ] = new Bits(data[0]).toArray(3);
                /** @type {number} 爆炸伤害 */
                this.explosionDamage = data[1];
                /** @type {number} 爆炸半径 */
                this.explosionRadius = data[2];
                /** @type {number} 爆炸挖掘等级 */
                this.explosionDestroyDurability = data[3] ?? 10;
                /** @type {number} 爆炸挖掘能量 */
                this.explosionDestroyEnergy = data[4] ?? 20000;
                /** @type {string} 爆炸加载实体 */
                this.explosionEntity = data[5];
                /** @type {number} 爆炸击退系数 */
                this.explosionKnockbackForce = data[6] ?? 1;
                /** @type {string} 爆炸生成材料 */
                this.explosionCreateMaterial = data[7] ?? "";
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
                ] = new Bits(data[0]).toArray(4);
                this.distance = data[1];
                this.targetingCoeff = data[2];
                this.velocityMultiplier = data[3];
                this.maxTurnRate = data[4];
                /** @type {string} */
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
                    this.killWhenFinished //= [2] 完成后清除实体
                ] = new Bits(data[0], true).toArray(3);
                this.radius = data[1];
                this.stepsPerFrame = data[2];
                /** @type {{[key: string]: string}} 材料转化表 */
                this.convertMap = Object.create(null);
                const { getMaterialID } = Component;
                for (const [from, to] of Object.entries(data[3] ?? 0)) {
                    this.convertMap[getMaterialID(from) ?? from] = getMaterialID(to);
                }
                this.igniteMaterials = data[4] ?? 0;
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
                ] = new Bits(data[0]).toArray(3);
                /** @type {number} 吞噬半径 */
                this.radius = data[1];
                /** @type {number} 吞噬概率 */
                this.eatProbability = data[2];
                /** @type {Array<string>} 忽略材料 */
                this.ignoredMaterials = (data[3] ?? "").split(",").filter(Boolean);
                /** @type {string} 忽略材料标签 */
                this.ignoredMaterialTag = data[4];
                /** @type {Array<string>} 材料组 */
                this.materials = (data[5] ?? "").split(",").filter(Boolean);
                // console.log(this.materials);
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
                /** @type {number} 承伤系数 */
                this.damageMultiplier = data[2] ?? 1;
            }
        };

        static Velocity = class VelocityComponent extends Component {
            /**
             * @param {Array} data
             */
            constructor(data) {
                super();
                /** @type {number} 空气阻力 */
                this.airFriction = data[0];
                /** @type {number} 重力 */
                this.gravity = data[1];
                /** @type {number} 质量 */
                this.mass = data[2];
                /** @type {number} 速度上限 */
                this.speedMax = data[3] ?? 1000;
            }
        };

        static GameEffect = class GameEffectComponent extends Component {
            /**
             * @param {Array} data
             */
            constructor(data) {
                super();
                /** @type {string} 效果类型 */
                this.effectType = data[0];
                /** @type {number} 持续时间 */
                this.duration = data[1];
            }
        };

        static LaserEmitter = class LaserEmitterComponent extends Component {
            /**
             * @param {Array} data
             */
            constructor(data) {
                super();
                this.damage = data[0];
                this.destroyDurability = data[1];
                this.destroyEnergy = data[2];
                this.size = new AABB(data[3], data[4]);
                this.material = data[5];
            }
        };

        static ItemPickUpper = class ItemPickUpperComponent extends Component {
            constructor(data) {
                super();
                [this.isImmuneToKicks, this.dropItems] = new Bits(data).toArray(2, true);
            }
        };

        constructor() {}
    };
    #dropMoneyAble = false;

    /** 掉落金块价值 (根据最大生命值计算金块掉落价值) */
    get dropMoney() {
        if (!this.#dropMoneyAble) return 0;
        if (!this.damageModelComponent) return 0;
        return Math.floor(Math.max(this.damageModelComponent.maxHp / 25, 1)) * 10;
    }

    /**
     * @param {{[key :number]: Array<string|number>}} data
     * @param {string} path
     */
    constructor(data, path) {
        // [0] 号位 基本信息
        this.name = data[0][0];
        this.path = path;
        if (!this.name) this.name = path;
        this.tags = [];
        new Bits(parseBigint(data[0][1], 36)).toArray(EntityData.#tagMap.length).forEach((v, i) => !v || this.tags.push(EntityData.#tagMap[i]));
        this.#dropMoneyAble = !!data[0][2];
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
            for (const key in data[4]) this.variableStorageComponent[key] = new Comp.VariableStorage(data[4][key], key, path);
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
        // [16] 号位 物质吞噬组件
        if (data[16]) this.cellEaterComponent = data[16].map(e => new Comp.CellEater(e));
        // [17] 号位 碰撞箱组件
        if (data[17]) this.hitBoxComponent = new Comp.Hitbox(data[17]);
        // [18] 号位 速度组件
        if (data[18]) this.velocityComponent = new Comp.Velocity(data[18]);
        // [19] 号位 游戏效果组件
        if (data[19]) this.gameEffectComponent = data[19].map(e => new Comp.GameEffect(e));
        // [20] 号位 射线发射组件
        if (data[20]) this.laserEmitterComponent = data[20].map(e => new Comp.LaserEmitter(e));
        // [21] 号位 物品拾取组件
        if (data[21]) this.itemPickUpperComponent = new Comp.ItemPickUpper(data[21]);
    }

    /**
     * @param {string} fullPath
     */
    static query(fullPath) {
        return this.datas.get(fullPath) ?? { name: fullPath, tags: [], [console.warn(fullPath) ?? "/* undefined */"]: 0 };
    }

    static queryByName(name) {
        return [...(this.datasNameMap.get(name) ?? [])];
    }

    /**
     * @param {string} tag
     */
    static queryByTag(tag) {
        return [...(this.tagSets[tag] ?? [])];
    }

    /**
     * @param {string} path
     * @param {boolean} [deeply=false]
     */
    static queryByPath(path, deeply = false) {
        const storage = deeply ? this.pathSetsDeeply : this.pathSets;
        if (path in storage) return [...storage[path]];
        return [];
    }

    /**
     * @param  {...string} components
     * @returns {Array<EntityData>}
     */
    static queryByComponent(...components) {
        let result = new Set();
        for (let comp of components) {
            comp = comp[0].toLocaleLowerCase() + comp.slice(1);
            if (!(comp in this.componentSets)) continue;
            // console.log(comp);
            result = result.union(this.componentSets[comp]);
        }
        return [...result];
    }

    static init() {
        /** @type {Map<string,{[key:number]:Object}>} */
        const flatted = new Map();

        const [raw, tags] = embed(`#data.js`);
        this.#tagMap = tags.split(" ");

        /** 展平xml路径 当key是数字时表示数据而不是目录 */
        (function flatPath(obj, path = "") {
            for (const key in obj) {
                if (!isNaN(key)) return flatted.set(path.slice(1), obj);
                flatPath(obj[key], `${path}/${key}`);
            }
        })(raw);
        const { tagSets } = this;
        for (const tag of this.#tagMap) tagSets[tag] = new Set();
        for (const [path, rawData] of flatted) {
            const entityData = new this(rawData, path);
            {
                const array = this.datasNameMap.get(entityData.name) ?? [];
                array.push(entityData);
                this.datasNameMap.set(entityData.name, array);
                this.datasNameMap.set(entityData.path, array);
            }
            this.datas.set(path, entityData);
            for (const tag of entityData.tags) tagSets[tag].add(entityData);
            for (const key in entityData) {
                if (key.endsWith("Component")) {
                    this.componentSets[key] ??= new Set();
                    this.componentSets[key].add(entityData);
                }
            }
            const pathParts = path.split("/").slice(0, -1);
            // 最长路径
            {
                const pathKey = pathParts.join("/");
                this.pathSets[pathKey] ??= new Set();
                this.pathSetsDeeply[pathKey] ??= new Set();
                this.pathSets[pathKey].add(entityData);
                this.pathSetsDeeply[pathKey].add(entityData);
            }
            while (pathParts.pop()) {
                const pathKey = pathParts.join("/");
                this.pathSetsDeeply[pathKey] ??= new Set();
                this.pathSetsDeeply[pathKey].add(entityData);
            }
        }
    }
}
