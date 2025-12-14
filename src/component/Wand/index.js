/** ## [`🪄 魔杖`](https://noita.wiki.gg/zh/wiki/法杖) */
const Wand = (() => {
    embed(`#db.js`);
    WandData.init();

    /** 创建魔杖属性提示 */
    const createWandAttrTips = (() => {
        const opt = { dataset: { singleShow: true } };
        /** 所有魔杖组件悬浮提示消息共享 */
        const map = {
            shuffle: h`noita-panel`(opt, "以随机乱序施放法术的魔杖。"),
            draw: h`noita-panel`(opt, "使用这支魔杖时，每次施放的法术数量。"),
            "fire-rate-wait": h`noita-panel`(opt, "法术施放之间的时间间隔。"),
            "reload-time": h`noita-panel`(opt, "魔杖内所有法术均被施放后所需的充能时间。"),
            "mana-max": h`noita-panel`(opt, "这支魔杖可储存的最大法力量。"),
            "mana-charge-speed": h`noita-panel`(opt, "这支魔杖的法力再生速度。"),
            capacity: h`noita-panel`(opt, "可插入这支魔杖的法术数量。"),
            "spread-degrees": h`noita-panel`(opt, "这支魔杖发出投射物的方向偏移。"),
            "speed-multiplier": h`noita-panel`(opt, "发射投射物的初始速度系数。"),
            "static-spells": h`noita-panel`(opt, "每次使用这支魔杖时施放相同法术。")
        };
        /** @param {HTMLTableElement}  */
        return ({ rows }) => {
            for (const tr of rows) {
                for (const name of tr.classList) {
                    const tip = map[name];
                    if (tip) {
                        hoverMsg.attach(tr, tip);
                        break;
                    }
                }
            }
        };
    })();

    /**
     * 创建法力不足警告图标
     * @param {import("@spell").SpellData} spellData
     */
    const createManaNotEnoughWarnIcon = ({ name, mana }, manaMax) =>
        hoverMsg.attachWithPanel(
            h.i({ class: "warn-icon", part: "warn-icon" }),
            /* prettier-ignore */
            [h.pre(`警告 - 这支魔杖自身没有足够法力来施放 “${name}”\n魔杖的最大法力为${manaMax}，施放 “${name}” 需要${mana}法力`)],
            "white"
        );

    const hoverPanels = {
        a: h`noita-panel`("可替换法术"),
        b: h`noita-panel`("可选法术"),
        c: h`noita-panel`("可替换法术 可选法术")
    };

    const simplePanelIgnore = freeze(["fireRateWait", "reloadTime", "manaMax", "manaChargeSpeed", "capacity", "spreadDegrees", "speedMultiplier", "staticSpells"]);
    return class HTMLNoitaWandElement extends $extends(Base, {
        /** 显示模式 @type {$ValueOption<"icon"|"panel"|"panel-simple">} */
        displayMode: { name: "display", $default: "panel" },
        /** 面板时间单位 @type {$ValueOption<"s"|"f">} */
        displayTimeUnit: { name: "display.time-unit", $default: "s" },
        /** 混合展示始终法术 @type {$ValueOption<boolean>} */
        displayMixStaticSpell: { name: "display.mix-static-spell", $default: "true" },
        /** 是否显示空法术槽位 @type {$ValueOption<boolean>} */
        displayBlankSlot: { name: "display.blank-slot" },
        /** 是否显示蓝耗过高警告 @type {$ValueOption<boolean>} */ //蓝耗超出上限警告
        displayManaWarning: { name: "display.mana-warning" },
        /** 是否显示无法术警告 @type {$ValueOption<boolean>} */ //空魔杖警告
        displayBlankWarning: { name: "display.blank-warning" },
        /** 是否冻结魔杖 @type {$ValueOption<boolean>} */ // 魔杖冻结
        wandFrozen: { name: "wand.frozen" },
        /** 魔杖提示 @type {$ValueOption<boolean>} */
        wandInfo: { name: "wand.info", $default: "" },
        /** 魔杖警告 @type {$ValueOption<boolean>} */
        wandWarn: { name: "wand.warn", $default: "" },
        /** 魔杖名 @type {$ValueOption<string>} */
        wandName: { name: "wand.name", $default: "魔杖" },
        /** 魔杖模板 @type {$ValueOption<string>} */
        wandTemplate: { name: "wand.template" },
        /** 图标 @type {$ValueOption<"AUTO"|`#<number>`|import("TYPE").wandName>} */
        wandIcon: { name: "wand.icon", $default: "AUTO" },
        /** 容量 @type {$ValueOption<string>} */
        wandCapacity: { name: "wand.capacity", $default: "26" },
        /** 抽取数 @type {$ValueOption<string>} */
        wandDraw: { name: "wand.draw", $default: "1" },
        /** 施放延迟 @type {$ValueOption<string>} */
        wandFireRateWait: { name: "wand.fire-rate-wait", $default: "0" },
        /** 充能时间 @type {$ValueOption<string>} */
        wandReloadTime: { name: "wand.reload-time", $default: "0" },
        /** 冷却时间(施放延迟/充能时间) @type {$ValueOption<string>} */
        wandCD: { name: "wand.cd", $default: "" },
        /** 乱序 @type {$ValueOption<"true"|"false">} */
        wandShuffle: { name: "wand.shuffle", $default: "false" },
        /** 散射 @type {$ValueOption<string>} */
        wandSpreadDegrees: { name: "wand.spread-degrees", $default: "0" },
        /** 速度倍数 @type {$ValueOption<string>} */
        wandSpeedMultiplier: { name: "wand.speed-multiplier", $default: "1" },
        /** 法力恢复速度 @type {$ValueOption<string>} */
        wandManaChargeSpeed: { name: "wand.mana-charge-speed", $default: "0" },
        /** 法力上限 @type {$ValueOption<string>} */
        wandManaMax: { name: "wand.mana-max", $default: "1000" },
        /** 法力上限 @type {$ValueOption<string>} */
        wandMana: { name: "wand.mana", $default: "" },
        /** 始终法术 @type {$ValueOption<string>} */
        wandStaticSpells: { name: "wand.static-spells", $default: "" },
        /** 法术槽法术 @type {$ValueOption<string>} */
        wandDynamicSpells: { name: "wand.dynamic-spells", $default: "" },
        /** 始终/法术槽法术 @type {$ValueOption<string>} */
        wandSpells: { name: "wand.spells", $default: "" }
    }) {
        /** @type {import("@wand").WandData} */
        wandData;

        /**
         * @param {Object} [option] 构造配置
         * @param {"icon"|"panel"|"panel-simple"} [option.display] 显示模式
         * @param {string} [option.template] 模板
         * @param {Object} [option.data] 魔杖数据
         * @param {string} [option.data.name] 名称
         * @param {string} [option.data.icon] 图标
         * @param {number|RangeValueExp} [option.data.capacity] 容量
         * @param {number} [option.data.draw] 抽取数
         * @param {number|RangeValueExp} [option.data.fireRateWait] 施放延迟
         * @param {number|RangeValueExp} [option.data.reloadTime] 充能时间
         * @param {boolean} [option.data.shuffle] 乱序
         * @param {number|RangeValueExp} [option.data.spreadDegrees] 散射角度
         * @param {number|RangeValueExp} [option.data.manaChargeSpeed] 法力恢复速度
         * @param {number|RangeValueExp} [option.data.manaMax] 法力上限
         * @param {string} [option.data.staticSpells] 始终法术 法术表达式
         * @param {string} [option.data.dynamicSpells] 法术槽 法术表达式
         */
        constructor({ display, template, data } = {}) {
            super();
            // 需要手动分配插槽
            this.attachShadow({ mode: "open", slotAssignment: "manual" });
            if (display) this.displayMode = display;
            if (template) this.wandData = WandData.getDataByTemplate(template);
            if (data instanceof WandData) this.wandData = data;
            else if (typeof data === "string") this.wandData = WandData.fromXML(data);
            else if (data)
                /* prettier-ignore */
                this.wandData = new WandData([data.name ?? "魔杖", data.icon ?? "AUTO", data.capacity ?? 0, data.draw ?? 1, data.fireRateWait ?? 0, data.reloadTime ?? 0, data.shuffle ?? false, data.spreadDegrees ?? 0, data.speedMultiplier ?? 1, data.manaChargeSpeed ?? 0, data.manaMax ?? 1500, data.staticSpells ?? "", data.dynamicSpells ?? ""]);
        }

        /**
         * @param {string} xmlString
         * @param {string} [display="panel"] 
         */
        static formPlayerXML(xmlString, display = "panel") {
            return XML.parse(xmlString, { ignore: ["#text", "#comment"] })
                .childNodes.query("Entity")
                .filter(entity => entity.attr.get("tags").split(",").includes("wand"))
                .map(entity => new this({ data: entity.toString("RAW"), display }));
        }
        /**
         * 加载法术列表项
         * @param {Array<SpellRecipeItem>} recipeData
         * @param {"static"|"dynamic"|"mixed"} type
         * @returns {HTMLElement} `<noita-inventory>`
         */
        #spellList(recipeData, type) {
            /* prettier-ignore */
            if (recipeData[WandData.errorSymbol]) return h.div(
                { class: type + "-spells solts" }, 
                hoverMsg.attachWithPanel(
                    h.i({ class: "warn-icon",style:{ display:"block", zoom: 3 } }),
                    [
                        h.span({style:{color:"#f55",fontWeight:"800"}},"解析出错 "),
                        h.div({style:{paddingTop:"10px"}},h.code({style:{color:"#e4c482"}},type === "dynamic" ? this.wandDynamicSpells : this.wandStaticSpells)),
                        h.div({style:{paddingTop:"10px"}},recipeData[WandData.errorSymbol].toString())
                    ],
                    "white"
                )
            );

            const wd = this.wandData;
            /** @type {number} */
            const manaMax = typeof wd.manaMax === "number" ? wd.manaMax : wd.manaMax.median;

            /** @type {Array<HTMLLIElement>} */
            const staicLis = [];
            /** @type {Array<HTMLLIElement>} */
            const dynamicLis = [];

            for (const item of recipeData) {
                const lis = item.display === "icon:staticSpells" || type === "static" ? staicLis : dynamicLis;

                let j = 0;
                /** @type {HTMLElement} */
                let hoverPanel = null;
                if (item.datas.length === 1 && this.displayManaWarning) {
                    // 仅在单个法术时判断法力
                    const { mana } = item.datas[0];
                    if (mana > manaMax) {
                        // 这里需要法力不足的警告图标
                        for (; j < item.min; j++) lis.push(h.li({ part: "inventory-slot" }, new Spell(item), createManaNotEnoughWarnIcon(item.datas[0], manaMax)));
                        hoverPanel = hoverPanels.b;
                        for (; j < item.max; j++) {
                            const li = h.li({ part: "inventory-slot" }, h.$(new Spell(item), { part: "optional-spell" }), createManaNotEnoughWarnIcon(item.datas[0], manaMax));
                            hoverMsg.attach(li, hoverPanel);
                            lis.push(li);
                        }
                        continue;
                    }
                }
                if (item.datas.length > 1) hoverPanel = hoverPanels.a;
                for (; j < item.min; j++) {
                    const li = h.li({ part: "inventory-slot" }, new Spell(item));
                    if (hoverPanel) hoverMsg.attach(li, hoverPanel);
                    lis.push(li);
                }
                hoverPanel = item.datas.length > 1 ? hoverPanels.c : hoverPanels.b;
                for (; j < item.max; j++) {
                    const li = h.li({ part: "inventory-slot" }, h.$(new Spell(item), { part: "optional-spell" }));
                    hoverMsg.attach(li, hoverPanel);
                    lis.push(li);
                }
            }

            // 始终法术
            if (type === "static") return h.ol({ class: "static-spells" }, staicLis);
            const fragment = h();
            if (staicLis.length) {
                const staticInventory = h`noita-inventory`({ class: "static-spells solts", type: "ol" });
                staticInventory.initList(...staicLis);
                fragment.append(staticInventory);
            }
            if (dynamicLis.length) {
                const dynamicInventory = h`noita-inventory`({
                    class: "dynamic-spells solts",
                    type: wd.shuffle ? "ul" : "ol",
                    size: wd.capacity,
                    "display.blank-slot": this.displayBlankSlot
                });
                dynamicInventory.initList(...dynamicLis);
                fragment.append(dynamicInventory);
            }
            if (fragment.childNodes.length > 1) return h.div({ class: "mixed-spells solts" }, fragment);
            return fragment;
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
                hoverMsg.attach(this, h.$(new Wand({ display: "panel", data: this.wandData }), { dataset: { singleShow: true } }));
                template.className = "simple";
                template.style.setProperty("--length", wd.icon.length);
                // 简易模式下这些面板属性将不会被展示
                loader = new Base.PanelAttrLoader(simplePanelIgnore, this.displayTimeUnit);
                template.content.append(loader.container);

                // 简易模式下才会展示prompts图标
                const promptsIcons = h.div({ class: "prompts" });
                template.content.append(promptsIcons);
                if (this.wandFrozen)
                    /* prettier-ignore */
                    promptsIcons.append(hoverMsg.attachWithPanel(
                        h.i({ class: "info-icon" }),
                        [h.pre("这支模组被冻结了\n某种魔法阻止你对这支魔杖进行修改")],
                        "white"
                    ));

                if (wd.dynamicSpells + wd.staticSpells === "" && this.displayBlankWarning)
                    /* prettier-ignore */
                    promptsIcons.append(hoverMsg.attachWithPanel(
                        h.i({ class: "warn-icon" }),
                        ["警告 - 这支魔杖不含法术"],
                        "white"
                    ));

                if (this.wandInfo) promptsIcons.append(hoverMsg.attachWithPanel(h.i({ class: "info-icon" }), [this.wandInfo], "white"));
                if (this.wandWarn) promptsIcons.append(hoverMsg.attachWithPanel(h.i({ class: "warn-icon" }), [this.wandWarn], "white"));
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
            createWandAttrTips(loader.container);
            //#endregion

            if (isSimple && this.displayMixStaticSpell === "true") {
                const recipeData = [];
                for (const item of wd.staticSpells) {
                    recipeData.push({ ...item, display: "icon:staticSpells" });
                }
                recipeData.push(...this.wandData.dynamicSpells);
                template.content.append(this.#spellList(recipeData, "mixed"));
            } else template.content.append(this.#spellList(wd.dynamicSpells, "dynamic"));

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
                    const recipeData = [];
                    let staticPart = "",
                        dynamicPart = "";
                    const spellExps = data.value.split("/");
                    if (spellExps.length > 1) [staticPart, dynamicPart] = spellExps;
                    else [dynamicPart] = spellExps;
                    for (const item of WandData.parseRecipe(staticPart)) {
                        item.display = "icon:staticSpells";
                        recipeData.push(item);
                    }
                    recipeData.push(...WandData.parseRecipe(dynamicPart));
                    /* prettier-ignore */
                    ul.append(
                        h.li(
                            h.h2(Base.PanelAttrInfo.query("list").icon, slot),
                            this.#spellList(recipeData, "mixed")
                        )
                    );
                }
                template.content.append(ul);
            }

            this.loadPanelContent([template]);
        }

        static [$css] = {
            panel: [css(embed(`#panel.css`), { name: "wand-panel" })]
        };

        [$content]() {
            if (!this.wandData) {
                const templateName = this.wandTemplate;
                let { wandReloadTime, wandFireRateWait, wandManaMax, wandManaChargeSpeed, wandStaticSpells, wandDynamicSpells } = this;

                if (this.wandCD) [wandReloadTime, wandFireRateWait] = this.wandCD.split("/");
                if (this.wandMana) [wandManaMax, wandManaChargeSpeed] = this.wandMana.split("/");
                if (this.wandSpells) {
                    const exps = this.wandSpells.split("/");
                    if (exps.length > 1) wandStaticSpells = exps[0];
                    if (exps.at(-1)) wandDynamicSpells = exps.at(-1);
                }
                /** @type {import("@wand").WandData} */
                const customWandData = new WandData([
                    //prettier-ignore
                    this.wandName,
                    this.wandIcon,
                    new RangeValue(this.wandCapacity),
                    new RangeValue(this.wandDraw),
                    new RangeValue(wandFireRateWait),
                    new RangeValue(wandReloadTime),
                    this.wandShuffle === "true",
                    new RangeValue(this.wandSpreadDegrees),
                    new RangeValue(this.wandSpeedMultiplier),
                    new RangeValue(wandManaChargeSpeed),
                    new RangeValue(wandManaMax),
                    wandStaticSpells,
                    wandDynamicSpells
                ]);
                if (templateName) {
                    const custom = Object.create(null);
                    if (this.hasAttribute("wand.name")) custom.name = this.wandName;
                    if (this.hasAttribute("wand.icon")) custom.icon = this.wandIcon;
                    if (this.hasAttribute("wand.capacity")) custom.capacity = new RangeValue(this.wandCapacity);
                    if (this.hasAttribute("wand.fire-rate-wait") || this.hasAttribute("wand.cd")) custom.fireRateWait = new RangeValue(wandFireRateWait);
                    if (this.hasAttribute("wand.reload-time") || this.hasAttribute("wand.cd")) custom.reloadTime = new RangeValue(wandReloadTime);
                    if (this.hasAttribute("wand.shuffle")) custom.shuffle = this.wandShuffle === "true";
                    if (this.hasAttribute("wand.spread-degrees")) custom.spreadDegrees = this.wandSpreadDegrees;
                    if (this.hasAttribute("wand.speed-multiplier")) custom.speedMultiplier = this.wandSpeedMultiplier;
                    if (this.hasAttribute("wand.mana-charge-speed") || this.hasAttribute("wand.mana")) custom.manaChargeSpeed = new RangeValue(wandManaChargeSpeed);
                    if (this.hasAttribute("wand.mana-max") || this.hasAttribute("wand.mana")) custom.manaMax = new RangeValue(wandManaMax);
                    if (this.hasAttribute("wand.static-spells") || this.hasAttribute("wand.spells")) custom.staticSpells = wandStaticSpells;
                    if (this.hasAttribute("wand.dynamic-spells") || this.hasAttribute("wand.spells")) custom.dynamicSpells = wandDynamicSpells;
                    /** @type {import("@wand").WandData} */
                    this.wandData = WandData.getDataByTemplate(templateName, true, custom);
                } else this.wandData = customWandData;
            }

            //prettier-ignore
            switch (this.displayMode) {
                case "panel-simple": this.#loadPanelContent(true); break;
                case "panel": this.#loadPanelContent(); break;
                case "icon": this.#loadIconContent(); break;
                default: throw new TypeError("不支持的显示模式");
            }
        }

        //prettier-ignore
        get [Symbol.toStringTag]() { return `HTMLNoitaWandElement #${this.wandData.name}`; }
    };
})();
h["noita-wand"] = freeze(Wand);
