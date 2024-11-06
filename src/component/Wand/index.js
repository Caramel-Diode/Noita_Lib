/** ## [`🪄 魔杖`](https://noita.wiki.gg/zh/wiki/法杖) */
const Wand = (() => {
    embed(`#db.js`);
    WandData.init();

    const styleSheet = {
        icon: /* css(embed(`#icon.css`)) */ null,
        panel: css(embed(`#panel.css`))
    };

    /**
     * 创建法力不足警告图标
     * @param {import("@spell").SpellData<"">} spellData
     */
    const createManaNotEnoughWarnIcon = (spellData, manaMax) => {
        /* prettier-ignore */
        const icon = promptMsg.attach(h.i({ class: "warn-icon", part: "warn-icon" }),
            [h.pre(`警告 - 这支魔杖自身没有足够法力来施放 “${spellData.name}”\n魔杖的最大法力为${manaMax}，施放 “${spellData.name}” 需要${spellData.mana}法力`)],
             "white"
        );
        return icon;
    };

    return class HTMLNoitaWandElement extends $class(Base, {
        /** @type {$ValueOption<"icon"|"panel">} */
        displayMode: { name: "display", $default: "panel" },
        /** @type {$ValueOption<"s"|"f">} */
        displayTimeUnit: { name: "display.time-unit", $default: "s" },
        /** @type {$ValueOption<"false"|"true">} */
        displayBlankSlot: { name: "display.blank-slot", $default: "false" },
        /** @type {$ValueOption<"false"|"true">} */ //蓝耗超出上限警告
        displayManaWarning: { name: "display.mana-warning", $default: "false" },
        /** @type {$ValueOption<"false"|"true">} */ //空魔杖警告
        displayBlankWarning: { name: "display.blank-warning", $default: "false" },
        /** @type {$ValueOption<"false"|"true">} */ // 魔杖冻结
        wandFrozen: { name: "wand.frozen", $default: "false" },
        /** @type {$ValueOption<"false"|"true">} */
        wandInfo: { name: "wand.info", $default: "" },
        /** @type {$ValueOption<"false"|"true">} */
        wandWarn: { name: "wand.warn", $default: "" },
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
        /** @type {WandData} */
        wandData;

        /**
         * @param {Object} [option] 构造配置
         * @param {"panel"|"panel-simple"} [option.display] 显示模式
         * @param {String} [option.template] 模板
         * @param {Object} [option.data] 魔杖数据
         * @param {String} [option.data.name] 名称
         * @param {String} [option.data.icon] 图标
         * @param {Number|RangeValueExp} [option.data.capacity] 容量
         * @param {Number} [option.data.draw] 抽取数
         * @param {Number|RangeValueExp} [option.data.fireRateWait] 施放延迟
         * @param {Number|RangeValueExp} [option.data.reloadTime] 充能时间
         * @param {Boolean} [option.data.shuffle] 乱序
         * @param {Number|RangeValueExp} [option.data.spreadDegrees] 散射角度
         * @param {Number|RangeValueExp} [option.data.manaChargeSpeed] 法力恢复速度
         * @param {Number|RangeValueExp} [option.data.manaMax] 法力上限
         * @param {String} [option.data.staticSpells] 始终法术 法术表达式
         * @param {String} [option.data.dynamicSpells] 法术槽 法术表达式
         */
        constructor({ display, template, data } = {}) {
            super();
            // 需要手动分配插槽
            this.attachShadow({ mode: "open", slotAssignment: "manual" });
            if (display) this.displayMode = display;
            if (template) this.wandData = WandData.getDataByTemplate(template);
            /* prettier-ignore */
            if (data) this.wandData = new WandData([
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
        /**
         * 加载法术列表项
         * @param {Array<SpellRecipeItem>} datas
         * @param {"static"|"dynamic"} type
         * @returns {HTMLOListElement|HTMLUListElement} `<ol>`/`<ul>`
         */
        #spellList(datas, type) {
            /** @type {Number} */
            const manaMax = typeof this.wandData.manaMax === "number" ? this.wandData.manaMax : this.wandData.manaMax.median;

            /** @type {Array<HTMLLIElement>} */
            const lis = [];
            for (const data of datas) {
                let j = 0;
                if (data.datas.length === 1 && this.displayManaWarning === "true") {
                    // 仅在单个法术时判断法力
                    const { mana } = data.datas[0];
                    if (mana > manaMax) {
                        // 这里需要法力不足的警告图标
                        for (; j < data.min; j++) lis.push(h.li({ part: "inventory-slot" }, new Spell(data), createManaNotEnoughWarnIcon(data.datas[0], manaMax)));
                        for (; j < data.max; j++) lis.push(h.li({ part: "inventory-slot" }, h.$(new Spell(data), { part: "optional-spell" }), createManaNotEnoughWarnIcon(data.datas[0], manaMax)));
                        continue;
                    }
                }
                for (; j < data.min; j++) lis.push(h.li({ part: "inventory-slot" }, new Spell(data)));
                for (; j < data.max; j++) lis.push(h.li({ part: "inventory-slot" }, h.$(new Spell(data), { part: "optional-spell" })));
            }

            if (type === "dynamic") {
                const inventory = document.createElement("noita-inventory");
                inventory.className = "solts";
                inventory.displayBlankSlot = this.displayBlankSlot;
                inventory.type = this.wandData.shuffle ? "ul" : "ol";
                inventory.size = this.wandData.capacity;
                /** @type {HTMLUListElement|HTMLOListElement} */
                const list = inventory.initList();
                list.append(...lis);

                return inventory;
            }
            // 始终法术
            return h.ol({ class: "static-spells" }, lis);
        }

        #loadIconContent() {}

        /**
         * @param {Boolean} [isSimple = false] 简易面板
         */
        async #loadPanelContent(isSimple) {
            const wd = this.wandData;
            const template = h.template(wd.icon);

            let loader;
            if (isSimple) {
                template.className = "simple";
                template.style.setProperty("--length", wd.icon.length);
                // 简易模式下这些面板属性将不会被展示
                loader = new Base.PanelAttrLoader(["fireRateWait", "reloadTime", "manaMax", "manaChargeSpeed", "capacity", "spreadDegrees", "speedMultiplier"], this.displayTimeUnit);
                template.content.append(loader.container);

                // 简易模式下才会展示prompts图标
                const promptsIcons = h.div({ class: "prompts" });
                template.content.append(promptsIcons);
                if (this.wandFrozen === "true")
                    /* prettier-ignore */
                    promptsIcons.append(promptMsg.attach(
                        h.i({ class: "info-icon" }),
                        [h.div("这支模组被冻结了"), h.div("某种魔法阻止你对这支魔杖进行修改")],
                        "white"
                    ));

                if (wd.dynamicSpells + wd.staticSpells === "" && this.displayBlankWarning === "true")
                    /* prettier-ignore */
                    promptsIcons.append(promptMsg.attach(
                        h.i({ class: "warn-icon" }),
                        ["警告 - 这支魔杖不含法术"],
                        "white"
                    ));

                if (this.wandInfo) promptsIcons.append(promptMsg.attach(h.i({ class: "info-icon" }), [this.wandInfo], "white"));
                if (this.wandWarn) promptsIcons.append(promptMsg.attach(h.i({ class: "warn-icon" }), [this.wandWarn], "white"));
            } else {
                loader = new Base.PanelAttrLoader(void 0, this.displayTimeUnit);
                template.content.append(h.h1(wd.name), loader.container);
            }

            //#region 属性区
            /* prettier-ignore */
            loader.load({
                shuffle: { value: wd.shuffle ? "是" : "否" },
                draw: { value: wd.draw },
                fireRateWait: { value: wd.fireRateWait },
                reloadTime: { value: wd.reloadTime },
                manaMax: { value: wd.manaMax },
                manaChargeSpeed: { value: wd.manaChargeSpeed },
                capacity: { value: wd.capacity },
                spreadDegrees: { value: wd.spreadDegrees },
                speedMultiplier: { value: wd.speedMultiplier, hidden: wd.speedMultiplier == 1 }, //这里用的就是非严格相等
                staticSpells: { value: this.#spellList(wd.staticSpells, "static"), hidden: !wd.staticSpells.length }
            });
            //#endregion
            template.content.append(this.#spellList(wd.dynamicSpells, "dynamic"));

            // 从内部<data>加载多个命名动态法术序列
            await DOMContentLoaded;
            const datas = this.querySelectorAll("data");
            if (datas.length) {
                const ul = h.ul({ class: "named-solts" });
                for (let i = 0; i < datas.length; i++) {
                    const data = datas[i];
                    const slot = h.slot();
                    // 需要slot节点已经被添加到页面后才能分配成功
                    queueMicrotask(() => slot.assign(data));
                    /* prettier-ignore */
                    ul.append(
                        h.li(
                            h.h2(Base.PanelAttrInfo.query("list").icon, slot),
                            this.#spellList(WandData.parseRecipe(data.value), "dynamic")
                        )
                    );
                }
                template.content.append(ul);
            }

            this.loadPanelContent([template]);
        }

        /** @param {Array<CSSStyleSheet>} [extraStyleSheets] 额外样式表 */
        [$symbols.initStyle](extraStyleSheets = []) {
            // extraStyleSheets.push(styleSheet.base);
            /** @type {String} */
            let mode = this.displayMode;
            //prettier-ignore
            switch (mode) {
                case "panel-simple": mode = "panel";
                case "panel": extraStyleSheets.push(styleSheet.panel); break;
                // case "icon": extraStyleSheets.push(styleSheet.icon)
            }
            super[$symbols.initStyle](extraStyleSheets, mode);
        }

        /**
         * @override
         * @see Base#contentUpdate
         */
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
            switch (this.displayMode) {
                case "panel-simple": this.#loadPanelContent(true); break;
                case "panel": this.#loadPanelContent(); break;
                case "icon": this.#loadIconContent(); break;
                default: throw new TypeError("不支持的显示模式");
            }
        }

        connectedCallback() {
            this.contentUpdate();
        }

        //prettier-ignore
        get [Symbol.toStringTag]() { return `HTMLNoitaWandElement #${this.wandData.name}`; }
    };
})();
customElements.define("noita-wand", freeze(Wand));
