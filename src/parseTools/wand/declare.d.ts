/** 魔杖模板数据 */
type WandTemplate = {
    name: string;
    /** 图标文件路径 */
    file: string;
    grip_x: number;
    grip_y: number;
    tip_x: number;
    tip_y: number;
    /** 施放延迟 */
    fire_rate_wait: number;
    /** 抽取数 */
    actions_per_round: number;
    /** 乱序 */
    shuffle_deck_when_empty: number;
    /** 容量 */
    deck_capacity: number;
    /** 散射 */
    spread_degrees: number;
    /** 充能时间 */
    reload_time: number;
}

/**
 * `lua` 生成的天赋数据
 * [lua file](gen_js_datas.lua)
 */
declare const wandTemplateDatas: Array<WandTemplate>;

