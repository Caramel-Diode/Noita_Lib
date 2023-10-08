/** [实体数据库](entity.js) */
DB.entity = class {
    static offeredEntityData = class {
        /** @type {DB.entity} 实体数据 */ entityData;
        /** @type {Number} 最小数量 */ num_min;
        /** @type {Number} 最大数量 */ num_max;
        constructor(entityId, num_min, num_max) {
            this.entityData = DB.entity.queryById(entityId);
            this.num_min = num_min;
            this.num_max = num_max;
        };
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
                        case "~"/* 不定数量实体 */:
                            current = entityNum_max;
                            break;
                        case " "/* 切换至下种实体 */:
                            if (entityNum_min.length > 0) projectileNum_min_number = parseInt(entityNum_min.join(""));
                            else projectileNum_min_number = 1;
                            if (entityNum_max.length > 0) projectileNum_max_number = parseInt(entityNum_max.join(""));
                            else projectileNum_max_number = projectileNum_min_number;
                            result.push(Object.freeze(new this(
                                entityId.join(""),
                                projectileNum_min_number,
                                projectileNum_max_number,
                            )));
                            entityId = [];
                            entityNum_min = [];
                            entityNum_max = [];
                            current = entityId;
                            break;
                        default: current.push(char);
                    }
                }
                if (entityNum_min.length > 0) projectileNum_min_number = parseInt(entityNum_min.join(""));
                else projectileNum_min_number = 1;
                if (entityNum_max.length > 0) projectileNum_max_number = parseInt(entityNum_max.join(""));
                else projectileNum_max_number = projectileNum_min_number;
                result.push(Object.freeze(new this(
                    entityId.join(""),
                    projectileNum_min_number,
                    projectileNum_max_number,
                )));
            }
            return result;
        };
    };
    /** 投射物组件 */
    static projectileComponent = class {
        /** @type {DamageData} 提供伤害 */offeredDamage;
        /** @type {Number} 爆炸半径 */explosionRadius;
        /** @type {Number} 散射角度 */spreadDegrees;
        /** @type {Number} 存在时间 */lifetime;
        /** @type {Number} 存在时间波动 */fluctuatingLifetime;
        /** @type {Number} 最小速度 */minSpeed;
        /** @type {Number} 最大速度 */maxSpeed;
        /** @type {Number} 弹跳次数 */bounces;
        /** @type {Number} 击退力度 */knockbackForce;
        /** @type {Boolean} 命中友军 */friendlyFire;
        /** @type {Boolean} 炸伤友军 */friendlyExplode;
        /** @type {Boolean} 具有速度差伤害 */speedDiffDamage;
        /** @type {Number} 物理推力系数 */physicsImpulseCoeff;
        /** @type {String} 材料生成 */materialGenerate;
        /** @type {Boolean} 能否爆炸 */canExplode;
        /** @type {Number} 伤害频率 */damageFrequency;
        /** @type {DB.entity.offeredEntityData} 提供投射物 */offeredEntities;

        constructor(
            offeredDamage,
            explosionRadius,
            spreadDegrees,
            lifetime,
            fluctuatingLifetime,
            minSpeed,
            maxSpeed,
            bounces,
            knockbackForce,
            friendlyFire,
            friendlyExplode,
            speedDiffDamage,
            physicsImpulseCoeff,
            materialGenerate,
            canExplode,
            damageFrequency,
            offeredEntities
        ) {
            this.offeredDamage = new DamageData(offeredDamage);
            this.explosionRadius = explosionRadius;
            this.spreadDegrees = spreadDegrees;
            this.lifetime = lifetime;
            this.fluctuatingLifetime = fluctuatingLifetime;
            this.minSpeed = minSpeed;
            this.maxSpeed = maxSpeed;
            this.bounces = bounces;
            this.knockbackForce = knockbackForce;
            this.friendlyFire = friendlyFire;
            this.friendlyExplode = friendlyExplode;
            this.speedDiffDamage = speedDiffDamage;
            this.physicsImpulseCoeff = physicsImpulseCoeff;
            this.materialGenerate = materialGenerate;
            this.canExplode = canExplode;
            this.damageFrequency = damageFrequency;
            this.offeredEntities = DB.entity.offeredEntityData.createDatas(offeredEntities);
        }
    };
    /** 伤害模型组件 */
    static damageModelComponent = class {
        /** @type {Number} 最大生命 */maxHp;
        /** @type {Number} 氧气储备 */airInLungsMax;/* -1 代表无需呼吸 */
        /** @type {Array<String>} 有害材料 */damageMaterialList;
        /** @type {String} 血液材料[受伤] */bloodMaterial_hurt;/* blood_fading */
        /** @type {String} 血液材料[死亡] */bloodMaterial_die;
        /** @type {String} 尸体材料 */corpseMaterial;/* meat */
        /** @type {DamageData} 承伤倍率 */damageMultipler;
        constructor(
            maxHp,
            airInLungsMax,
            damageMaterialList,
            bloodMaterial,
            corpseMaterial,
            damageMultipler
        ) {
            this.maxHp = maxHp;
            this.airInLungsMax = airInLungsMax;
            this.damageMaterialList = damageMaterialList;
            const bloodMaterialList = bloodMaterial.split(" ");
            this.bloodMaterial_hurt = bloodMaterialList[0];
            this.bloodMaterial_die = bloodMaterialList[1] ?? "";
            this.corpseMaterial = corpseMaterial;
            this.damageMultipler = new DamageData(damageMultipler, 1);
        }
    };
    /** 动物行为组件 */
    static animalAIComponent = class {

    };

    static $NULL;
    static data = {
        id_map: new Map(),
        all: [],
        projectile: {
            usedBySpell: new Map()
        },
        /** @type {Array<EntityData>} 被法术使用的投射物 */
        projectile_spell: [],
        /** @type {Array<EntityData>} 被敌人使用的投射物 */
        projectile_enemy: [],
        /** @type {Array<EntityData>} 所有的敌人 */
        enemy_all: [],
        /** @type {Array<EntityData>} 在进展中显示的敌人 */
        enemy_progress: [],
    };
    /** @type {String} `★主键` 实体标识符 */id;
    /** @type {String} 名称 */name;
    /** @type {DB.entity.projectileComponent} 投射物组件 */projectileComponent;
    /** @type {DB.entity.damageModelComponent} 伤害模型组件 */damageModelComponent;
    /** @type {DB.entity.animalAIComponent} 伤害模型组件 */animalAIComponent;

    constructor(dataArray) {
        /** @type {typeof DB.entity} */
        const _ = this.constructor;
        this.id = dataArray[0];
        this.name = dataArray[1];
        let i = 2;
        while (i < dataArray.length) {
            if (dataArray[i] === "PC") {
                this.projectileComponent = Object.freeze(new _.projectileComponent(
                    dataArray[i + 1],
                    dataArray[i + 2],
                    dataArray[i + 3],
                    dataArray[i + 4],
                    dataArray[i + 5],
                    dataArray[i + 6],
                    dataArray[i + 7],
                    dataArray[i + 8],
                    dataArray[i + 9],
                    dataArray[i + 10],
                    dataArray[i + 11],
                    dataArray[i + 12],
                    dataArray[i + 13],
                    dataArray[i + 14],
                    dataArray[i + 15],
                    dataArray[i + 16],
                    dataArray[i + 17]
                ));
                i += 17;
            }
            else if (dataArray[i] === "DMC") {
                console.log(dataArray[i + 7]);
                this.damageModelComponent = Object.freeze(new _.damageModelComponent(
                    dataArray[i + 1],
                    dataArray[i + 2],
                    dataArray[i + 3],
                    dataArray[i + 4],
                    dataArray[i + 5],
                    dataArray[i + 6]
                ));
                i += 6;
            }
            i++;
        }
    }
    /**
     * 通过id查询唯一投射物
     * @param {String} id 实体ID
     * @returns {EntityData} 实体数据对象
     */
    static queryById = id => {
        const data = this.data.id_map.get(id);
        if (data) return data;
        else return this.$NULL;
    };
    static init() {
        this.$NULL = new this(["_NULL", "空白"]);
        const datas = "entityData.jsonc";
        for (let i = 0; i < datas.length; i++) {
            const data = Object.freeze(new this(datas[i]));
            this.data.projectile.usedBySpell.set(data.id, data);
            this.data.id_map.set(data.id, data);
        }
        // console.log(this.data.projectile.usedBySpell);
    }
};