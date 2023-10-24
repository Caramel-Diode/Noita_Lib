/**
 * @typedef {Object} SpellData.OfferedProjectileData 提供投射物数据
 * @prop {EntityData} projectileData 投射物数据
 * @prop {Number} num_min 最小提供量
 * @prop {Number} num_max 最大提供量
 * @prop {Boolean} isRelatedProjectiles 是否为关联投射物 能否进行追加触发 (首个投射物默认为 true)
 * @prop {Boolean} isInCastState 处于施法块中 (能否享受施法状态中的效果)
 */

/**
 * @typedef {Object} SpellData.SpawningData 法术生成数据 -1表示非该等级法术
 * @prop {Number} prob_lv0
 * @prop {Number} prob_lv1
 * @prop {Number} prob_lv2
 * @prop {Number} prob_lv3
 * @prop {Number} prob_lv4
 * @prop {Number} prob_lv5
 * @prop {Number} prob_lv6
 * @prop {Number} prob_lv7
 * @prop {Number} prob_lv10
 * @prop {"None"|String} requiresFlag 生成解锁条件
 */

/**
 * @typedef {Object} SpellData.DrawingData 抽取数据
 * @prop {Number} common 常规抽取
 * @prop {Number} hit 碰撞抽取
 * @prop {{count:Number,delay:Number}} timer 定时抽取
 * @prop {Number} death 失效抽取
 */

/**
 * @typedef {Object} SpellElementConstructParam 法术组件构造参数
 * @prop {String} [id] id
 * @prop {String} [name] 名称
 * @prop {String} [exp] 表达式
 * @prop {Array<SpellData>} [datas] 法术数据
 * @prop {"icon"|"panel"} [display] 显示模式
 * @prop {Boolean} [needDefaultFn] 需要默认点击功能
 * @prop {Object} [instance] 实例属性(剩余次数)
 * @prop {Number} instance.remain 剩余次数
 */
