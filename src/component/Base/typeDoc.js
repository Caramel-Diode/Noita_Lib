/**
 * @typedef {"type"|"shuffle"|"draw"|"capacity"|"staticSpells"|"manaMax"|"manaChargeSpeed"|"manaDrain"|"maxUse"|"remainingUse"|"fireRateWait"|"reloadTime"|"spreadDegrees"|"projectileDamage"|"projectileDamageMultiplier"|"fireDamage"|"fireDamageMultiplier"|"iceDamage"|"iceDamageMultiplier"|"explosionDamage"|"explosionDamageMultiplier"|"sliceDamage"|"sliceDamageMultiplier"|"drillDamage"|"drillDamageMultiplier"|"electricityDamage"|"electricityDamageMultiplier"|"healingDamage"|"healingDamageMultiplier"|"meleeDamage"|"meleeDamageMultiplier"|"curseDamage"|"curseDamageMultiplier"|"holyDamage"|"holyDamageMultiplier"|"overeatingDamage"|"overeatingMultiplier"|"physicsHitDamage"|"physicsHitDamageMultiplier"|"poisonDamage"|"poisonDamageMultiplier"|"radioactiveDamage"|"radioactiveDamageMultiplier"|"damageCriticalChance"|"speed"|"speedMultiplier"|"explosionRadius"|"bounces"|"knockbackForce"|"lifetime"|"projectilesProvided"|"projectilesUsed"|"passiveEffect"|"bloodMaterial"|"maxHp"|"immunity"|"recoilKnockback"|"draw_common"|"draw_hit"|"draw_timer"|"draw_death"|"infinite"|"maxStack"|"maxInPool"|"airInLungsMax"|"patternDegrees"|"trailMaterial"|"trailMaterialAmount"|"material"|"materialAmount"|} PanelAttrIDEnum 面板属性id
 */

/**
 * @typedef {"projectileDamage"|"projectileDamageMultiplier"|"fireDamage"|"fireDamageMultiplier"|"iceDamage"|"iceDamageMultiplier"|"explosionDamage"|"explosionDamageMultiplier"|"sliceDamage"|"sliceDamageMultiplier"|"drillDamage"|"drillDamageMultiplier"|"electricityDamage"|"electricityDamageMultiplier"|"healingDamage"|"healingDamageMultiplier"|"meleeDamage"|"meleeDamageMultiplier"|"curseDamage"|"curseDamageMultiplier"|"holyDamage"|"holyDamageMultiplier"|"overeatingDamage"|"overeatingMultiplier"|"physicsHitDamage"|"physicsHitDamageMultiplier"|"poisonDamage"|"poisonDamageMultiplier"|"radioactiveDamage"|"radioactiveDamageMultiplier"} PanelAttrID_damageEnum 面板属性`伤害类`
 */

/** @typedef {"panel"|"icon"} DisplayMode 展示模式 */
/**
 * @readonly
 * @typedef {Object} PublicStyleSheets 公共样式表
 * @property {Array<CSSStyleSheet>?} icon 图标模式样式表
 * @property {Array<CSSStyleSheet>?} panel 面板模式样式表
 */