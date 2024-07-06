type Preset$ = {
    FUNGAL_SHIFT: "你听见“?”这个词在回响，变换着色彩";
    BOOBY_TRAPPED: "这里陷阱遍布";
    CONDUCTIVE: "空气像是被电离了";
    FOG_OF_WAR_REAPPEARS: "神秘的黑暗笼罩在这里";
    FOG_OF_WAR_CLEAR_AT_PLAYER: "这里非常昏暗";
    FREEZING: "空气寒冷刺骨";
    FUNGAL: "空气中弥漫着孢子";
    FURNISHED: "这里让你感觉很舒适";
    GAS_FLOODED: "空气中有燃气的味道";
    GOLD_VEIN: "你感觉这里埋藏着财富";
    GOLD_VEIN_SUPER: "你感觉这里埋藏着巨大的财富";
    GRAVITY_FIELDS: "你感到一股无形的力量在拉扯着你";
    HIGH_GRAVITY: "空气很是沉重";
    HOT: "一股热浪扑面而来";
    INVISIBILITY: "你突然无法聚焦视线";
    LOW_GRAVITY: "空气很是轻盈";
    FLOODED: "这些水是从哪里来的？";
    OMINOUS: "一切都感觉要被黑暗吞噬";
    PERFORATED: "这里感觉很宽敞";
    PLANT_INFESTED: "闻起来好像雨后泥土的气味";
    SHIELDED: "这里真是太安全了";
    SPOOKY: "你的后背发凉，汗毛直竖";
    PROTECTION_FIELDS: "一切都沐浴在神秘的光芒之中";
    WORMY: "可怕的爬动声到处都是";
};

type MessageBackgroundId = "important" | "fungal_shift" | "booby_trapped" | "conductive" | "fog_of_war" | "fog_of_war_clear_at_player" | "freezing" | "fungal" | "furnished" | "gas" | "gold" | "gravity_fields" | "high_gravity" | "hot" | "invisible" | "low_gravity" | "moist" | "ominous" | "perforated" | "plant_infested" | "shielded" | "spooky" | "sunlight" | "wormy";

type MessagePresetId = keyof Preset$;

type MessageBackgroundData = {
    /** 背景id */
    id: MessageBackgroundId;
    /** 背景图像url */
    url: Promise<String>;
};

type MessagePresetData<T extends MessagePresetId> = {
    id: T;
    text: Preset$[T];
    background: MessageBackgroundData;
};

export type Class = {
    new (): HTMLElement & {};
};
