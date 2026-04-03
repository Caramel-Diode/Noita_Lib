const Spell = (() => {
    embed(`#db.js`);
    SpellData.init();

    const typeInfoMap = {
        special: ["", "⚫", "special"],
        projectile: ["投射物", "🔴", "projectile"],
        staticProjectile: ["静态投射物", "🟠", "static-projectile"],
        modifier: ["投射修正", "🔵", "modifier"],
        drawMany: ["多重施放", "⚪", "draw-many"],
        material: ["材料", "🟢", "material"],
        other: ["其他", "🟡", "other"],
        utility: ["实用", "🟣", "utility"],
        passive: ["被动", "🟤", "passive"]
    };

    const projectileHoverPanelMap = {
        common: h`noita-panel`("预载投射物", h.br(), "关联投射物"),
        cast: h`noita-panel`("预载投射物"),
        relate: h`noita-panel`("关联投射物"),
        orbit: h`noita-panel`("环绕生成的投射物"),
        bounce: h`noita-panel`("弹跳时生成的投射物"),
        "low-speed": h`noita-panel`("低速时生成的投射物"),
        death: h`noita-panel`("失效时生成的投射物"),
        hit: h`noita-panel`("碰撞时生成的投射物"),
        timer: h`noita-panel`("定时或周期性生成的投射物"),
        convert: h`noita-panel`("转换生成的投射物")
    };

    const switchWeightAndProp = (() => {
        const main = table => {
            /** @type {HTMLTableCellElement} */
            const th_title = table.querySelector("th.title");
            /** @type {Array<HTMLTableCellElement>} */
            const td_values = table.querySelectorAll("td.value");
            const { dataset } = table;
            if (dataset.display === "prop") {
                th_title.innerText = "生成权重";
                // for (const e of td_values) e.innerText = e.dataset.weight;
                dataset.display = "weight";
            } else {
                th_title.innerText = "生成概率";
                // for (const e of td_values) e.innerText = e.dataset.prop;
                dataset.display = "prop";
            }
            for (const e of td_values) {
                const [weight, prop] = e.children;
                [weight.hidden, prop.hidden] = [prop.hidden, weight.hidden];
            }
        };
        return {
            main,
            event: {
                focus: soundEffect.select,
                mouseenter: soundEffect.select,
                /**
                 * 用于鼠标触发 `左键`
                 * @param {MouseEvent} event
                 */
                click: event => {
                    soundEffect.click();
                    main(event.currentTarget);
                },
                /**
                 * 用于键盘触发 `Enter`
                 * @param {KeyboardEvent} event
                 */
                keydown: event => {
                    if (event.key === "Enter") {
                        soundEffect.click();
                        main(event.currentTarget);
                    }
                }
            }
        };
    })();
    /**
     * 关闭法术面板 (关闭按钮/右键)
     * @param {MouseEvent & {currentTarget: HTMLElement}} event
     */
    const closePanelFn = event => {
        event.preventDefault();
        if (event.currentTarget.tagName === "DIALOG") event.currentTarget.remove();
        else event.currentTarget.parentElement.remove();
        document.body.append(hoverMsg.box);
    };

    /**
     * 缓存 共享 面板模式的实例
     * @type {Map<SpellId,HTMLNoitaSpellElement>}
     */
    const sharedPanelInstance = new Map();

    return class HTMLNoitaSpellElement extends $extends(Base, {
        /** @type {$ValueOption<"icon"|"panel"|"list">} */
        displayMode: { name: "display", $default: "icon" },
        /** @type {$ValueOption<"s"|"f">} */
        displayTimeUnit: { name: "display.time-unit", $default: "s" },
        /** @type {$ValueOption<SpellId|SpellName|SpellAlias>} */
        spellId: { name: "spell.id" },
        /** @type {$ValueOption<string>} */
        spellExp: { name: "spell.exp" },
        /** @type {$ValueOption<string>} */
        spellRemain: { name: "spell.remain" },
        /** @type {$ValueOption<boolean>} */
        noPanelHover: { name: "no-panel-hover" },
        /** @type {$ValueOption<boolean>} */
        noPanelClick: { name: "no-panel-click" },
        /** @type {$ValueOption<string>} */
        entityFoldComponents: { name: "entity.fold-components", $default: "" }
    }) {
        /** @type {typeof SpellData.query} */
        static query = SpellData.query.bind(SpellData);

        /** @type {typeof SpellData.queryByExp} */
        static queryByExp = SpellData.queryByExp.bind(SpellData);

        /** @type {typeof SpellData.registerTag} */
        static registerTag = SpellData.registerTag.bind(SpellData);

        static get spellTags() {
            return SpellData.spellTags;
        }

        /** @type {typeof SpellData.getRandomSpellData} */
        static getRandomSpellData = SpellData.getRandomSpellData.bind(SpellData);

        static get datas() {
            return [...SpellData.tagSets.all];
        }

        /** @type {Array<SpellData>} */ spellDatas = [];

        instanceData = { remain: Infinity };

        /**
         * @typedef ConstructorOption 构造配置
         * @prop {"icon"|"panel"|"list"} [display] 显示模式
         * @prop {string} [id] 法术id/法术名/法术别名
         * @prop {string} [exp] 法术查询表达式
         * @prop {boolean} [noPanelHover] 禁用悬浮面板
         * @prop {boolean} [noPanelClick] 禁用点击面板
         * @prop {Object} [instanceData] 实例数据
         * @prop {number} [instanceData.remain] 剩余使用次数
         * @prop {string} [entityFoldComponents] 剩余使用次数
         */

        /**
         * @overload
         * @param {Array<SpellData>} spellDatas
         * @param {ConstructorOption} [option]
         */
        /**
         * @overload
         * @param {ConstructorOption} option
         */
        constructor(p1 = {}, p2 = {}) {
            super();
            this.attachShadow({ mode: "open" });
            /** @type {ConstructorOption} */
            let option = p2;

            if (Array.isArray(p1)) option.datas = p1;
            else option = p1;

            if (option) {
                const { display, id, exp, instanceData, datas, noPanelClick = false, noPanelHover = false, entityFoldComponents } = option;
                if (display) this.displayMode = display;
                if (id) this.spellId = id;
                if (exp) this.spellExp = exp;
                if (datas) this.spellDatas = datas;
                if (instanceData) this.spellRemain = instanceData.remain;
                this.noPanelClick = noPanelClick;
                this.noPanelHover = noPanelHover;
                if (entityFoldComponents) this.entityFoldComponents = entityFoldComponents;
            }
        }

        /**
         * 缓存 共享 面板模式的实例
         * @type {Map<SpellId,HTMLNoitaSpellElement>}
         */
        static #sharedPanelInstance = new Map();

        #IconClickFn() {
            const closeButton = h.button({ title: "鼠标右键也可关闭" }, "关闭");
            /* prettier-ignore */
            const dialog = h.dialog(
                { oncontextmenu: closePanelFn },
                new Spell(this.spellDatas, { display: "panel", instanceData: this.instanceData }),
                closeButton,
                hoverMsg.box
            );
            // 瞬间关闭防抖
            setTimeout(() => closeButton.addEventListener("click", closePanelFn), 500);
            dialog.addEventListener("close", closePanelFn);
            document.body.append(dialog);
            dialog.showModal();
        }

        /** 加载图标模式内容
         * @param {String} markIconId
         */
        async #loadIconContent(markIconId) {
            this.addEventListener("mouseenter", soundEffect.select);
            this.addEventListener("focus", soundEffect.select);
            this.addEventListener("click", soundEffect.click);
            h.$(this, { role: "button", tabindex: 0 });
            const { length } = this.spellDatas;
            if (!length) return;
            // 检查解析是否出错
            if (this.spellDatas[SpellData.errorSymbol])
                /* prettier-ignore */
                return this.shadowRoot.append(
                    h.div(
                        {style: {display:"grid",placeItems:"center"} },
                        hoverMsg.attachWithPanel(
                            h.i({ class: "warn-icon",style:{ display:"block", zoom: 3 } }),
                            [
                                h.span({style:{color:"#f55",fontWeight:"800"}},"解析出错 "),
                                h.div({style:{paddingTop:"10px"}},h.code({style:{color:"#e4c482"}},this.spellExp)),
                                h.div({style:{paddingTop:"10px"}},this.spellDatas[SpellData.errorSymbol].toString())
                            ],
                            "white"
                        )
                    )
                );

            const titles = [];
            const names = [];
            const ol = h.ol({ part: "tape", style: { "--amount": length } });
            for (const data of this.spellDatas) {
                const typeInfo = typeInfoMap[data.type];
                ol.append(h.li({ class: typeInfo[2] }, data.icon));
                titles.push(`${typeInfo[1]}${data.name}\n${data.id}\n${data.desc}`);
                names.push(data.name);
            }
            hoverPanel: {
                if (this.noPanelHover) {
                    this.title = titles.join("\n\n");
                    break hoverPanel;
                }
                if (!supportHover) break hoverPanel;
                if (length > 1) {
                    const promptMsgContent = new Spell(this.spellDatas, { display: "list" });
                    promptMsgContent.style.setProperty("--gap", "5px");
                    hoverMsg.attachWithPanel(this, [promptMsgContent], "common", true);
                    break hoverPanel;
                }
                const [spellData] = this.spellDatas;
                if (spellData.id[0] === "$") break hoverPanel;
                let instance = sharedPanelInstance.get(spellData.id);
                if (!instance) {
                    instance = new Spell(this.spellDatas, { display: "panel", instanceData: this.instanceData, entityFoldComponents: "DamageModelComponent VelocityComponent VariableStorageComponent LaserEmitterComponent MagicConvertMaterialComponent AnimalAIComponentComponent AIAttackComponent" });
                    sharedPanelInstance.set(spellData.id, instance);
                }
                hoverMsg.attach(this, instance, true);
            }
            clickPanel: {
                if (this.noPanelClick) break clickPanel;
                if (length === 1 && this.spellDatas[0].id[0] === "$") break clickPanel;
                this.addEventListener("click", this.#IconClickFn);
                this.addEventListener("keydown", event => {
                    if (event.key === "Enter") this.click();
                });
            }
            const fragment = h(ol, h.slot());
            if (this.instanceData.remain !== Infinity) fragment.append(h.data({ value: this.instanceData.remain, "aria-label": "剩余使用次数" }, await getPixelFontsImg(this.instanceData.remain)));
            if (markIconId) fragment.append(Base.PanelAttrInfo.query(markIconId).icon);
            this.shadowRoot.append(fragment);

            // 兼容语音朗读识别信息
            this.append(h.span({ slot: "info" }, names.join("、")));
        }

        #loadListContent() {
            const names = [];
            const ul = h.ul({ part: "list" });
            for (const sd of this.spellDatas) {
                names.push(sd.name);
                ul.append(h.li(new Spell([sd])));
            }
            this.shadowRoot.append(ul);
            // 兼容语音朗读识别信息
            this.append(h.span({ slot: "info" }, names.join("、")));
        }

        /**
         * 切换面板展示内容
         * @param {number|string} d id,name,alias 或 索引
         */
        panelContentSwitchTo(d) {
            if (this.displayMode.startsWith("icon")) return console.warn("仅允许面板模式使用");
            if (typeof d === "string") this.panelContentSwitchTo(this.spellDatas.indexOf(Spell.query(d)));
            else if (d in this.spellDatas) this.shadowRoot.querySelector("menu").children[d].click();
            else throw new ReferenceError("不存在的法术");
        }

        /**
         * 加载面板模式内容
         * @param {number} [index] 法术数据索引
         */
        async #loadPanelContent(index = 0) {
            const foldComponents = this.entityFoldComponents.split(" ");
            const ignore = this.ignoredPanelAttrs;
            /** @type {Array<HTMLTemplateElement>} */
            const templates = [];
            // 检查解析是否出错
            if (this.spellDatas[SpellData.errorSymbol]) {
                const template = h.template({ title: "解析出错" });
                /* prettier-ignore */
                template.content.append(
                    h.h1(
                    h.i({ class: "warn-icon", style: { display: "inline-block", verticalAlign: "bottom", zoom: 3 } }),
                        h.span({style:{color:"#f55",fontWeight:"800"}}," 解析出错 "),
                    ),
                    h.p(
                        h.code({style:{color:"#e4c482"}},this.spellExp),
                        h.br(),
                        this.spellDatas[SpellData.errorSymbol].toString()
                    )
                );
                return this.loadPanelContent([template]);
            }
            for (let i = 0; i < this.spellDatas.length; i++) {
                const sd = this.spellDatas[i];
                const template = h.template({ title: sd.name });
                if (i === index) template.dataset.default = 0;
                templates.push(template);
                if (sd.type === "special") {
                    template.content.append(createPanelH1(sd.id, sd.name, "法术"), h.p({ "aria-label": "法术描述" }, sd.desc));
                    continue;
                }

                //#region 属性区
                /*###############################################################################*/
                const section = h.section({ class: "attrs", "aria-label": "属性表" });

                //#region 投射物信息

                const lis = [];
                for (let i = 0, relatedSectionElements = []; i < sd.offeredProjectile.length; i++) {
                    const data = sd.offeredProjectile[i];
                    const { amountMax, amountMin, type, projectile } = data;
                    // 获取实体的数据
                    /* prettier-ignore */
                    /** @type {HTMLElement} */
                    const sectionOfferedProjectile = relatedSectionElements[i] = Entity.getDataSection(projectile, {extraData:data,ignore,timeUnit:this.displayTimeUnit,foldComponents} );
                    sectionOfferedProjectile.ariaLabel = "实体信息(ProjectileEntity)";
                    /* prettier-ignore */
                    /** @type {HTMLLIElement} */
                    const li = lis[i] = h.li(
                        {class:`relation=${type}`},
                        projectile.name +
                        (amountMax > 1 ?
                            (amountMax !== amountMin ?
                                `(${amountMin}~${amountMax})` : `(${amountMax})`
                            ) : ""
                        )
                    );
                    hoverMsg.attach(li, projectileHoverPanelMap[type]);
                    li.relatedSectionElements = relatedSectionElements;
                    li.dataset.relatedId = sectionOfferedProjectile.dataset.relatedId = i;
                    if (data.randomGroup) {
                        const randomGroupIcon = h.img({ is: "noita--perk", dataset: { id: "PERKS_LOTTERY" } });
                        li.prepend(randomGroupIcon);
                        hoverMsg.attachWithPanel(randomGroupIcon, [`随机选择组: ${data.randomGroup}`]);
                    }
                    section.append(sectionOfferedProjectile); // 在修正信息和基本信息之间添加投射物信息
                }
                //#endregion

                //#region 修正信息
                {
                    const config = { ...sd.modifierAction };
                    const modLoader = new Base.PanelAttrLoader(ignore, this.displayTimeUnit);
                    modLoader.container.ariaLabel = "修正信息";
                    section.append(modLoader.container);
                    if (sd.modifierAction.extraEntities) {
                        /** @type {Array<EntityData>} */
                        const entitise = sd.modifierAction.extraEntities.value;
                        const lis = [];
                        for (let i = 0, relatedSectionElements = []; i < entitise.length; i++) {
                            const data = entitise[i];
                            /* prettier-ignore */
                            /** @type {HTMLElement} */
                            const sectionEntity = relatedSectionElements[i] = Entity.getDataSection(data, {ignore,timeUnit:this.displayTimeUnit,foldComponents} );
                            sectionEntity.ariaLabel = "实体信息(ExtraEntity)";
                            /* prettier-ignore */
                            const li = lis[i] = h.li(data.name);
                            li.relatedSectionElements = relatedSectionElements;
                            li.dataset.relatedId = sectionEntity.dataset.relatedId = i;
                            section.append(sectionEntity);
                        }
                        delete config.extraEntities;
                        config.extraEntities = { value: lis, hidden: !lis[0] };
                    }
                    if (sd.modifierAction.gameEffectEntities) {
                        /** @type {Array<EntityData>} */
                        const entitise = sd.modifierAction.gameEffectEntities.value;
                        const lis = [];
                        for (let i = 0, relatedSectionElements = []; i < entitise.length; i++) {
                            const data = entitise[i];
                            /* prettier-ignore */
                            /** @type {HTMLElement} */
                            const sectionEntity = relatedSectionElements[i] = Entity.getDataSection(data, {ignore,timeUnit:this.displayTimeUnit,foldComponents} );
                            sectionEntity.ariaLabel = "实体信息(GameEffectEntity)";
                            /* prettier-ignore */
                            const li = lis[i] = h.li(data.name);
                            li.relatedSectionElements = relatedSectionElements;
                            li.dataset.relatedId = sectionEntity.dataset.relatedId = i;
                            section.append(sectionEntity);
                        }
                        delete config.gameEffectEntities;
                        config.gameEffectEntities = { value: lis, hidden: !lis[0] };
                    }
                    modLoader.load(config);
                }

                //#endregion

                //#region 基本信息
                const holdable = SpellData.tagSets.holdable.has(sd);
                //prettier-ignore
                const baseLoader = await new Base.PanelAttrLoader(ignore).load({
                    spellType: { value: typeInfoMap[sd.type][0] },
                    manaDrain: { value: sd.mana },
                    [ isFinite(this.instanceData.remain) ? "remainingUse" : "maxUse" ]: {
                        value: {
                            max: sd.maxUse,
                            unlimited: sd.unlimited,
                            remain:this.instanceData.remain
                        },
                        hidden: !isFinite(sd.maxUse)
                    },
                    draw: { value: sd.draw, hidden: !sd.draw },
                    passiveEffect: { value: sd.passive, hidden: !sd.passive },
                    unlock: { value: sd.spawn, hidden: !sd.spawn.requiresFlag },
                    aiUses: { value: !sd.aiNeverUses },
                    recursive: { value: sd.recursive },
                    holdable: {value: holdable },
                    unlimited: {value: sd.unlimited, hidden: !isFinite(sd.maxUse) },
                    price: {value: sd.price },
                    projectilesProvided: { value: lis, hidden: !lis[0] }
                });
                baseLoader.container.ariaLabel = "基本信息";
                section.prepend(baseLoader.container); //添加到最前
                //#endregion
                /*###############################################################################*/
                //#endregion

                template.content.append(sd.icon, createPanelH1(sd.id, sd.name, "法术"), h.p({ "aria-label": "法术描述" }, sd.desc), section);
                //#region 生成权重
                if (!ignore.includes("probs")) {
                    const table = h.table({ class: "probs", tabindex: 0, "aria-label": "生成概率与权重", dataset: { display: "prop", useShiftConvert: true }, Event: switchWeightAndProp.event });
                    table[contentConvertFn.fnSymbol] = () => switchWeightAndProp.main(table);
                    const { name, icon } = Base.PanelAttrInfo.query("probs");

                    const tr_lv = h.tr(h.th({ rowspan: 2 }, icon), h.th({ rowspan: 2, class: "title" }, name));
                    const tr_prob = h.tr();

                    table.append(tr_lv, tr_prob);
                    const { spawn } = sd;

                    tr_lv.append(h.td({ class: "mark-left", rowspan: 2, "aria-hidden": "true" }));
                    for (const lv of spawn.lvs) {
                        const prop = `${spawn.percentage(lv).toFixed(3)}%`;
                        const weight = spawn[`prob_${lv}`];
                        tr_lv.append(h.th({ class: "lv", "aria-label": `法术等级 ${lv}` }, await getPixelFontsImg(lv.toUpperCase())));

                        /* prettier-ignore */
                        tr_prob.append(h.td(
                            { class: "value" },
                            h.data({value: prop,"aria-label":"生成概率"},prop),
                            h.data({value: weight,"aria-label":"生成权重", hidden: true},weight)
                        ));
                    }
                    tr_lv.append(h.td({ class: "mark-right", rowspan: 2, "aria-hidden": "true" }));
                    template.content.append(table);
                }
                //#endregion
            }
            this.loadPanelContent(templates);
        }

        static [$css] = {
            base: [],
            icon: [css(embed(`#icon.css`), { name: "spell-icon" })],
            panel: [css(embed(`#panel.css`), { name: "spell-panel" })],
            list: [css(embed(`#list.css`), { name: "spell-list" })]
        };

        /**
         * @override
         * @see Base#contentUpdate
         */
        [$content]() {
            const { spellId, spellExp } = this;
            if (spellId) this.spellDatas = spellId.split(" ").map(Spell.query);
            else if (spellExp)
                try {
                    this.spellDatas = SpellData.queryByExp(spellExp);
                } catch (e) {
                    console.error(e);
                    this.spellDatas = [SpellData.$NULL];
                    this.spellDatas[SpellData.errorSymbol] = e;
                }

            const spellRemain = this.spellRemain;
            if (spellRemain) this.instanceData.remain = +spellRemain;

            //prettier-ignore
            switch (this.displayMode) {
                case "panel": this.#loadPanelContent(); break;
                case "icon": this.#loadIconContent(); break;
                case "list": this.#loadListContent(); break;
                default:
                    if (this.displayMode.startsWith("panel")) {
                        this.#loadPanelContent(+this.displayMode.split(":")[1]);
                        break;
                    }
                    if (this.displayMode.startsWith("icon")) {
                        this.#loadIconContent(this.displayMode.split(":")[1]);
                        break;
                    }
            }
            this.ariaLabel = "Noita 法术";
        }

        get [Symbol.toStringTag]() {
            const datas = [];
            for (let i = 0; i < this.spellDatas.length; i++) datas.push(this.spellDatas[i].id);
            return `HTMLNoitaSpellElement < ${datas.join(",")} >`;
        }
    };
})();
h["noita-spell"] = freeze(Spell);
