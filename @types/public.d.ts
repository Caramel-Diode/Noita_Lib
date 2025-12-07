export type RangeValue = {
    /** 最小值 */
    min: number;
    /** 最大值 */
    max: number;
    /** 是否为固定值 */
    isFixed: boolean;
    /** 返回一个同步修改最大值和最小值的新Range对象 */
    withChange: (callback: (value: number) => number) => void;
    toString: (unitSymbol: string?) => string;
};

export type RangeValueExp = `>=${number}` | `<=${number}` | `${number}~${number}` | `${number}`;
/** 伤害相关数据 */
export type DamageData = {
    /**
     * ## ![](data:image/webp;base64,UklGRmoAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCAAAAABDzD/ERFCURsp0Eji+C5gfc3hIaL/4fMhRNMOx3HEA1ZQOCAkAAAAMAEAnQEqDgAOAAEAHCWkAANwAP73nf//o3X/+jPf//0bsAAA) [`投射物`](https://noita.wiki.gg/zh/wiki/伤害类型#投射物伤害)
     */
    projectile: number;
    /**
     * ## ![](data:image/webp;base64,UklGRmQAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCUAAAABDzD/ERFCUSNJyu7dlwyR/4SsnABcEBHR/2hOW6BZqSbakRZFAFZQOCAYAAAAMAEAnQEqDgAOAAEAHCWkAANwAP79wIAA) [`近战`](https://noita.wiki.gg/zh/wiki/伤害类型#近战伤害)
     */
    melee: number;
    /**
     * ## ![](data:image/webp;base64,UklGRmAAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCEAAAABDzD/ERHCTNs2kQKgVMb/KqQCGJCI/gdirWN8PrWOcRwAVlA4IBgAAAAwAQCdASoOAA4AAQAcJaQAA3AA/v3AgAA=) [`雷电`](https://noita.wiki.gg/zh/wiki/伤害类型#雷电伤害)
     */
    electricity: number;
    /**
     * ## ![](data:image/webp;base64,UklGRl4AAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSB8AAAABDzD/ERHCTNs2lQJgVMIfVQH0HoaI/ocxImPsvlIAAFZQOCAYAAAAMAEAnQEqDgAOAAEAHCWkAANwAP79wIAA) [`火焰`](https://noita.wiki.gg/zh/wiki/伤害类型#火焰伤害)
     */
    fire: number;
    /**
     * ## ![](data:image/webp;base64,UklGRmAAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCEAAAABDzD/ERGCSAAiqMZ4YLxqjAduRPQ/oqgsh+G+h6EsowgAVlA4IBgAAAAwAQCdASoOAA4AAQAcJaQAA3AA/v3AgAA=) [`爆炸`](https://noita.wiki.gg/zh/wiki/伤害类型#爆炸伤害)
     */
    explosion: number;
    /**
     * ## ![](data:image/webp;base64,UklGRmAAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCEAAAABDzD/ERFCUSNJysKXDMH598QgIqL/sdpq3bvH42B58AMAVlA4IBgAAAAwAQCdASoOAA4AAQAcJaQAA3AA/v3AgAA=) [`冰冻`](https://noita.wiki.gg/zh/wiki/伤害类型#冰冻伤害)
     */
    ice: number;
    /**
     * ## ![](data:image/webp;base64,UklGRmAAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCIAAAABDzD/ERFCIRtJEMKoHMAmA39an0ZE/+PraxxjJETkedoWVlA4IBgAAAAwAQCdASoOAA4AAQAcJaQAA3AA/v3AgAA=) [`切割`](https://noita.wiki.gg/zh/wiki/伤害类型#切割伤害)
     */
    slice: number;
    /**
     * ## ![](data:image/webp;base64,UklGRloAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSBsAAAABDzD/ERFCQSQb1EMw/du8Bv4yRPQ/aDv8o20AVlA4IBgAAAAwAQCdASoOAA4AAQAcJaQAA3AA/v3AgAA=) [`治疗`](https://noita.wiki.gg/zh/wiki/伤害类型#治疗伤害)
     */
    healing: number;
    /**
     * ## ![](data:image/webp;base64,UklGRmYAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCcAAAABDzD/ERFCSSRJzgWarJyDFf/0xJyAhS8iov9xfs5mv/kBgM3e2AAAVlA4IBgAAAAwAQCdASoOAA4AAQAcJaQAA3AA/v3AgAA=) [`诅咒` ](https://noita.wiki.gg/zh/wiki/伤害类型#诅咒伤害)
     */
    curse: number;
    /**
     * ## ![](data:image/webp;base64,UklGRmAAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCEAAAABDzD/ERFCMSNJ0BiMyh7f9tdqjYj+RwilOI7vO04pIQAAVlA4IBgAAAAwAQCdASoOAA4AAQAcJaQAA3AA/v3AgAA=) [`穿凿`](https://noita.wiki.gg/zh/wiki/伤害类型#穿凿伤害)
     */
    drill: number;
    /**
     * ## ![](data:image/webp;base64,UklGRlwAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSB4AAAABDzD/ERFCIcBE0ADuEQo+gLCCiOh/mNbrjclkTANWUDggGAAAADABAJ0BKg4ADgABABwlpAADcAD+/cCAAA==) [`神圣`](https://noita.wiki.gg/zh/wiki/伤害类型#神圣)
     */
    holy: number;
    /**
     * ## ![](data:image/webp;base64,UklGRmAAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCIAAAABDzD/ERFCcdo2UCDfgPffMgP0WCOi/yFEKUkyDM/zflsWVlA4IBgAAAAwAQCdASoOAA4AAQAcJaQAA3AA/v3AgAA=) [`过饱和`](https://noita.wiki.gg/zh/wiki/伤害类型#暴食伤害)
     */
    overeating: number;
    /**
     * ## ![](data:image/webp;base64,UklGRmQAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCUAAAABDzD/ERFCUSNJyiT7JUlrfQSsmBPAICKi/7Hy9PgJovQ0OQQBAFZQOCAYAAAAMAEAnQEqDgAOAAEAHCWkAANwAP79wIAA) [`物理`](https://noita.wiki.gg/zh/wiki/伤害类型#物理伤害)
     */
    physicsHit: number;
    /**
     * ## ![](data:image/webp;base64,UklGRl4AAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSB8AAAABDzD/ERHCVCQb7z0B9G8j0gXwaWSI6H+MLkVtfxQFAFZQOCAYAAAAMAEAnQEqDgAOAAEAHCWkAANwAP79wIAA) [`紫毒`](https://noita.wiki.gg/zh/wiki/伤害类型#紫毒伤害)
     */
    poison: number;
    /**
     * ## ![](data:image/webp;base64,UklGRmQAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCYAAAABDzD/ERFCQds2TKUCCJUBeOBHaAAGJKL/kSQzMyS5sSFJ5/PzAFZQOCAYAAAAMAEAnQEqDgAOAAEAHCWkAANwAP79wIAA) [`放射/绿毒`](https://noita.wiki.gg/zh/wiki/伤害类型#绿毒伤害)
     */
    radioactive: number;
};

/** `🔤 伤害类型` */
export type DamageType = keyof DamageData;

export type Icon = { base64: (zoom: number) => string } & HTMLImageElement;
