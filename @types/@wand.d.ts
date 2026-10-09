import { HTMLNoitaElement } from "./@panel";
import { RangeValue, RangeValueExp, Icon } from "./public";
/** `🔤 法杖名称` */
type wandName = String | ("魔杖" | "初始攻击杖" | "初始炸弹杖" | "长笛" | "康特勒琴" | "狗鱼下颚骨" | "康特勒琴(狗鱼下颚骨强化)" | "桑拿拂尘" | "桦木拂尘" | "迅捷之杖" | "毁灭之杖" | "群体之杖" | "闪光实验性魔杖" | "条件实验性魔杖" | "机枪实验性魔杖" | "拐杖" | "玫瑰" | "权杖" | "许愿骨" | "魔法扫帚");

type WandIcon = Icon & {
    name: string;
    index: number;
    asyncUrl: Promise<string>;
    length: number;
};

/** 法杖数据 */
export type WandData = {
    /** 法杖名称 */
    name: wandName;
    /** 乱序 */
    shuffle: boolean;
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

declare namespace WandData {
    type IconInfo = {
        /** 图标索引 */
        index: number;
        /** 图标名称 */
        name: string;
        /** 图标 */
        icon: HTMLImageElement;
    };
    type MatchData = {
        /** 名称 */
        name: string;
        /** 图标数据 */
        icon: WandIcon;
        /** 容量 */
        capacity: number;
        /** 抽取数 */
        draw: number;
        /** 施放延迟 */
        fireRateWait: number;
        /**  充能时间 */
        reloadTime: number;
        /** 乱序 */
        shuffle: boolean;
        /**  散射角度 */
        spreadDegrees: number;
    };
}

type HTMLNoitaWandElement = HTMLNoitaElement & {
    wandData: WandData;
    displayMode: "panel" | "panel-simple";
    displayTimeUnit: "s" | "f";
    displayBlankSlot: `${boolean}`;
    displayManaWarning: `${boolean}`;
    displayBlankWarning: `${boolean}`;
    wandFrozen: `${boolean}`;
    wandInfo: string;
    wandWarn: string;
    wandName: string;
    wandTemplate: string;
    wandIcon: string;
    wandCapacity: string;
    wandDraw: string;
    wandFireRateWait: string;
    wandReloadTime: string;
    wandShuffle: `${boolean}`;
    wandSpreadDegrees: string;
    wandSpeedMultiplier: string;
    wandManaChargeSpeed: string;
    wandManaMax: string;
    wandStaticSpells: string;
    wandDynamicSpells: string;
};

export type Class = {
    new (option?: {
        /** 显示模式 */
        display?: "panel" | "panel-simple";
        /** 魔杖模板 */
        template?: string;
        /** 魔杖数据 */
        data?:
            | {
                  /** 名称 */
                  name?: string;
                  /** 图标 */
                  icon?: string;
                  /** 容量 */
                  capacity?: RangeValueExp | number;
                  /** 抽取数 */
                  draw?: RangeValueExp | number;
                  /** 施放延迟 */
                  fireRateWait?: RangeValueExp | number;
                  /** 充能时间 */
                  reloadTime?: RangeValueExp | number;
                  /** 乱序 */
                  shuffle?: boolean;
                  /** 散射角度 */
                  spreadDegrees?: RangeValueExp | number;
                  /** 法力恢复速度 */
                  manaChargeSpeed?: RangeValueExp | number;
                  /** 法力上限 */
                  manaMax?: RangeValueExp | number;
                  staticSpells?: string;
                  dynamicSpells?: string;
              }
            | string;
    }): HTMLNoitaWandElement;
    /** 从玩家XML构建多个魔杖组件 */
    formPlayerXML: (xmlString: string, display: "panel" | "panel-simple") => Array<HTMLNoitaWandElement>;
};
