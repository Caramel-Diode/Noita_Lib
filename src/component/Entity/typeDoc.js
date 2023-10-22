/** @namespace EntityData */

/**
 * @typedef {Object} EntityData.OfferedEntityData 提供实体数据
 * @property {EntityData} entityData 实体数据
 * @property {Number} min 最小数量
 * @property {Number} max 最大数量
 */

/**
 * @typedef {Object} EntityData.ProjectileComponent 投射物组件
 * @property {DamageData} offeredDamage 提供伤害
 * @property {Number} explosionRadius 爆炸半径
 * @property {Number} spreadDegrees 散射角度
 * @property {NumFluctuation} lifetime 存在时间
 * @property {NumRange} speed 速度
 * @property {Number} bounces 弹跳次数
 * @property {Number} knockbackForce 击退力度
 * @property {Boolean} friendlyFire 命中友军
 * @property {Boolean} friendlyExplode 炸伤友军
 * @property {Boolean} speedDiffDamage 具有速度差伤害
 * @property {Number} physicsImpulseCoeff 物理推力系数
 * @property {String} materialGenerate 材料生成
 * @property {Boolean} canExplode 能否爆炸
 * @property {Number} damageFrequency 伤害频率
 */

/**
 * @typedef {Object} EntityData.DamageModelComponent.BloodMaterial 伤害模型组件
 * @property {Number} maxHp 最大生命
 * @property {Number} airInLungsMax 氧气储备
 * @property {Array<String>} damageMaterialList 有害材料表
 *
 */
/**
 * @typedef {Object} EntityData.DamageModelComponent 伤害模型组件
 * @property {Number} maxHp 最大生命
 * @property {Number} airInLungsMax 氧气储备
 * @property {Array<String>} damageMaterialList 有害材料表
 * @property {EntityData.DamageModelComponent.BloodMaterial} bloodMaterial 血液材料
 * @property {String} corpseMaterial 尸体材料
 * @property {DamageData} damageMultipler 承伤倍率
 */