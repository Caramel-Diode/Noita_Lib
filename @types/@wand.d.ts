import { RangeValue, RangeValueExp } from "./public";
/** `🔤 法杖名称` */
type wandName = "初始攻击杖" | "初始炸弹杖" | "长笛" | "康特勒琴" | "狗鱼下颚骨" | "康特勒琴(狗鱼下颚骨强化)" | "桑拿拂尘" | "桦木拂尘" | "迅捷之杖" | "毁灭之杖" | "群体之杖" | "闪光实验性魔杖" | "条件实验性魔杖" | "机枪实验性魔杖" | "拐杖" | "玫瑰" | "权杖" | "许愿骨" | "魔法扫帚";

type WandIcon = HTMLImageElement & { name: String; index: Number; asyncUrl: Promise<String>; length: Number; base64: (zoom: Number) => String };

/** 法杖数据 */
export type WandData = {
    /** 法杖名称 */
    name: Enum.wandName;
    /** 乱序 */
    shuffle: Boolean;
    /** 容量 */
    capacity: RangeValue;
    /** 抽取数 */
    draw: RangeValue;
    /** 施放延迟 */
    fireRateWait: RangeValue;
    /** 充能时间 */
    reloadTime: RangeValue;
    /** 散射角度 */
    spreadDegrees: RangeValue;
    /** 速度倍数 */
    speedMultiplier: RangeValue;
    /** 法力恢复速度 */
    manaChargeSpeed: RangeValue;
    /** 法力上限 */
    manaMax: RangeValue;
    /** 始终施放 */
    staticSpells: Array<unknown>;
    /** 可编辑法术 */
    dynamicSpells: Array<unknown>;
    /** 图标数据 */
    icon: WandIcon;
};

namespace WandData {
    type IconInfo = {
        /** 图标索引 */
        index: Number;
        /** 图标名称 */
        name: String;
        /** 图标 */
        icon: HTMLImageElement;
    };
    type MatchData = {
        /** 名称 */
        name: String;
        /** 图标数据 */
        icon: WandIcon;
        /** 容量 */
        capacity: Number;
        /** 抽取数 */
        draw: Number;
        /** 施放延迟 */
        fireRateWait: Number;
        /**  充能时间 */
        reloadTime: Number;
        /** 乱序 */
        shuffle: Boolean;
        /**  散射角度 */
        spreadDegrees: Number;
    };
}

type HTMLNoitaWandElement = HTMLElement & {
    wandData: WandData;
    contentUpdate: () => never;
    displayMode: "panel" | "panel-simple";
    displayTimeUnit: "s" | "f";
    displayBlankSlot: "true" | "false";
    displayManaWarning: "true" | "false";
    displayBlankWarning: "true" | "false";
    wandFrozen: "true" | "false";
    wandInfo: String;
    wandWarn: String;
    wandName: String;
    wandTemplate: String;
    wandIcon: String;
    wandCapacity: String;
    wandDraw: String;
    wandFireRateWait: String;
    wandReloadTime: String;
    wandShuffle: String;
    wandSpreadDegrees: String;
    wandSpeedMultiplier: String;
    wandManaChargeSpeed: String;
    wandManaMax: String;
    wandStaticSpells: String;
    wandDynamicSpells: String;
};

export type Class = {
    new (option?: {
        /** 显示模式 */
        display?: "panel" | "panel-simple";
        /** 魔杖模板 */
        template?: String;
        /** 魔杖数据 */
        data?: {
            /** 名称 */
            name?: String;
            /** 图标 */
            icon?: String;
            /** 容量 */
            capacity?: RangeValueExp | Number;
            /** 抽取数 */
            draw?: RangeValueExp | Number;
            /** 施放延迟 */
            fireRateWait?: RangeValueExp | Number;
            /** 充能时间 */
            reloadTime?: RangeValueExp | Number;
            /** 乱序 */
            shuffle?: Boolean;
            /** 散射角度 */
            spreadDegrees?: RangeValueExp | Number;
            /** 法力恢复速度 */
            manaChargeSpeed?: RangeValueExp | Number;
            /** 法力上限 */
            manaMax?: RangeValueExp | Number;
            staticSpells?: String;
            dynamicSpells?: String;
        };
    }): HTMLNoitaWandElement;
};
