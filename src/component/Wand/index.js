/** ## [`🪄 魔杖`](https://noita.wiki.gg/zh/wiki/法杖) */
const Wand = (() => {
    embed(`#db.js`);
    WandData.init();

    const styleSheet = {
        icon: /* gss(embed(`#icon.css`)) */ null,
        panel: gss(embed(`#panel.css`))
    };

    /**
     * 加载法术列表项
     * @param {HTMLOListElement|HTMLUListElement} container
     * @param {Array<SpellRecipeItem>} datas
     */
    const loadSpellListItems = datas => {
        /** @type {Array<HTMLLIElement>} */
        const lis = [];
        for (const data of datas) {
            let j = 0;
            for (; j < data.min; j++) lis.push($html`<li>${new Spell(data)}</li>`);
            for (; j < data.max; j++) lis.push($html`<li class=optional>${new Spell(data)}</li>`);
        }
        return lis;
    };
    return class HTMLNoitaWandElement extends $class(Base, {
        /** @type {$ValueOption<"icon"|"panel">} */
        displayMode: { name: "display", $default: "panel" },
        /** @type {$ValueOption<String>} */
        wandName: { name: "wand.name", $default: "魔杖" },
        /** @type {$ValueOption<String>} */
        wandTemplate: { name: "wand.template" },
        /** @type {$ValueOption<"AUTO"|`#<number>`|import("TYPE").wandName>} */
        wandIcon: { name: "wand.icon", $default: "AUTO" },
        /** @type {$ValueOption<String>} */
        wandCapacity: { name: "wand.capacity", $default: "26" },
        /** @type {$ValueOption<String>} */
        wandDraw: { name: "wand.draw", $default: "1" },
        /** @type {$ValueOption<String>} */
        wandFireRateWait: { name: "wand.fire-rate-wait", $default: "0" },
        /** @type {$ValueOption<String>} */
        wandReloadTime: { name: "wand.reload-time", $default: "0" },
        /** @type {$ValueOption<"true"|"false">} */
        wandShuffle: { name: "wand.shuffle", $default: "false" },
        /** @type {$ValueOption<String>} */
        wandSpreadDegrees: { name: "wand.spread-degrees", $default: "0" },
        /** @type {$ValueOption<String>} */
        wandSpeedMultiplier: { name: "wand.speed-multiplier", $default: "1" },
        /** @type {$ValueOption<String>} */
        wandManaChargeSpeed: { name: "wand.mana-charge-speed", $default: "0" },
        /** @type {$ValueOption<String>} */
        wandManaMax: { name: "wand.mana-max", $default: "1000" },
        /** @type {$ValueOption<String>} */
        wandStaticSpells: { name: "wand.static-spells", $default: "" },
        /** @type {$ValueOption<String>} */
        wandDynamicSpells: { name: "wand.dynamic-spells", $default: "" }
    }) {
        /** @type {ShadowRoot} */ #shadowRoot = this.attachShadow({ mode: "closed" });
        /**  @type {DisplayMode} */ #displayMode;
        /** @type {WandData} */ wandData;

        constructor(option) {
            super();
            if (option) {
                this.displayMode = option.display ?? "panel";
                if (option.data) {
                    const data = option.data;
                    if (data.template) this.wandData = WandData.getDataByTemplate(data.template);
                    //prettier-ignore
                    else this.wandData = new WandData([
                        data.name ?? "魔杖",
                        data.icon ?? "AUTO",
                        data.capacity ?? 0,
                        data.draw ?? 1,
                        data.fireRateWait ?? 0,
                        data.reloadTime ?? 0,
                        data.shuffle ?? false,
                        data.spreadDegrees ?? 0,
                        data.speedMultiplier ?? 1,
                        data.manaChargeSpeed ?? 0,
                        data.manaMax ?? 1500,
                        data.staticSpells ?? "",
                        data.dynamicSpells ?? ""
                    ]);
                }
            }
        }

        #loadIconContent() {}

        #loadPanelContent() {
            const wd = this.wandData;
            const template = createElement("template");

            //#region 属性区
            /*###############################################################################*/
            const loader = new Base.PanelAttrLoader();

            //prettier-ignore
            loader.load({
                shuffle:         { value: wd.shuffle ? "是" : "否"                                },
                draw:            { value: wd.draw                                                },
                fireRateWait:    { value: wd.fireRateWait                                        },
                reloadTime:      { value: wd.reloadTime                                          },
                manaMax:         { value: wd.manaMax                                             },
                manaChargeSpeed: { value: wd.manaChargeSpeed                                     },
                capacity:        { value: wd.capacity                                            },
                spreadDegrees:   { value: wd.spreadDegrees                                       },
                speedMultiplier: { value: wd.speedMultiplier,   hidden: wd.speedMultiplier == 1  }, //这里用的就是非严格相等
                staticSpells:    { value: $html`<ol class=static-spells>${loadSpellListItems(wd.staticSpells)}</ol>`, hidden:!wd.staticSpells.length }
            });

            /*###############################################################################*/
            //#endregion
            const type = wd.shuffle ? "ul" : "ol";
            //prettier-ignore
            template.content.append(
                wd.icon,
                $html`<h1>${wd.name}</h1>`,
                loader.container,
                $html`<${type} class=dynamic-spells>${loadSpellListItems(wd.dynamicSpells)}</${type}>`
            );

            this.loadPanelContent([template]);
        }

        /** @param {Array<CSSStyleSheet>} [extraStyleSheets] 额外样式表 */
        [$symbols.initStyle](extraStyleSheets = []) {
            // extraStyleSheets.push(styleSheet.base);
            //prettier-ignore
            switch(this.displayMode) {
                case "panel": extraStyleSheets.push(styleSheet.panel); break;
                // case "icon": extraStyleSheets.push(styleSheet.icon)
            }
            super[$symbols.initStyle](extraStyleSheets);
        }

        contentUpdate() {
            const templateName = this.WandTemplate;
            if (templateName) this.wandData = WandData.getDataByTemplate(templateName);
            //prettier-ignore
            else this.wandData = new WandData([
                this.wandName,
                this.wandIcon,
                new RangeValue(this.wandCapacity),
                new RangeValue(this.wandDraw),
                new RangeValue(this.wandFireRateWait),
                new RangeValue(this.wandReloadTime),
                this.wandShuffle === "true",
                new RangeValue(this.wandSpreadDegrees),
                new RangeValue(this.wandSpeedMultiplier),
                new RangeValue(this.wandManaChargeSpeed),
                new RangeValue(this.wandManaMax),
                this.wandStaticSpells,
                this.wandDynamicSpells
            ]);

            this[$symbols.initStyle]();
            //prettier-ignore
            switch(this.displayMode) {
                case "panel": this.#loadPanelContent(); break;
                case "icon": this.#loadIconContent(); break;
                default: throw new TypeError("不支持的显示模式");
            }
        }

        connectedCallback() {
            this.contentUpdate();
        }

        //prettier-ignore
        get [Symbol.toStringTag]() { return `HTMLNoitaWandElement #${this.wandData.name}` }
    };
})();
customElements.define("noita-wand", freeze(Wand));
