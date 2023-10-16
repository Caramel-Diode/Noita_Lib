/** [法术数据库](spell.js) */
DB.spell = class {
    /** @type {Promise<HTMLImageElement>} 图标精灵图 */
    static iconImage = utilities.base64ToImg("spellIcon.png");

    /** 提供投射物数据类 */
    static offeredProjectileData = class OfferedProjectileData {
        /** @type {DB.entity} */
        projectileData;
        /** @type {Number} */
        num_min;
        /** @type {Number} */
        num_max;
        /** @type {Boolean} 是否为关联投射物 能否进行追加触发 (首个投射物默认为 true) */
        isRelatedProjectiles;
        /**
         * 在施法块中
         * * true:添加到施法状态中 允许享受施法状态中所有效果
         * * flase:无法享受施法状态的效果
         * @type {Boolean}
         */
        isInCastState;
        /**
         * @param {String} projectileId
         * @param {Number} num_min
         * @param {Number} num_max
         * @param {Boolean} isRelatedProjectiles
         * @param {Boolean} isInCastState
         */
        constructor(projectileId, num_min, num_max, isRelatedProjectiles, isInCastState) {
            this.projectileData = DB.entity.queryById(projectileId);
            this.num_min = num_min;
            this.num_max = num_max;
            this.isRelatedProjectiles = isRelatedProjectiles;
            this.isInCastState = isInCastState;
        }
        /**
         * 获取提供投射物数据数组
         * @param {String} dataStr
         * @returns {Array<DB.spell.OfferedProjectileData>}
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
    /** 抽取数据类 */
    static drawingData = class DrawingData {
        /** @type {Number} */
        common;
        /** @type {Number} */
        hit;
        /** @type {{count:Number,delay:Number}} */
        timer;
        /** @type {Number} */
        death;
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
            this.common = Number.isNaN(C) ? 0 : C;
            this.hit = Number.isNaN(H) ? 0 : H;
            this.timer = {
                count: Number.isNaN(T_count) ? 0 : T_count,
                delay: Number.isNaN(T_delay) ? 0 : T_delay
            };
            this.death = Number.isNaN(D) ? 0 : D;
        }
    };
    /** 法术生成数据类 -1表示非该等级法术 */
    static spawningData = class SpawningData {
        /** @type {Number} */
        prob_lv0 = -1;
        /** @type {Number} */
        prob_lv1 = -1;
        /** @type {Number} */
        prob_lv2 = -1;
        /** @type {Number} */
        prob_lv3 = -1;
        /** @type {Number} */
        prob_lv4 = -1;
        /** @type {Number} */
        prob_lv5 = -1;
        /** @type {Number} */
        prob_lv6 = -1;
        /** @type {Number} */
        prob_lv7 = -1;
        /** @type {Number} */
        prob_lv10 = -1;
        /** @type {String} */
        requiresFlag = "None";
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

    static data = {
        /** @type {Map<String,DB.spell>} id  data */ id_map: new Map(),
        /** @type {Map<String,DB.spell>} */ name_map: new Map(),

        /** @type {Set<DB.spell>} 所有法术 */ all: new Set(),

        /** @type {Set<DB.spell>} 投射物类型法术 */ type_projectile: new Set(),
        /** @type {Set<DB.spell>} 静态投射物类型法术 */ type_staticProjectile: new Set(),
        /** @type {Set<DB.spell>} 修正类型法术 */ type_modifier: new Set(),
        /** @type {Set<DB.spell>} 多重类型法术 */ type_drawMany: new Set(),
        /** @type {Set<DB.spell>} 材料类型法术 */ type_material: new Set(),
        /** @type {Set<DB.spell>} 其他类型法术 */ type_other: new Set(),
        /** @type {Set<DB.spell>} 实用类型法术 */ type_utility: new Set(),
        /** @type {Set<DB.spell>} 被动类型法术 */ type_passive: new Set(),

        /** @type {Set<DB.spell>} 0级法术 */ level_0: new Set(),
        /** @type {Set<DB.spell>} 1级法术 */ level_1: new Set(),
        /** @type {Set<DB.spell>} 2级法术 */ level_2: new Set(),
        /** @type {Set<DB.spell>} 3级法术 */ level_3: new Set(),
        /** @type {Set<DB.spell>} 4级法术 */ level_4: new Set(),
        /** @type {Set<DB.spell>} 5级法术 */ level_5: new Set(),
        /** @type {Set<DB.spell>} 6级法术 */ level_6: new Set(),
        /** @type {Set<DB.spell>} 7级法术 */ level_7: new Set(),
        /** @type {Set<DB.spell>} 10级法术 */ level_10: new Set(),

        /** @type {Set<DB.spell>} 影响存在时间的法术 */ lifetime_mod: new Set(),
        /** @type {Set<DB.spell>} 增加存在时间的法术 */ lifetime_up: new Set(),
        /** @type {Set<DB.spell>} 减少存在时间的法术 */ lifetime_down: new Set(),

        /** @type {Set<DB.spell>} 不耗蓝的法术 */ mana_0: new Set(),
        /** @type {Set<DB.spell>} 低耗蓝的法术 */ mana_drainlowly: new Set(),
        /** @type {Set<DB.spell>} 回蓝的法术 */ mana_increase: new Set(),

        /** @type {Set<DB.spell>} 叠加额外修正的法术 */ extra_modifier: new Set(),

        /** @type {Set<DB.spell>} 影响投射物速度的法术 */ speed_mod: new Set(),

        /** @type {Set<DB.spell>} 带有抽取的法术 */ draw: new Set(),
        /** @type {Set<DB.spell>} 带有基础抽取的法术 */ draw_common: new Set(),
        /** @type {Set<DB.spell>} 带有碰撞触发抽取的法术 */ draw_hit: new Set(),
        /** @type {Set<DB.spell>} 带有定时触发抽取的法术 */ draw_timer: new Set(),
        /** @type {Set<DB.spell>} 带有失效触发抽取的法术 */ draw_death: new Set(),

        /** @type {Set<DB.spell>} 影响伤害的法术 */ damage_mod: new Set(),

        /** @type {Set<DB.spell>} 影响[投射物]伤害的法术 */ damage_mod_projectile: new Set(),
        /** @type {Set<DB.spell>} 影响[近战]伤害的法术 */ damage_mod_melee: new Set(),
        /** @type {Set<DB.spell>} 影响[雷电]伤害的法术 */ damage_mod_electricity: new Set(),
        /** @type {Set<DB.spell>} 影响[火焰]伤害的法术 */ damage_mod_fire: new Set(),
        /** @type {Set<DB.spell>} 影响[爆炸]伤害的法术 */ damage_mod_explosion: new Set(),
        /** @type {Set<DB.spell>} 影响[冰冻]伤害的法术 */ damage_mod_ice: new Set(),
        /** @type {Set<DB.spell>} 影响[切割]伤害的法术 */ damage_mod_slice: new Set(),
        /** @type {Set<DB.spell>} 影响[治疗]伤害的法术 */ damage_mod_healing: new Set(),
        /** @type {Set<DB.spell>} 影响[诅咒]伤害的法术 */ damage_mod_curse: new Set(),
        /** @type {Set<DB.spell>} 影响[穿凿]伤害的法术 */ damage_mod_drill: new Set(),
        /** @type {Set<DB.spell>} 影响[神圣]伤害的法术 */ damage_mod_holy: new Set(),

        /** @type {Array<DB.spell>} 生成需要解锁法术 */
        spawnRequiresFlag: new Set()
    };
    /**
     * ⚪️ 空法术
     * @type {DB.spell}
     */
    static $NULL;
    /** @type {Number} 辅助变量 用于记录法术图标索引 */
    static #index = 0;
    static #typeList = ["null", "projectile", "staticProjectile", "modifier", "drawMany", "material", "other", "utility", "passive"];
    //#region 成员...
    /** @type {Number} 图标索引 */ #_index;
    /** @type {String} `★主键` 法术标识符 */ id;
    /** @type {String} 中文译名 */ name;
    /** @type {String} 基础描述 */ description;
    /** @type {String} 额外描述 */ extraDescription;
    /** @type {String} 法术类型 */ type;
    /** @type {Number} 最大使用次数 (-1 无限) */ maxUse;
    /** @type {Boolean} 禁止无限法术 */ neverUnlimited;
    /** @type {Number} 法力消耗 */ manaDrain;
    /** @type {SpawningData} 生成 */ spawningData;
    /** @type {Number} 售价 */ price;
    /** @type {Array<DB.spell.OfferedProjectileData>} 提供投射物 */ offeredProjectiles;
    /** @type {String} 被动效果 */ passiveEffect;
    /** @type {DrawingData} 提供抽取数 */ draw;
    /** @type {Number} 施放延迟 */ fireRateWait;
    /** @type {Number} 暴击率 */ damageCriticalChance;
    /** @type {DamageData} 伤害提升 */ damageMod;
    /** @type {Number} 爆炸半径 */ explosionRadius;
    /** @type {Number} 散射 */ spreadDegrees;
    /** @type {Number} 阵型分布 */ patternDegrees;
    /** @type {Number} 投射物速度 */ speedMultiplier;
    /** @type {Number} 投射物子速度 */ childSpeedMultiplier;
    /** @type {Number} 存在时间 */ lifetimeAdd;
    /** @type {Number} 弹跳次数 */ bounces;
    /** @type {Number} 击退力度 */ recoilKnockback;
    /** @type {Boolean} 启用友伤 */ friendlyFire;
    /** @type {Number} **<未知>** 可能是废弃的削弱后座力的属性 */ dampening;
    /** @type {Number} 抖屏力度 */ screenshake;
    /** @type {Number} 放电能力 */ lightningCount;
    /** @type {String} 材料类型 */ material;
    /** @type {Number} 材料数量 */ materialAmount;
    /** @type {String} 轨迹材料 */ trailMaterial;
    /** @type {Number} 轨迹材料数量 */ trailMaterialAmount;
    /** @type {Number} 受重力影响度 */ gravity;
    /** @type {Number} **<装饰性>** 伤害粒子数量 */ goreParticles;
    /** @type {Number} **<待确定>** 碰撞箱大小 */ ragdollFx;
    /** @type {String} 附加实体 */ extraEntities;
    /** @type {String} 游戏效果实体 */ gameEffectEntities;
    /** @type {Number} 后座力 */ knockbackForce;
    /** @type {Number} 充能时间 */ reloadTime;
    /** @type {Function|null} 法术行为 */ action;
    //#endregion

    constructor(dataArray) {
        /** @type {typeof DB.spell} */
        const _ = this.constructor;
        /** @type {Number} 图标索引 */
        this.#_index = _.#index;
        _.#index++;
        this.id = dataArray[0];
        this.name = dataArray[1];
        this.description = dataArray[2];
        this.extraDescription = dataArray[3];
        this.type = _.#typeList[dataArray[4]];
        this.maxUse = dataArray[5];
        this.neverUnlimited = dataArray[6] === 1;
        this.manaDrain = dataArray[7];
        this.spawningData = new _.spawningData(dataArray[8], dataArray[9], dataArray[40]);
        this.price = dataArray[10];
        this.offeredProjectiles = _.offeredProjectileData.createDatas(dataArray[11]);
        this.passiveEffect = dataArray[12];
        this.draw = new _.drawingData(dataArray[13]);
        this.fireRateWait = dataArray[14];
        this.damageCriticalChance = dataArray[15];
        this.damageMod = Object.freeze(new DamageData(dataArray[16]));
        this.explosionRadius = dataArray[17];
        this.spreadDegrees = dataArray[18];
        this.patternDegrees = dataArray[19];
        this.speedMultiplier = dataArray[20];
        this.childSpeedMultiplier = dataArray[21];
        this.lifetimeAdd = dataArray[22];
        this.bounces = dataArray[23];
        this.knockbackForce = dataArray[24];
        this.friendlyFire = dataArray[25] === 1;
        this.dampening = dataArray[26];
        this.screenshake = dataArray[27];
        this.lightningCount = dataArray[28];
        this.material = dataArray[29];
        this.materialAmount = dataArray[30];
        this.trailMaterial = dataArray[31];
        this.trailMaterialAmount = dataArray[32];
        this.gravity = dataArray[33];
        this.goreParticles = dataArray[34];
        this.ragdollFx = dataArray[35];
        this.extraEntities = dataArray[36];
        this.gameEffectEntities = dataArray[37];
        this.recoilKnockback = dataArray[38];
        this.reloadTime = dataArray[39];
        this.action = dataArray[41];
    }
    /** 获取图标 */
    async getIcon() {
        const canvas = document.createElement("canvas");
        // canvas.ariaLabel BUG! Firefox浏览器下是无法让属性显示在html标签中的
        canvas.setAttribute("aria-label", `法术图标:${this.name}`); // 无障碍标注
        canvas.width = 16;
        canvas.height = 16;
        canvas.getContext("2d").drawImage(await this.constructor.iconImage, (this.#_index - 1) * 16, 0, 16, 16, 0, 0, 16, 16);
        return canvas;
    }

    /**
     * 通过 `法术ID` 获取法术数据
     * @param {"BOMB"|"LIGHT_BULLET"|"LIGHT_BULLET_TRIGGER"|"LIGHT_BULLET_TRIGGER_2"|"LIGHT_BULLET_TIMER"|"BULLET"|"BULLET_TRIGGER"|"BULLET_TIMER"|"HEAVY_BULLET"|"HEAVY_BULLET_TRIGGER"|"HEAVY_BULLET_TIMER"|"AIR_BULLET"|"SLOW_BULLET"|"SLOW_BULLET_TRIGGER"|"SLOW_BULLET_TIMER"|"HOOK"|"BLACK_HOLE"|"BLACK_HOLE_DEATH_TRIGGER"|"BLACK_HOLE_BIG"|"WHITE_HOLE_BIG"|"BLACK_HOLE_GIGA"|"TENTACLE_PORTAL"|"SPITTER"|"SPITTER_TIMER"|"SPITTER_TIER_2"|"SPITTER_TIER_2_TIMER"|"SPITTER_TIER_3"|"SPITTER_TIER_3_TIMER"|"BUBBLESHOT"|"BUBBLESHOT_TRIGGER"|"DISC_BULLET"|"DISC_BULLET_BIG"|"DISC_BULLET_BIGGER"|"BOUNCY_ORB"|"BOUNCY_ORB_TIMER"|"RUBBER_BALL"|"ARROW"|"POLLEN"|"LANCE"|"LANCE_HOLY"|"ROCKET"|"ROCKET_TIER_2"|"ROCKET_TIER_3"|"GRENADE"|"GRENADE_TRIGGER"|"GRENADE_TIER_2"|"GRENADE_TIER_3"|"GRENADE_ANTI"|"GRENADE_LARGE"|"MINE"|"MINE_DEATH_TRIGGER"|"PIPE_BOMB"|"PIPE_BOMB_DEATH_TRIGGER"|"FISH"|"EXPLODING_DEER"|"EXPLODING_DUCKS"|"WORM_SHOT"|"BOMB_DETONATOR"|"LASER"|"MEGALASER"|"LIGHTNING"|"BALL_LIGHTNING"|"LASER_EMITTER"|"LASER_EMITTER_FOUR"|"LASER_EMITTER_CUTTER"|"DIGGER"|"POWERDIGGER"|"CHAINSAW"|"LUMINOUS_DRILL"|"LASER_LUMINOUS_DRILL"|"TENTACLE"|"TENTACLE_TIMER"|"HEAL_BULLET"|"SPIRAL_SHOT"|"MAGIC_SHIELD"|"BIG_MAGIC_SHIELD"|"CHAIN_BOLT"|"FIREBALL"|"METEOR"|"FLAMETHROWER"|"ICEBALL"|"SLIMEBALL"|"DARKFLAME"|"MISSILE"|"FUNKY_SPELL"|"PEBBLE"|"DYNAMITE"|"GLITTER_BOMB"|"BUCKSHOT"|"FREEZING_GAZE"|"GLOWING_BOLT"|"SPORE_POD"|"GLUE_SHOT"|"BOMB_HOLY"|"BOMB_HOLY_GIGA"|"PROPANE_TANK"|"BOMB_CART"|"CURSED_ORB"|"EXPANDING_ORB"|"CRUMBLING_EARTH"|"SUMMON_ROCK"|"SUMMON_EGG"|"SUMMON_HOLLOW_EGG"|"TNTBOX"|"TNTBOX_BIG"|"SWARM_FLY"|"SWARM_FIREBUG"|"SWARM_WASP"|"FRIEND_FLY"|"ACIDSHOT"|"THUNDERBALL"|"FIREBOMB"|"SOILBALL"|"DEATH_CROSS"|"DEATH_CROSS_BIG"|"INFESTATION"|"WALL_HORIZONTAL"|"WALL_VERTICAL"|"WALL_SQUARE"|"TEMPORARY_WALL"|"TEMPORARY_PLATFORM"|"PURPLE_EXPLOSION_FIELD"|"DELAYED_SPELL"|"LONG_DISTANCE_CAST"|"TELEPORT_CAST"|"SUPER_TELEPORT_CAST"|"CASTER_CAST"|"MIST_RADIOACTIVE"|"MIST_ALCOHOL"|"MIST_SLIME"|"MIST_BLOOD"|"CIRCLE_FIRE"|"CIRCLE_ACID"|"CIRCLE_OIL"|"CIRCLE_WATER"|"MATERIAL_WATER"|"MATERIAL_OIL"|"MATERIAL_BLOOD"|"MATERIAL_ACID"|"MATERIAL_CEMENT"|"TELEPORT_PROJECTILE"|"TELEPORT_PROJECTILE_SHORT"|"TELEPORT_PROJECTILE_STATIC"|"SWAPPER_PROJECTILE"|"TELEPORT_PROJECTILE_CLOSER"|"NUKE"|"NUKE_GIGA"|"FIREWORK"|"SUMMON_WANDGHOST"|"TOUCH_GOLD"|"TOUCH_WATER"|"TOUCH_OIL"|"TOUCH_ALCOHOL"|"TOUCH_BLOOD"|"TOUCH_SMOKE"|"DESTRUCTION"|"BURST_2"|"BURST_3"|"BURST_4"|"BURST_8"|"BURST_X"|"SCATTER_2"|"SCATTER_3"|"SCATTER_4"|"I_SHAPE"|"Y_SHAPE"|"T_SHAPE"|"W_SHAPE"|"CIRCLE_SHAPE"|"PENTAGRAM_SHAPE"|"I_SHOT"|"Y_SHOT"|"T_SHOT"|"W_SHOT"|"QUAD_SHOT"|"PENTA_SHOT"|"HEXA_SHOT"|"SPREAD_REDUCE"|"HEAVY_SPREAD"|"RECHARGE"|"LIFETIME"|"LIFETIME_DOWN"|"NOLLA"|"SLOW_BUT_STEADY"|"EXPLOSION_REMOVE"|"EXPLOSION_TINY"|"LASER_EMITTER_WIDER"|"MANA_REDUCE"|"BLOOD_MAGIC"|"MONEY_MAGIC"|"BLOOD_TO_POWER"|"DUPLICATE"|"QUANTUM_SPLIT"|"GRAVITY"|"GRAVITY_ANTI"|"SINEWAVE"|"CHAOTIC_ARC"|"PINGPONG_PATH"|"AVOIDING_ARC"|"FLOATING_ARC"|"FLY_DOWNWARDS"|"FLY_UPWARDS"|"HORIZONTAL_ARC"|"LINE_ARC"|"ORBIT_SHOT"|"SPIRALING_SHOT"|"PHASING_ARC"|"TRUE_ORBIT"|"BOUNCE"|"REMOVE_BOUNCE"|"HOMING"|"ANTI_HOMING"|"HOMING_WAND"|"HOMING_SHORT"|"HOMING_ROTATE"|"HOMING_SHOOTER"|"AUTOAIM"|"HOMING_ACCELERATING"|"HOMING_CURSOR"|"HOMING_AREA"|"PIERCING_SHOT"|"CLIPPING_SHOT"|"DAMAGE"|"DAMAGE_RANDOM"|"BLOODLUST"|"DAMAGE_FOREVER"|"CRITICAL_HIT"|"AREA_DAMAGE"|"SPELLS_TO_POWER"|"ESSENCE_TO_POWER"|"ZERO_DAMAGE"|"HEAVY_SHOT"|"LIGHT_SHOT"|"KNOCKBACK"|"RECOIL"|"RECOIL_DAMPER"|"SPEED"|"ACCELERATING_SHOT"|"DECELERATING_SHOT"|"EXPLOSIVE_PROJECTILE"|"WATER_TO_POISON"|"BLOOD_TO_ACID"|"LAVA_TO_BLOOD"|"LIQUID_TO_EXPLOSION"|"TOXIC_TO_ACID"|"STATIC_TO_SAND"|"TRANSMUTATION"|"RANDOM_EXPLOSION"|"NECROMANCY"|"LIGHT"|"EXPLOSION"|"EXPLOSION_LIGHT"|"FIRE_BLAST"|"POISON_BLAST"|"ALCOHOL_BLAST"|"THUNDER_BLAST"|"BERSERK_FIELD"|"POLYMORPH_FIELD"|"CHAOS_POLYMORPH_FIELD"|"ELECTROCUTION_FIELD"|"FREEZE_FIELD"|"REGENERATION_FIELD"|"TELEPORTATION_FIELD"|"LEVITATION_FIELD"|"SHIELD_FIELD"|"PROJECTILE_TRANSMUTATION_FIELD"|"PROJECTILE_THUNDER_FIELD"|"PROJECTILE_GRAVITY_FIELD"|"VACUUM_POWDER"|"VACUUM_LIQUID"|"VACUUM_ENTITIES"|"SEA_LAVA"|"SEA_ALCOHOL"|"SEA_OIL"|"SEA_WATER"|"SEA_SWAMP"|"SEA_ACID"|"SEA_ACID_GAS"|"CLOUD_WATER"|"CLOUD_OIL"|"CLOUD_BLOOD"|"CLOUD_ACID"|"CLOUD_THUNDER"|"ELECTRIC_CHARGE"|"MATTER_EATER"|"FREEZE"|"HITFX_BURNING_CRITICAL_HIT"|"HITFX_CRITICAL_WATER"|"HITFX_CRITICAL_OIL"|"HITFX_CRITICAL_BLOOD"|"HITFX_TOXIC_CHARM"|"HITFX_EXPLOSION_SLIME"|"HITFX_EXPLOSION_SLIME_GIGA"|"HITFX_EXPLOSION_ALCOHOL"|"HITFX_EXPLOSION_ALCOHOL_GIGA"|"HITFX_PETRIFY"|"ROCKET_DOWNWARDS"|"ROCKET_OCTAGON"|"FIZZLE"|"BOUNCE_EXPLOSION"|"BOUNCE_SPARK"|"BOUNCE_LASER"|"BOUNCE_LASER_EMITTER"|"BOUNCE_LARPA"|"BOUNCE_SMALL_EXPLOSION"|"BOUNCE_LIGHTNING"|"BOUNCE_HOLE"|"FIREBALL_RAY"|"LIGHTNING_RAY"|"TENTACLE_RAY"|"LASER_EMITTER_RAY"|"FIREBALL_RAY_LINE"|"FIREBALL_RAY_ENEMY"|"LIGHTNING_RAY_ENEMY"|"TENTACLE_RAY_ENEMY"|"GRAVITY_FIELD_ENEMY"|"CURSE"|"CURSE_WITHER_PROJECTILE"|"CURSE_WITHER_EXPLOSION"|"CURSE_WITHER_MELEE"|"CURSE_WITHER_ELECTRICITY"|"ORBIT_DISCS"|"ORBIT_FIREBALLS"|"ORBIT_NUKES"|"ORBIT_LASERS"|"ORBIT_LARPA"|"CHAIN_SHOT"|"ARC_ELECTRIC"|"ARC_FIRE"|"ARC_GUNPOWDER"|"ARC_POISON"|"CRUMBLING_EARTH_PROJECTILE"|"X_RAY"|"UNSTABLE_GUNPOWDER"|"ACID_TRAIL"|"POISON_TRAIL"|"OIL_TRAIL"|"WATER_TRAIL"|"GUNPOWDER_TRAIL"|"FIRE_TRAIL"|"BURN_TRAIL"|"TORCH"|"TORCH_ELECTRIC"|"ENERGY_SHIELD"|"ENERGY_SHIELD_SECTOR"|"ENERGY_SHIELD_SHOT"|"TINY_GHOST"|"OCARINA_A"|"OCARINA_B"|"OCARINA_C"|"OCARINA_D"|"OCARINA_E"|"OCARINA_F"|"OCARINA_GSHARP"|"OCARINA_A2"|"KANTELE_A"|"KANTELE_D"|"KANTELE_DIS"|"KANTELE_E"|"KANTELE_G"|"RANDOM_SPELL"|"RANDOM_PROJECTILE"|"RANDOM_MODIFIER"|"RANDOM_STATIC_PROJECTILE"|"DRAW_RANDOM"|"DRAW_RANDOM_X3"|"DRAW_3_RANDOM"|"ALL_NUKES"|"ALL_DISCS"|"ALL_ROCKETS"|"ALL_DEATHCROSSES"|"ALL_BLACKHOLES"|"ALL_ACID"|"ALL_SPELLS"|"SUMMON_PORTAL"|"ADD_TRIGGER"|"ADD_TIMER"|"ADD_DEATH_TRIGGER"|"LARPA_CHAOS"|"LARPA_DOWNWARDS"|"LARPA_UPWARDS"|"LARPA_CHAOS_2"|"LARPA_DEATH"|"ALPHA"|"GAMMA"|"TAU"|"OMEGA"|"MU"|"PHI"|"SIGMA"|"ZETA"|"DIVIDE_2"|"DIVIDE_3"|"DIVIDE_4"|"DIVIDE_10"|"METEOR_RAIN"|"WORM_RAIN"|"RESET"|"IF_ENEMY"|"IF_PROJECTILE"|"IF_HP"|"IF_HALF"|"IF_END"|"IF_ELSE"|"COLOUR_RED"|"COLOUR_ORANGE"|"COLOUR_GREEN"|"COLOUR_YELLOW"|"COLOUR_PURPLE"|"COLOUR_BLUE"|"COLOUR_RAINBOW"|"COLOUR_INVIS"|"RAINBOW_TRAIL"} id 法术ID
     * @returns {DB.spell} 法术数据
     */
    static queryById = id => {
        const result = this.data.id_map.get(id);
        if (result) return result;
        else return this.$NULL;
    };
    /**
     * 通过 `法术名称` 获取法术数据
     * @param {"炸弹"|"火花弹"|"触发火花弹"|"双重触发火花弹"|"定时火花弹"|"魔法箭"|"触发魔法箭"|"定时魔法箭"|"魔法弹"|"触发魔法弹"|"定时魔法弹"|"强气流"|"能量球"|"触发能量球"|"定时能量球"|"钩爪"|"黑洞"|"失效触发黑洞"|"巨型黑洞"|"巨型白洞"|"终极黑洞"|"怪异传送门"|"分裂弹"|"定时分裂弹"|"大型分裂弹"|"定时大型分裂弹"|"巨型分裂弹"|"定时巨型分裂弹"|"泡泡火花"|"触发泡泡火花"|"小锯片"|"大型锯片"|"终极锯片"|"能量球体"|"定时能量球体"|"橡皮绿豆"|"箭矢"|"孢子球"|"闪耀长枪"|"神圣长枪"|"魔法飞弹"|"大型魔法飞弹"|"巨型魔法飞弹"|"火焰弹"|"触发火焰弹"|"大型火焰弹"|"巨型火焰弹"|"怪异火焰弹"|"坠落火焰弹"|"不稳晶体"|"失效触发不稳晶体"|"休眠晶体"|"失效触发休眠晶体"|"召唤鱼"|"诱饵鹿"|"鸭群"|"蠕虫发射器"|"炸药引爆器"|"汇聚之光"|"高能汇聚之光"|"雷击"|"球状闪电"|"电浆束"|"电浆束十字"|"电浆切割器"|"挖掘魔弹"|"挖掘爆破"|"链锯"|"光明穿凿"|"定时光明穿凿"|"触手"|"定时触手"|"治疗魔弹"|"螺旋魔弹"|"魔法护卫"|"大型魔法护卫"|"连锁魔弹"|"火球"|"陨石"|"火焰喷射器"|"冰球"|"粘液球"|"黑焰"|"导弹"|"？？？"|"岩石精灵"|"炸药"|"闪烁炸弹"|"三联魔弹"|"冰冷凝视"|"聚爆光束"|"多刺孢子荚"|"胶球"|"神圣炸弹"|"巨型神圣炸弹"|"丙烷罐"|"炸弹矿车"|"诅咒之球"|"扩张之球"|"召唤地震"|"岩石"|"蛋"|"空心蛋"|"炸药箱"|"大炸药箱"|"召唤苍蝇群"|"召唤萤火虫群"|"召唤黄蜂群"|"召唤苍蝇伙伴"|"酸液球"|"雷霆放射"|"微型火焰弹"|"一把泥土"|"死亡十字"|"巨型死亡十字"|"侵扰"|"水平粒子屏障"|"垂直粒子屏障"|"方形粒子屏障"|"召唤墙壁"|"召唤平台"|"盛大场面"|"延迟施放"|"远距离施放"|"传送施放"|"跳跃施放"|"本体施法"|"毒雾"|"酒雾"|"粘液雾"|"血雾"|"烈火之环"|"酸液之环"|"油液之环"|"清水之环"|"水滴"|"油滴"|"血滴"|"酸滴"|"水泥"|"传送魔弹"|"小传送魔弹"|"返回传送魔弹"|"交换传送魔弹"|"抓取传送魔弹"|"核弹"|"巨型核弹"|"烟花"|"召唤魔杖灵"|"黄金之触"|"清水之触"|"油液之触"|"烈酒之触"|"鲜血之触"|"烟雾之触"|"毁灭"|"二重施放"|"三重施放"|"四重施放"|"八重施放"|"穷尽施放"|"二重散射施放"|"三重散射施放"|"四重散射施放"|"阵型 - 前后"|"阵型 - 分叉"|"阵型 - 半圆"|"阵型 - 三叉"|"阵型 - 六边形"|"阵型 - 五边形"|"阵型拉帕 - 前后"|"阵型拉帕 - 分叉"|"阵型拉帕 - 半圆"|"阵型拉帕 - 三叉"|"阵型拉帕 - 十字"|"阵型拉帕 - 五边形"|"阵型拉帕 - 六边形"|"降低散射"|"强烈散射"|"缩减充能时间"|"延长存在时间"|"缩减存在时间"|"零时"|"缓慢但坚定"|"移除爆炸"|"聚爆"|"电浆束增强器"|"提升法力"|"血液魔法"|"黄金转伤害"|"血液转伤害"|"法术复制"|"量子分割"|"重力"|"反重力"|"蛇形路径"|"混沌路径"|"乒乓路径"|"规避路径"|"悬浮"|"向下飞行"|"向上飞行"|"水平路径"|"线性路径"|"圆环路径"|"螺旋路径"|"相位"|"自我环绕"|"弹跳"|"移除弹跳"|"追踪"|"避让"|"追踪法杖"|"短距离追踪"|"转向敌人"|"回旋镖"|"自动瞄准"|"加速追踪"|"瞄准路径"|"传送追踪"|"穿刺"|"穿墙"|"伤害增强"|"随机伤害"|"嗜血"|"法力转伤害"|"暴击增强"|"伤害领域"|"法术转伤害"|"精华转伤害"|"移除伤害"|"沉重一击"|"轻盈一击"|"击退"|"后座力"|"后座阻尼器"|"加速"|"逐渐加速"|"逐渐减速"|"易爆"|"化水为毒"|"溶血为酸"|"熔岩化血"|"液体引爆"|"毒液酸化"|"化地为沙"|"混沌转化"|"混沌魔法"|"死灵术"|"光"|"爆炸"|"魔法爆炸"|"火焰爆炸"|"毒液爆炸"|"烈酒爆炸"|"雷霆爆炸"|"激情之环"|"变形之环"|"不稳变化之环"|"雷电之环"|"静止之环"|"活力之环"|"位移之环"|"浮力之环"|"遮蔽之环"|"投射物无害化领域"|"投射物雷电化领域"|"投射物引力领域"|"粉末真空场"|"液体真空场"|"实体真空场"|"岩浆之海"|"酒之海"|"油之海"|"水之海"|"沼泽之海"|"酸液之海"|"可燃气体之海"|"雨云"|"油云"|"血云"|"酸云"|"雷云"|"电荷"|"物质吞噬者"|"冰冻"|"燃烧暴击"|"潮湿暴击"|"油污暴击"|"染血暴击"|"毒液魅惑"|"粘液爆炸"|"粘液巨型爆炸"|"醉酒爆炸"|"醉酒巨型爆炸"|"石化"|"下方向集束魔弹"|"八角形集束魔弹"|"闪灭"|"易爆弹跳"|"泡泡弹跳"|"激光弹跳"|"电浆束弹跳"|"拉帕弹跳"|"闪烁弹跳"|"雷电弹跳"|"吞噬弹跳"|"火球发射器"|"闪电发射器"|"触手怪"|"电浆束发射器"|"双向火球发射器"|"专属火球发射器"|"专属闪电发射器"|"专属触手怪"|"专属重力场"|"猛毒诅咒"|"虚弱诅咒 - 投射物"|"虚弱诅咒 - 爆炸"|"虚弱诅咒 - 近战"|"虚弱诅咒 - 雷电"|"锯片环绕"|"火球环绕"|"核弹环绕"|"电浆束环绕"|"环绕拉帕"|"连锁"|"电弧"|"火焰弧"|"火药弧"|"毒液弧"|"地震"|"全知之眼"|"爆竹"|"酸液轨迹"|"毒液轨迹"|"油液轨迹"|"清水轨迹"|"火药轨迹"|"火焰轨迹"|"燃烧"|"火把"|"电子火把"|"能量盾"|"半圆能量盾"|"投射物能量盾"|"迷你幽灵"|"陶笛 - A"|"陶笛 - B"|"陶笛 - C"|"陶笛 - D"|"陶笛 - E"|"陶笛 - F"|"陶笛 - G#"|"陶笛 - A"|"康特勒琴 - A"|"康特勒琴 - D"|"康特勒琴 - DIS"|"康特勒琴 - E"|"康特勒琴 - G"|"随机法术"|"随机投射物"|"随机修正"|"随机静态投射物"|"复制随机法术"|"复制随机法术三次"|"复制三个随机法术"|"核弹置换术"|"大型锯片置换术"|"魔法飞弹置换术"|"死亡十字置换术"|"黑洞置换术"|"酸液置换术"|"万物终结"|"召唤传送门"|"追加触发"|"追加定时触发"|"追加失效触发"|"混沌拉帕"|"下方向拉帕"|"上方向拉帕"|"轨迹拉帕"|"爆炸拉帕"|"阿尔法"|"伽马"|"陶"|"欧米伽"|"谬"|"斐"|"西格玛"|"泽塔"|"一分为二"|"一分为三"|"一分为四"|"一分为十"|"陨石雨"|"蠕虫雨"|"魔杖刷新"|"条件 - 敌人数量"|"条件 - 投射物数量"|"条件 - 低生命值"|"条件 - 每隔两次"|"条件 - 结束"|"条件 - 否则"|"红色闪光"|"橙色闪光"|"绿色闪光"|"黄色闪光"|"紫色闪光"|"蓝色闪光"|"彩虹闪光"|"隐形法术"|"彩虹轨迹"} name 法术名称
     * @returns {DB.spell} 法术数据
     */
    static queryByName = name => {
        const result = this.data.name_map.get(name);
        if (result) return result;
        else return this.$NULL;
    };
    /**
     * 通过 `表达式` 获取法术数据
     * @param {"#all"|"#type_projectile"|"#type_staticProjectile"|"#type_modifier"|"#type_drawMany"|"#type_material"|"#type_other"|"#type_utility"|"#type_passive"|"#level_0"|"#level_1"|"#level_2"|"#level_3"|"#level_4"|"#level_5"|"#level_6"|"#level_7"|"#level_10"|"#draw"|"#draw_common"|"#draw_hit"|"#draw_timer"|"#draw_death"|"#lifetime_mod"|"#lifetime_up"|"#lifetime_down"|"#mana_0"|"#mana_drainlowly"|"#mana_increase"|"#speed_mod"|"#damage_mod"|"#damage_mod_projectile"|"#damage_mod_melee"|"#damage_mod_electricity"|"#damage_mod_fire"|"#damage_mod_explosion"|"#damage_mod_ice"|"#damage_mod_slice"|"#damage_mod_healing"|"#damage_mod_curse"|"#damage_mod_drill"|"#damage_mod_holy"} expression 查询表达式
     * @returns {Array<DB.spell>} 法术数据
     */
    static queryByExpression = (() => {
        const consoleError = (info, index, obj) => {
            const e = new SyntaxError(`${info} index:${index}`);
            console.error(e, obj);
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
        const Token = utilities.parse.token;
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
         * @param {{type: String, data: String, data1: String|undefined, data2: String|undefined}} expression
         * @returns {Set<DB.sepll>}
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
                            /** @type {Set<DB.spell>} */
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
                            const all = this.data.all;
                            const a2 = Array.from(getSpellDatas(expression.data2));
                            const result = new Set();
                            const l = a2.length;
                            for (let i = 0; i < l; i++) if (!all.has(a2[i])) result.add(a2[i]);
                            return result;
                        }
                    }
            }
        };
        return /** @param {String} expressionStr */ expressionStr => {
            console.groupCollapsed("法术查询表达式解析: %c`%s`", "color:#25AFF3", expressionStr);
            let currentToken = undefined;
            console.groupCollapsed("🏷️ Tokenization");
            //#region 令牌化 Tokenization
            const tokens = [];
            Token.logData.init();
            const EL = expressionStr.length;
            for (let i = 0; i < EL; i++) {
                const char = expressionStr[i];
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
                                let und = new Token(tokenEnum.UND, i);
                                und.data = char;
                                consoleError(`不合法的字符: "${char}"`, i, und);
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
            /** @type {SpellGroup|undefined} 当前表达式 */
            let currentExpression = undefined;
            /** @type {SpellGroup|undefined} 根表达式 */
            let rootExpression = undefined;
            for (let j = 0; j < TL; j++) {
                currentToken = tokens[j];
                const i = currentToken.index;
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
                                consoleError(`缺少运算符连接`, i, currentExpression);
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
                                consoleError(`缺少运算符连接`, i, currentExpression);
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
                                consoleError(`缺少运算符连接`, i, currentExpression);
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
                                consoleError(`${currentToken.data} 缺少法术标签或法术ID连接`, i, currentExpression);
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
                                            consoleError(`不成对的括号`, i, currentExpression);
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
                            consoleError(`不成对的括号`, i, currentExpression);
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
                                consoleError("! 不可以用于连接两个法术标签或法术ID", i, currentExpression);
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
                                consoleError("已存在逻辑运算符", i, currentExpression);
                                return [];
                            }
                        } else {
                            consoleError("缺少被连接的法术标签或ID", i, currentExpression);
                            return [];
                        }
                        break;
                    case "AND":
                        if (currentExpression) {
                            if (currentExpression.dataState === 1) {
                                currentExpression.dataState = 2;
                                currentExpression.operator = "AND";
                            } else if (currentExpression.dataState === 2) {
                                consoleError("已存在逻辑运算符", i, currentExpression);
                                return [];
                            }
                        } else {
                            consoleError("缺少被连接的法术标签或ID", i, currentExpression);
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
                consoleError("缺少连接的法术标签或ID", currentToken.index, currentToken);
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
            return Array.from(result);
        };
    })();

    /** 初始化数据库 */
    static init() {
        this.$NULL = Object.freeze(new this(["_NULL", "空白", "NULL", "额外描述", 0, -1, 0, 0, "", "", 0, "", "", "", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, "", 0, "", 0, 0, 0, 0, "", "", 0, 0, "", ""]));
        // data : 嵌入法术数据
        /** @type {Array} */
        const datas = "spellData.jsonc";
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

            if (data.lifetimeAdd) {
                storage.lifetime_mod.add(data);
                if (data.lifetimeAdd > 0) storage.lifetime_up.add(data);
                else storage.lifetime_down.add(data);
            }

            if (data.manaDrain < 5) {
                if (data.manaDrain > 0) storage.mana_drainlowly.add(data);
                else if (data.manaDrain === 0) storage.mana_0.add(data);
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
