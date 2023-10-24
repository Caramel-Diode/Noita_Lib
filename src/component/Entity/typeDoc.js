/**
 * @typedef {Object} EntityData.OfferedEntityData 提供实体数据
 * @prop {EntityData} entityData 实体数据
 * @prop {Number} num_min 最小数量
 * @prop {Number} num_max 最大数量
 */

/**
 * @typedef {Object} EntityData.ProjectileComponent 投射物组件
 * @prop {DamageData} offeredDamage 提供伤害
 * @prop {Number} explosionRadius 爆炸半径
 * @prop {Number} spreadDegrees 散射角度
 * @prop {NumFluctuation} lifetime 存在时间
 * @prop {NumRange} speed 速度
 * @prop {Number} bounces 弹跳次数
 * @prop {Number} knockbackForce 击退力度
 * @prop {Boolean} friendlyFire 命中友军
 * @prop {Boolean} friendlyExplode 炸伤友军
 * @prop {Boolean} speedDiffDamage 具有速度差伤害
 * @prop {Number} physicsImpulseCoeff 物理推力系数
 * @prop {String} materialGenerate 材料生成
 * @prop {Boolean} canExplode 能否爆炸
 * @prop {Number} damageFrequency 伤害频率
 */

/**
 * @typedef {Object} EntityData.DamageModelComponent.BloodMaterial 伤害模型组件
 * @prop {Number} maxHp 最大生命
 * @prop {Number} airInLungsMax 氧气储备
 * @prop {Array<String>} damageMaterialList 有害材料表
 * @prop {Object} bloodMaterial 血液材料
 * @prop {String} bloodMaterial.hurt 血液材料(受伤)
 * @prop {String} bloodMaterial.die 血液材料(死亡)
 * @prop {Array<String>} corpseMaterial 尸体材料
 * @prop {DamageData} damageMultipler 承伤倍率
 *
 */
/**
 * @typedef {Object} EntityData.DamageModelComponent 伤害模型组件
 * @prop {Number} maxHp 最大生命
 * @prop {Number} airInLungsMax 氧气储备
 * @prop {Array<String>} damageMaterialList 有害材料表
 * @prop {EntityData.DamageModelComponent.BloodMaterial} bloodMaterial 血液材料
 * @prop {String} corpseMaterial 尸体材料
 * @prop {DamageData} damageMultipler 承伤倍率
 */