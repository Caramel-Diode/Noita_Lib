/** @namespace WandData */

/**
 * @typedef {Object} WandData.IconInfo 法杖图标数据
 * @property {Number} origin 起点
 * @property {Number} width 宽度
 * @property {Number} index 索引
 * @property {String} name 名称
 * @property {()=>Promise<HTMLCanvasElement>} getIcon 获取图标
 */

/**
 * @typedef {Object} WandData.MatchData 法杖匹配数据
 * @property {String} name 名称
 * @property {WandData.IconInfo} icon 图标信息
 * @property {Number} capacity 容量
 * @property {Number} draw 抽取数
 * @property {Number} reloadTime 充能时间
 * @property {Number} fireRateWait 充能时间
 * @property {Boolean} shuffle 充能时间
 * @property {Number} spreadDegrees 散射角度
 */

/**
 * @typedef {Object} SpellRecipeItem 法术配方项
 * @property {String} attrStr 法术属性字符串
 * @property {Array<SpellData>} datas 法术数据
 * @property {{remain:Number}} instanceData 法术数据
 * @property {Number} min 最小重复次数
 * @property {Number} max 最大重复次数
 * @property {Boolean} flag_REMAIN 剩余次数标记 (是否已存在)
 * @property {0|1|2} flag_TIME_OF_REPETITION 重复次数标记
 */
