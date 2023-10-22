/**
 * @typedef {Object} Listeners 事件监听器
 * @property {(e:MouseEvent) => never} [click]
 * @property {(e:KeyboardEvent) => never} [keydown]
 */

/**
 * @typedef {Object} NumRange 范围值 
 * @property {Number} max 最大值
 * @property {Number} min 最小值
*/

/**
 * @typedef {Object} NumFluctuation
 * @property {Number} base 基础值
 * @property {Number} fluctuation 波动值
*/

/** @typedef {Number|NumRange} NumRangeOrConstant  固定值或范围值 */

/**
 * @typedef {Object} util.parse.Token
 * @property {String} type 类型
 * @property {String|Number} data 数据
 * @property {Number} index 索引
 */