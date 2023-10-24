/** @namespace WandData */

/**
 * @typedef {Object} WandData.IconInfo 法杖图标数据
 * @prop {Number} origin 起点
 * @prop {Number} width 宽度
 * @prop {Number} index 索引
 * @prop {String} name 名称
 * @prop {()=>Promise<HTMLCanvasElement>} getIcon 获取图标
 */

/**
 * @typedef {Object} WandData.MatchData 法杖匹配数据
 * @prop {String} name 名称
 * @prop {WandData.IconInfo} icon 图标信息
 * @prop {Number} capacity 容量
 * @prop {Number} draw 抽取数
 * @prop {Number} reloadTime 充能时间
 * @prop {Number} fireRateWait 充能时间
 * @prop {Boolean} shuffle 充能时间
 * @prop {Number} spreadDegrees 散射角度
 */

/**
 * @typedef {Object} SpellRecipeItem_ 法术配方项
 * @prop {String} attrStr 法术属性字符串
 * @prop {Number} min 最小重复次数
 * @prop {Number} max 最大重复次数
 * @prop {Boolean} flag_REMAIN 剩余次数标记 (是否已存在)
 * @prop {0|1|2} flag_TIME_OF_REPETITION 重复次数标记
 */

/**
 * @typedef {SpellElementConstructParam & SpellRecipeItem_} SpellRecipeItem 法术配方项
 */
