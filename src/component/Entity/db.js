/** 实体数据 */
const EntityData = class {
    static OfferedEntityData = class {
        constructor(entityId, num_min, num_max) {
            /** @type {EntityData} 实体数据 */
            this.entityData = EntityData.queryById(entityId);
            /** @type {Number} 最小数量 */
            this.num_min = num_min;
            /** @type {Number} 最大数量 */
            this.num_max = num_max;
        }
        /**
         * 获取提供实体数据数组
         * @param {String} dataStr
         * @returns {Array<OfferedProjectileData>}
         */
        static createDatas = dataStr => {
            const result = [];
            if (dataStr) {
                let entityId = [];
                let entityNum_min = [];
                let entityNum_max = [];
                let current = entityId;
                let projectileNum_min_number = 0;
                let projectileNum_max_number = 0;
                for (let i = 0; i < dataStr.length; i++) {
                    const char = dataStr[i];
                    switch (char) {
                        case ":":
                            current = entityNum_min;
                            break;
                        case "~" /* 不定数量实体 */:
                            current = entityNum_max;
                            break;
                        case " " /* 切换至下种实体 */:
                            if (entityNum_min.length > 0) projectileNum_min_number = parseInt(entityNum_min.join(""));
                            else projectileNum_min_number = 1;
                            if (entityNum_max.length > 0) projectileNum_max_number = parseInt(entityNum_max.join(""));
                            else projectileNum_max_number = projectileNum_min_number;
                            result.push(Object.freeze(new this(entityId.join(""), projectileNum_min_number, projectileNum_max_number)));
                            entityId = [];
                            entityNum_min = [];
                            entityNum_max = [];
                            current = entityId;
                            break;
                        default:
                            current.push(char);
                    }
                }
                if (entityNum_min.length > 0) projectileNum_min_number = parseInt(entityNum_min.join(""));
                else projectileNum_min_number = 1;
                if (entityNum_max.length > 0) projectileNum_max_number = parseInt(entityNum_max.join(""));
                else projectileNum_max_number = projectileNum_min_number;
                result.push(Object.freeze(new this(entityId.join(""), projectileNum_min_number, projectileNum_max_number)));
            }
            return result;
        };
    };
    /** 投射物组件 */
    static ProjectileComponent = class {
        constructor(offeredDamage, explosionRadius, spreadDegrees, lifetime_base, lifetime_fluctuation, speed_min, speed_max, bounces, knockbackForce, friendlyFire, friendlyExplode, speedDiffDamage, physicsImpulseCoeff, materialGenerate, canExplode, damageFrequency, offeredEntities) {
            /** @type {DamageData} 提供伤害 */ this.offeredDamage = new DamageData(offeredDamage);
            /** @type {Number} 爆炸半径 */ this.explosionRadius = explosionRadius;
            /** @type {Number} 散射角度 */ this.spreadDegrees = spreadDegrees;
            /** @type {NumRange} 存在时间 */ this.lifetime = { base: lifetime_base, fluctuation: lifetime_fluctuation };
            /** @type {NumRange} 速度 */ this.speed = { min: speed_min, max: speed_max };
            /** @type {Number} 弹跳次数 */ this.bounces = bounces;
            /** @type {Number} 击退力度 */ this.knockbackForce = knockbackForce;
            /** @type {Boolean} 命中友军 */ this.friendlyFire = friendlyFire;
            /** @type {Boolean} 炸伤友军 */ this.friendlyExplode = friendlyExplode;
            /** @type {Boolean} 具有速度差伤害 */ this.speedDiffDamage = speedDiffDamage;
            /** @type {Number} 物理推力系数 */ this.physicsImpulseCoeff = physicsImpulseCoeff;
            /** @type {String} 材料生成 */ this.materialGenerate = materialGenerate;
            /** @type {Boolean} 能否爆炸 */ this.canExplode = canExplode;
            /** @type {Number} 伤害频率 */ this.damageFrequency = damageFrequency;
            /** @type {Array<EntityData.offeredEntityData>} 提供投射物 */ this.offeredEntities = EntityData.OfferedEntityData.createDatas(offeredEntities);
        }
    };
    /** 伤害模型组件 */
    static DamageModelComponent = class {
        constructor(maxHp, airInLungsMax, damageMaterialList, bloodMaterial, corpseMaterial, damageMultipler) {
            /** @type {Number} 最大生命 */ this.maxHp = maxHp;
            /** @type {Number} 氧气储备 */ this.airInLungsMax = airInLungsMax; /* -1 代表无需呼吸 */
            /** @type {Array<String>} 有害材料 */ this.damageMaterialList = damageMaterialList;
            const bloodMaterialList = bloodMaterial.split(" ");
            /** @type {String} 血液材料 */ this.bloodMaterial = { hurt: bloodMaterialList[0], die: bloodMaterialList[1] ?? "" };
            /** @type {String} 尸体材料 */ this.corpseMaterial = corpseMaterial;
            /** @type {DamageData} 承伤倍率 */ this.damageMultipler = new DamageData(damageMultipler, 1);
        }
    };
    /** 动物行为组件 */
    static AnimalAIComponent = class {};

    static $NULL;
    static data = {
        id_map: new Map(),
        all: [],
        projectile: {
            usedBySpell: new Map()
        },
        /** @type {Array<db_entity>} 被法术使用的投射物 */ projectile_spell: [],
        /** @type {Array<db_entity>} 被敌人使用的投射物 */ projectile_enemy: [],
        /** @type {Array<db_entity>} 所有的敌人 */ enemy_all: [],
        /** @type {Array<db_entity>} 在进展中显示的敌人 */ enemy_progress: []
    };

    /** @param {Array} datas */
    constructor(datas) {
        /** @type {String} `★主键` 实体标识符 */ this.id = datas[0];
        /** @type {String} 名称 */ this.name = datas[1];
        let i = 2;
        while (i < datas.length) {
            if (datas[i] === "PC") {
                /** @type {EntityData.ProjectileComponent} 投射物组件 */
                this.projectileComponent = Object.freeze(new EntityData.ProjectileComponent(datas[i + 1], datas[i + 2], datas[i + 3], datas[i + 4], datas[i + 5], datas[i + 6], datas[i + 7], datas[i + 8], datas[i + 9], datas[i + 10], datas[i + 11], datas[i + 12], datas[i + 13], datas[i + 14], datas[i + 15], datas[i + 16], datas[i + 17]));
                i += 17;
            } else if (datas[i] === "DMC") {
                /** @type {EntityData.DamageModelComponent} 伤害模型组件 */
                this.damageModelComponent = Object.freeze(new EntityData.DamageModelComponent(datas[i + 1], datas[i + 2], datas[i + 3], datas[i + 4], datas[i + 5], datas[i + 6]));
                i += 6;
            }
            i++;
        }
        /** @type {db_entity.AnimalAIComponent} 动物行为组件 */ this.animalAIComponent = {};
    }
    /**
     * 通过id查询唯一投射物
     * @param {String} id 实体ID
     * @returns {db_entity} 实体数据对象
     */
    static queryById = id => {
        const data = this.data.id_map.get(id);
        if (data) return data;
        else return this.$NULL;
    };
    static init() {
        this.$NULL = new this(["_NULL", "空白"]);
        /** #data: [实体数据](data.js) @type {Array} */
        const datas = embed(`#data.js`);
        for (let i = 0; i < datas.length; i++) {
            const data = Object.freeze(new this(datas[i]));
            this.data.projectile.usedBySpell.set(data.id, data);
            this.data.id_map.set(data.id, data);
        }
    }
};
