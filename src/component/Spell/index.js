const Spell = (() => {
    embed(`#db.js`);
    SpellData.init();
    const styleSheet = {
        icon: gss(embed(`#icon.css`)),
        panel: gss(embed(`#panel.css`))
    };

    /** @enum {[String,String,String]} */
    const typeInfoMap = {
        null: ["NULL", "⚫", "null"],
        projectile: ["投射物", "🔴", "projectile"],
        staticProjectile: ["静态投射物", "🟠", "static-projectile"],
        modifier: ["投射修正", "🔵", "modifier"],
        drawMany: ["多重施放", "⚪", "draw-many"],
        material: ["材料", "🟢", "material"],
        other: ["其他", "🟡", "other"],
        utility: ["实用", "🟣", "utility"],
        passive: ["被动", "🟤", "passive"]
    };

    const switchWeightAndProp = (() => {
        /** @param {MouseEvent|KeyboardEvent} event */
        const main = event => {
            /** @type {HTMLTableElement} */
            const table = event.currentTarget;
            /** @type {HTMLTableCellElement} */
            const th_title = table.querySelector("th.title");
            /** @type {Array<HTMLTableCellElement>} */
            const td_values = table.querySelectorAll("td.value");

            if (table.getAttribute("display") === "prop") {
                th_title.innerText = "生成权重";
                for (const e of td_values) e.innerText = e.getAttribute("switch.weight");
                table.setAttribute("display", "weight");
            } else {
                th_title.innerText = "生成概率";
                for (const e of td_values) e.innerText = e.getAttribute("switch.prop");
                table.setAttribute("display", "prop");
            }
        };
        return {
            /**
             * 用于鼠标触发 `左键`
             * @param {MouseEvent} event
             */
            click: event => main(event),
            /**
             * 用于键盘触发 `Enter`
             * @param {KeyboardEvent} event
             */
            keydown: event => {
                if (event.key === "Enter") main(event);
            }
        };
    })();

    return class HTMLNoitaSpellElement extends $class(Base, {
        /** @type {$ValueOption<"icon"|"panel">} */
        displayMode: { name: "display", $default: "icon" },
        /** @type {$ValueOption<SpellId|SpellName|SpellAlias>} */
        spellId: { name: "spell.id" },
        /** @type {$ValueOption<SpellId|import("TYPE").SpellTag>} */
        spellExp: { name: "spell.exp" },
        /** @type {$ValueOption<String>} */
        spellRemain: { name: "spell.remain" }
    }) {
        static query = SpellData.query;
        static queryByExp = SpellData.queryByExp;
        static registerTag = SpellData.registerTag;
        /// prettier-ignore

        static get datas() {
            const result = [];
            SpellData.data.all.forEach(e => {
                result[e.id] = e;
                result[e.name] = e;
                for (const i of e.alias) result[i] = e;
                result.push(e);
            });
            return result;
        }

        /** @type {ShadowRoot} */ #shadowRoot = this.attachShadow({ mode: "closed" });
        #needDefaultFn = true;

        /** @type {Array<SpellData>} */ spellDatas = [];

        instanceData = { remain: Infinity };

        /**
         * @typedef {{
         *     id?: SpellId|SpellName|SpellAlias,
         *     exp?: import("TYPE").SpellTag,
         *     datas?: Array<SpellData>,
         *     display?:"icon"|"panel",
         *     instanceData:{remain:Number}
         * }} ConstructorOption
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
        constructor(...params) {
            super();
            let option = null;
            if (typeof params[0] === "object") {
                if (Array.isArray(params[0])) this.spellDatas = params[0];
                else option = params[0];
            }
            if (typeof params[1] === "object") {
                option = params[1];
            }
            if (option) {
                if (option.id) this.setAttribute("spell.id", option.id);
                else if (option.exp) this.setAttribute("spell.exp", option.exp);
                else if (option.datas) this.spellDatas = option.datas;
                this.#needDefaultFn = option.needDefaultFn !== false;
                if (option.display) this.setAttribute("display", option.display);

                if (option.instanceData) {
                    this.setAttribute("spell.remain", option.instanceData.remain.toString());
                    this.instanceData = option.instanceData;
                }
            }
        }

        #IconClickFn() {
            const dialog = createElement("dialog");
            const publicFn = e => {
                e.preventDefault();
                dialog.remove();
            };
            dialog.addEventListener("close", publicFn);
            dialog.addEventListener("contextmenu", publicFn);
            const closeButton = createElement("button");
            closeButton.innerText = "关闭";
            closeButton.addEventListener("click", publicFn);
            dialog.append(new this.constructor(this.spellDatas, { display: "panel" }));
            dialog.append(closeButton);
            document.body.append(dialog);
            dialog.showModal();
        }

        /** 加载图标模式内容
         * @param {String} markIconId
         */
        #loadIconContent(markIconId) {
            this.#shadowRoot.innerHTML = "";
            const length = this.spellDatas.length;
            if (!length) return;
            const fragment = h();
            const titles = [];
            const ol = h.ol({ part: "tape", style: { "--amount": length } });
            for (let i = 0; i < length; i++) {
                const data = this.spellDatas[i];
                const typeInfo = typeInfoMap[data.type];
                ol.append(h.li({ class: typeInfo[2] }, data.icon));
                titles.push(`${typeInfo[1]}${data.name}\n${data.id}\n${data.desc}`);
            }
            this.title = titles.join("\n\n");
            fragment.append(ol);
            if (this.instanceData.remain !== Infinity) fragment.append(h.data(this.instanceData.remain));
            if (markIconId) fragment.append(Base.PanelAttrInfo.query(markIconId).icon);
            fragment.append(h.slot());
            this.#shadowRoot.append(fragment);
            this.setAttribute("role", "button");
            this.setAttribute("tabindex", "0");
            if (this.#needDefaultFn) {
                this.addEventListener("click", this.#IconClickFn);
            }
        }

        static #panelDataSwitch = (() => {
            /** @param {Event} event */
            const main = event => {
                /** @type {HTMLLIElement} */
                const target = event.currentTarget;
                target.className = "selected";
                const lis = target.parentElement.children;
                for (let i = 0; i < lis.length; i++) {
                    const li = lis[i];
                    if (li === target) li.getRootNode().host.#loadPanelContent(i);
                    else li.removeAttribute("class");
                }
            };
            return {
                /** 用于鼠标触发 `左键` @param {MouseEvent} event */
                click: event => main(event),
                /** 用于键盘触发 `Enter` @param {KeyboardEvent} event */
                keydown: event => {
                    if (event.key === "Enter") main(event);
                    else if (event.key === "Escape") event.target.blur();
                }
            };
        })();

        /**
         * 切换面板展示内容
         * @param {Number|String} d id,name,alias 或 索引
         */
        panelContentSwitchTo(d) {
            if (typeof d === "string") this.panelContentSwitchTo(this.spellDatas.indexOf(Spell.query(d)));
            else if (d in this.spellDatas) this.#shadowRoot.querySelector("menu").children[d].click();
            else throw new ReferenceError("不存在的法术");
        }

        /**
         * 加载面板模式内容
         * @param {Number} [index] 法术数据索引
         */
        #loadPanelContent(index = 0) {
            const ignore = this.ignoredPanelAttrs;
            /** @type {Array<HTMLTemplateElement>} */
            const templates = [];
            for (let i = 0; i < this.spellDatas.length; i++) {
                const sd = this.spellDatas[i];
                const template = h.template({ title: sd.name });
                if (i === index) template.toggleAttribute("default");
                templates.push(template);

                //#region 属性区
                /*###############################################################################*/
                const section = h.section({ class: "attrs" });

                //#region 投射物信息

                const relatedSectionElements = [];
                const lis = [];
                for (let i = 0; i < sd.offeredProjectile.length; i++) {
                    const data = sd.offeredProjectile[i];
                    const { amountMax, amountMin, type, projectile } = data;
                    let amount = "";
                    let title = "";
                    if (amountMax > 1) {
                        if (amountMax !== amountMin) amount = `(${amountMin}~${amountMax})`;
                        else amount = `(${amountMax})`;
                    }

                    //prettier-ignore
                    switch(type) {
                        case "common":    title = "享受施法块属性加成\n\t预载投射物\n\t关联投射物"; break;
                        case "relate":    title = "享受施法块属性加成\n\t关联投射物";             break;
                        case "cast":      title = "享受施法块属性加成\n\t预载投射物";             break;
                        case "orbit":     title = "不享受施法块属性加成\n\t环绕投射物";            break;
                        case "bounce":    title = "不享受施法块属性加成\n\t弹跳投射物";            break;
                        case "low-speed": title = "不享受施法块属性加成\n\t低速施放投射物";        break;
                        case "death":     title = "不享受施法块属性加成\n\t失效施放投射物";        break;
                        case "hit":       title = "不享受施法块属性加成\n\t碰撞施放投射物";        break;
                        case "timer":     title = "不享受施法块属性加成\n\t定时施放投射物";        break;
                    }

                    // 获取实体的数据
                    const section_offeredProjectile = Entity.getDataSection(projectile, data, ignore);
                    section_offeredProjectile.setAttribute("related-id", i);
                    const li = h.li({ class: "unselected", "related-id": i, "entity.relation": type, title }, projectile.name, amount);
                    relatedSectionElements.push(section_offeredProjectile);
                    section.append(section_offeredProjectile); // 在修正信息和基本信息之间添加投射物信息
                    li.relatedSectionElements = relatedSectionElements;

                    lis.push(li);
                }
                //#endregion

                //#region 修正信息
                const modLoader = new Base.PanelAttrLoader(ignore).load(sd.modifierAction);

                section.append(modLoader.container); //添加到最后
                //#endregion

                //#region 基本信息
                //prettier-ignore
                const baseLoader = new Base.PanelAttrLoader(ignore).load({
                    spellType:           { value: typeInfoMap[sd.type][0]                                                                     },
                    manaDrain:           { value: sd.mana                                                                                     },
                    maxUse:              { value: { max: sd.maxUse, unlimited: sd.unlimited },               hidden: !Number.isFinite(sd.maxUse)},
                    draw:                { value: sd.draw,                                                   hidden: !sd.draw                 },
                    passiveEffect:       { value: sd.passiveEffect,                                          hidden: !sd.passiveEffect        },
                    unlock:              { value: sd.spawn.requiresFlag,                                     hidden: !sd.spawn.requiresFlag   },
                    projectilesProvided: { value: lis,                                                       hidden: !lis[0]                  }
                });
                section.prepend(baseLoader.container); //添加到最前
                //#endregion
                /*###############################################################################*/
                //#endregion

                template.content.append(sd.icon, this.createPanelH1(sd.id, sd.name), h.p(sd.desc), section);
                //#region 生成权重
                if (!ignore.includes("probs")) {
                    const table = h.table({ class: "probs", tabindex: 0, display: "prop", Event: switchWeightAndProp });
                    const { name, icon } = Base.PanelAttrInfo.query("probs");

                    const tr_lv = h.tr(h.th({ rowspan: 2 }, icon), h.th({ rowspan: 2, class: "title" }, name));
                    const tr_prob = createElement("tr");

                    table.append(tr_lv, tr_prob);
                    const { spawn } = sd;

                    tr_lv.append(h.td({ class: "mark-left", rowspan: 2 }));
                    for (const lv of spawn.lvs) {
                        const prop = `${spawn.percentage(lv).toFixed(3)}%`;
                        tr_lv.append(h.th({ class: "lv" }, lv.toUpperCase()));
                        tr_prob.append(h.td({ class: "value", "switch.weight": spawn[`prob_${lv}`], "switch.prop": prop }, prop));
                    }
                    tr_lv.append(h.td({ class: "mark-right", rowspan: 2 }));
                    template.content.append(table);
                }
                //#endregion
            }
            this.loadPanelContent(templates);
        }

        /** @param {Array<CSSStyleSheet>} [extraStyleSheets] 额外样式表 */
        [$symbols.initStyle](extraStyleSheets = []) {
            // extraStyleSheets.push(styleSheet.base);
            /** @type {String} */
            let mode = this.displayMode;
            if (mode.startsWith("panel")) {
                extraStyleSheets.push(styleSheet.panel);
                mode = "panel";
            } else if (mode.startsWith("icon")) {
                extraStyleSheets.push(styleSheet.icon);
                mode = "icon";
            }
            super[$symbols.initStyle](extraStyleSheets, mode);
        }

        contentUpdate() {
            const spellId = this.spellId;
            if (spellId) this.spellDatas = [SpellData.query(spellId)];
            else {
                const spellExp = this.spellExp;
                if (spellExp) this.spellDatas = SpellData.queryByExp(spellExp);
                if (!this.spellDatas.length) this.spellDatas = [SpellData.$NULL];
            }
            const spellRemain = this.spellRemain;
            if (spellRemain) this.instanceData.remain = Number(spellRemain);
            if (this.hasAttribute("no-default-click-fn")) {
                this.#needDefaultFn = false;
            }
            this[$symbols.initStyle]();
            //prettier-ignore
            switch(this.displayMode) {
                case "panel": this.#loadPanelContent(); break;
                case "icon": this.#loadIconContent(); break;
                default: 
                    if(this.displayMode.startsWith("panel")) {
                        this.#loadPanelContent(Number(this.displayMode.split(":")[1]));
                        break;
                    }
                    if(this.displayMode.startsWith("icon")) {
                        this.#loadIconContent(this.displayMode.split(":")[1]);
                        break;
                    }
            }
        }

        connectedCallback() {
            this.contentUpdate();
        }

        get [Symbol.toStringTag]() {
            const datas = [];
            for (let i = 0; i < this.spellDatas.length; i++) datas.push(this.spellDatas[i].id);
            return `HTMLNoitaSpellElement < ${datas.join(",")} >`;
        }
    };
})();
customElements.define("noita-spell", freeze(Spell));
