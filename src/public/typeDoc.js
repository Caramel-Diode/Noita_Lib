/**
 * @typedef {Object} Listeners 事件监听器
 * @prop {(e:MouseEvent) => never} [click]
 * @prop {(e:KeyboardEvent) => never} [keydown]
 */

/**
 * @typedef {Object} NumRange 范围值 
 * @prop {Number} max 最大值
 * @prop {Number} min 最小值
*/

/**
 * @typedef {Object} NumFluctuation
 * @prop {Number} base 基础值
 * @prop {Number} fluctuation 波动值
*/

/** @typedef {Number|NumRange} NumRangeOrConstant  固定值或范围值 */

/**
 * @typedef {Object} util.parse.Token
 * @prop {String} type 类型
 * @prop {String|Number} data 数据
 * @prop {Number} index 索引
 */