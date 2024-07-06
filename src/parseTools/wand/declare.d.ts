/** 魔杖模板数据 */
type WandTemplate = {
    name: String;
    /** 图标文件路径 */
    file: String;
    grip_x: Number;
    grip_y: Number;
    tip_x: Number;
    tip_y: Number;
    /** 施放延迟 */
    fire_rate_wait: Number;
    /** 抽取数 */
    actions_per_round: Number;
    /** 乱序 */
    shuffle_deck_when_empty: Number;
    /** 容量 */
    deck_capacity: Number;
    /** 散射 */
    spread_degrees: Number;
    /** 充能时间 */
    reload_time: Number;
}

/**
 * `lua` 生成的天赋数据
 * [lua file](gen_js_datas.lua)
 */
declare const wandTemplateDatas: Array<WandTemplate>;

