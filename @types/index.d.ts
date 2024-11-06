declare const noitaLib: {
    (mode: "dev" | undefined): "1.0";
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
    /** ## [`🔮 真理魔球`](https://noita.wiki.gg/zh/wiki/真理魔球)
     * ```html
     * <noita-orb>
     * ```
     */
    readonly Orb: import("./@orb").Class;
    /**
     * ## [`💧 状态`](https://noita.wiki.gg/zh/wiki/状态)
     * ```html
     * <noita-status>
     * ```
     */
    readonly Status: import("./@status").Class;
    /**
     * ## [`🖱️ 指针`](./@cursor.d.ts)
     * ```html
     * <noita-cursor>
     * ```
     */
    readonly cursor: { disable: Boolean };
};
