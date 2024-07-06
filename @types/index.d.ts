/// @types/index.d.ts

declare const noitaLib: {
    (): "1.0";
    /**
     * ## [`🧪 材料`](./@material.d.ts)
     * ```html
     * <noita-material>
     * ```
     * [*Wiki*](https://noita.wiki.gg/zh/wiki/材料)
     */
    readonly Material: import("./@material").Class;
    /**
     * ## [`🧨 实体`](./@entity.d.ts)
     * ```html
     * <noita-entity>
     * ```
     */
    readonly Entity: import("./@entity").Class;
    /**
     * ## [`✨ 法术`](./@spell.d.ts)
     * ```html
     * <noita-spell>
     * ```
     * [*Wiki*](https://noita.wiki.gg/zh/wiki/法术)
     */
    readonly Spell: import("./@spell").Class;
    /**
     * ## [`🪄 魔杖`](./@wand.d.ts)
     * ```html
     * <noita-wand>
     * ```
     * [*Wiki*](https://noita.wiki.gg/zh/wiki/法杖)
     */
    readonly Wand: import("./@wand").Class;
    /**
     * ## [`🛡️ 天赋`](./@perk.d.ts)
     * ```html
     * <noita-perk>
     * ```
     * [*Wiki*](https://noita.wiki.gg/zh/wiki/天赋)
     */
    readonly Perk: import("./@perk").Class;
    /**
     * ## [`🫙 容器`](./@container.d.ts)
     * ```html
     * <noita-container>
     * ```
     */
    readonly Container: import("./@container").Class;
    /**
     * ## [`📢 消息`](./@message.d.ts)
     * ```html
     * <noita-message>
     * ```
     */
    readonly Message: import("./@message").Class;
    /**
     * ## [`🖱️ 指针`](./@cursor.d.ts)
     * ```html
     * <noita-cursor>
     * ```
     */
    readonly cursor: import("./@cursor").Class;
};
/** ## [`🔥 状态`](https://noita.wiki.gg/zh/wiki/状态) */
/** ## [`🎲 道具`](https://noita.wiki.gg/zh/wiki/道具) */
/** ## [`👿 敌人`](https://noita.wiki.gg/zh/wiki/敌人) */
/** ## [`🔮 真理魔球`](https://noita.wiki.gg/zh/wiki/真理魔球) */
/**  */
type SpellData = import("./@spell").SpellData;
/** 天赋数据 */
type PerkData = import("./@perk").PerkData;
type WandData = import("./@wand").WandData;
type MaterialData = import("./@material").MaterialData;
type EntityData = import("./@entity").EntityData;
