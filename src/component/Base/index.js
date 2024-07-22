const Base = (() => {
    const styleSheet = {
        base: gss(embed(`#base.css`)),
        icon: gss(embed(`#icon.css`)),
        panel: gss(embed(`#panel.css`))
    };

    embed(`#db.js`);

    PanelAttrInfo.Icon.urls.then(urls => urls.forEach(url => styleSheet.panel.insertRule(`[src="${url}"]{mask:url("${url}") center/100% 100%}`)));

    embed(`#input-range.js`);

    const panelTitleSwitch = (() => {
        const main = h1 => {
            const { switchId: id, switchName: name } = h1;
            if (h1.innerText === id) h1.innerText = name;
            else if (h1.innerText === name) h1.innerText = id;
        };
        return {
            /**
             * 用于鼠标触发 `左键`
             * @param {MouseEvent} event
             */
            click: ({ currentTarget }) => main(currentTarget),
            /**
             * 用于键盘触发 `Enter`
             * @param {KeyboardEvent} event
             */
            keydown: event => {
                if (event.key === "Enter") main(event.currentTarget);
                else if (event.key === "Escape") event.currentTarget.blur();
                else if (event.ctrlKey || event.metaKey) {
                    if (event.key.toLocaleUpperCase() === "C") navigator.clipboard.writeText(event.currentTarget.innerText);
                } else if (event.key === "ArrowUp") {
                    /** @type {ShadowRoot} */
                    const shadowRoot = event.currentTarget.getRootNode();
                    shadowRoot.querySelector("li.selected").focus();
                }
            }
        };
    })();

    const panelTabsSwitch = (() => {
        /**
         * ### 左右方向键导航
         * @param {HTMLLIElement} element
         * @param {Number} offset
         */
        const navigate = (element, offset) => {
            /** @type {NodeListOf<HTMLLIElement>} */
            const elements = element.parentElement.childNodes;
            for (let i = 0; i < elements.length; i++) {
                if (elements[i] === element) return elements[i + offset]?.focus();
            }
        };
        /** @param {Event} event */
        const main = event => {
            /** @type {HTMLLIElement} */ const li = event.currentTarget;
            /** @type {HTMLElement} */ const targetMain = li.content;
            if (targetMain.isConnected) return; // 判断当前main是否需要改变
            /** @type {ShadowRoot} */ const shadowRoot = li.getRootNode();
            for (const e of li.parentElement.childNodes) e.classList.remove("selected");
            li.classList.add("selected");
            shadowRoot.querySelector("main")?.remove();
            shadowRoot.append(targetMain);
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
                else if (event.key === "Escape") event.target.blur();
                else if (event.key === "ArrowLeft") navigate(event.currentTarget, -1);
                else if (event.key === "ArrowRight") navigate(event.currentTarget, 1);
                else if (event.key === "ArrowDown") {
                    /** @type {ShadowRoot} */
                    const shadowRoot = event.currentTarget.getRootNode();
                    shadowRoot.querySelector("h1").focus();
                }
            }
        };
    })();

    return class HTMLNoitaElement extends $class(HTMLElement, {
        /** @type {$ValueOption<"panel">} */
        displayMode: { name: "display", $default: "panel" }
    }) {
        /** @type {ShadowRoot} */ #shadowRoot;
        /**
         * 创建面板 **`<h1>`** 标题
         * @param {String} id
         * @param {String} name
         * @returns {HTMLHeadingElement} `<h1>` 元素
         */
        createPanelH1(id, name) {
            return h.h1({ $: { switchId: id, switchName: name }, Event: panelTitleSwitch }, name);
        }

        static PanelAttrInfo = PanelAttrInfo;

        /** 面板属性加载器 */
        static PanelAttrLoader = (() => {
            const roundTo = math_.roundTo;

            // const ged = math_.getExactDegree;
            /** @type {Listeners} */
            const panelInfoSwitch = (() => {
                /** @param {KeyboardEvent|MouseEvent} event */
                const main = event => {
                    /** @type {HTMLLIElement & {relatedSectionElements: Array<HTMLElement>}} */
                    const target = event.currentTarget;
                    const selectedLi = target.parentElement.querySelector(".selected");
                    const forceToHidden = selectedLi === target; // 再次点击已选中的target时强制隐藏
                    if (forceToHidden) target.toggleAttribute("class");
                    else {
                        if (selectedLi) selectedLi.toggleAttribute("class");
                        target.className = "selected";
                    }
                    //prettier-ignore
                    for (let element of target.relatedSectionElements)
                        element.hidden = element.getAttribute("related-id") !== target.getAttribute("related-id") || forceToHidden;
                };
                return {
                    click: event => main(event),
                    keydown: event => {
                        if (event.key === "Enter") main(event);
                        else if (event.key === "Escape") event.target.blur();
                    }
                };
            })();
            /** @type {Listeners} */
            const unitConvert = (() => {
                /**
                 * 单位转换 `秒 ⇌ 帧`
                 * @param {HTMLElement} element
                 */
                const main = element => {
                    /** @type {HTMLTableCellElement} */
                    if (element.getAttribute("display") === "SECOND") {
                        element.innerText = element.getAttribute("value.frame");
                        element.setAttribute("display", "FRAME");
                    } else {
                        element.innerText = element.getAttribute("value.second");
                        element.setAttribute("display", "SECOND");
                    }
                };
                return {
                    click: event => main(event.target),
                    keydown: event => {
                        if (event.key === "Enter") main(event.target);
                        else if (event.key === "Escape") event.target.blur();
                    }
                };
            })();

            const showOrHideunlockFlag = (() => {
                /**
                 * @param {HTMLElement} element
                 */
                const main = element => {
                    element.innerHTML = "";
                    if (element.$display) {
                        element.append(...element.lockNodes);
                        element.title = "点击查看解锁条件";
                    } else {
                        element.append(...element.unlockNodes);
                        element.title = "点击隐藏解锁条件";
                    }
                    element.$display = !element.$display;
                };
                return {
                    click: ({ currentTarget }) => main(currentTarget),
                    keydown: ({ key, currentTarget }) => {
                        if (key === "Enter") main(currentTarget);
                        else if (key === "Escape") currentTarget.blur();
                    }
                };
            })();
            return class PanelAttrLoader {
                /** @type {HTMLTableElement} 表格容器 */
                container = h.table({ class: "attrs" });
                #ignore;
                /**
                 * @param {HTMLTableSectionElement} target
                 * @param {Array<String>} ignore
                 */
                constructor(ignore = []) {
                    this.#ignore = ignore;
                }
                #isIgnored(prop) {
                    return this.#ignore.includes(prop);
                }
                /** @param {{[key: string]: {value:*,needSign:Boolean?,hidden:Boolean?}}} datas */
                load(datas) {
                    for (const prop in datas) {
                        if (this.#isIgnored(prop)) continue; //跳过被忽略的面板属性
                        let { value, hidden, type = "", pos } = datas[prop];
                        if (hidden) continue;
                        /** @type {HTMLTableRowElement} */
                        let target = null;
                        //prettier-ignore
                        switch (prop) {
                            case "fireRateWait": //====== 施放延迟
                            case "reloadTime": //======== 充能时间
                                target = this.castCD(prop, value,type);
                                break;
                            case "lifetime": //========== 存在时间
                                target = this.lifetime(value, type);
                                break;
                            case "manaChargeSpeed": //=== 法力充能速度
                                target = this.manaChargeSpeed(value);
                                break;
                            case "spreadDegrees": //===== 散射角度
                                target = this.spreadDegrees(value, type);
                                break;
                            case "speed": //============= 投射物速度
                            case "speedMultiplier": //=== 投射物速度倍数
                                target = this.#tr(prop,type + value);
                                break;
                            case "damageCriticalChance": // 暴击率
                                target = this.#tr("damageCriticalChance", type + value + "%");
                                break;
                            case "maxUse": //============== 最大使用次数
                            case "remainingUse": //======== 剩余使用次数
                                target = this.timesUsed(prop, value);
                                break;
                            case "draw": //================ 抽取数
                                target = this.draw(value);
                                break;
                            case "manaMax": //============= 最大法力
                            case "capacity": //============ 容量
                                target = this.#tr(prop, value.toString());
                                break;
                            /*===============*\
                                伤害/承伤
                            \*===============*/
                            case "projectileDamage": case "projectileDamageMultiplier":
                            case "fireDamage": case "fireDamageMultiplier":
                            case "iceDamage": case "iceDamageMultiplier":
                            case "explosionDamage": case "explosionDamageMultiplier":
                            case "sliceDamage": case "sliceDamageMultiplier":
                            case "drillDamage": case "drillDamageMultiplier":
                            case "electricityDamage": case "electricityDamageMultiplier":
                            case "healingDamage": case "healingDamageMultiplier":
                            case "meleeDamage": case "meleeDamageMultiplier":
                            case "curseDamage": case "curseDamageMultiplier":
                            case "holyDamage": case "holyDamageMultiplier":
                            case "overeatingDamage": case "overeatingDamageMultiplier":
                            case "physicsHitDamage": case "physicsHitDamageMultiplier":
                            case "poisonDamage": case "poisonDamageMultiplier":
                            case "radioactiveDamage": case "radioactiveDamageMultiplier":
                                target = this.#tr(prop, type + value);
                                break;
                            
                            case "unlock":
                                target = this.unlock(value);
                                break;
                            case "projectilesProvided":
                            case "projectilesUsed":
                                target = this.offerEntity(prop, value);
                                break;
                            case "bloodMaterial":
                                target = this.bloodMaterial(value.hurt, value.die);
                                break;
                            default:
                                target = this.default(prop,value,type);
                        }
                        if (pos === "before") {
                            target.children[1].title = "前置修正";
                            target.children[1].classList.add("before");
                        } else if (pos === "after") {
                            target.children[1].title = "后置修正";
                            target.children[1].classList.add("after");
                        }
                        this.container.append(target);
                    }
                    return this;
                }

                /**
                 * 加载属性表行
                 * @param {PanelAttrIDEnum} type
                 * @param {String|Node|GameTime} content
                 * @returns {HTMLTableRowElement}
                 */
                #tr(type, content) {
                    const { icon, name, className = "" } = PanelAttrInfo.query(type);
                    let attrs = { class: className };
                    let inner = [];
                    if (typeof content === "object") {
                        if (content instanceof Node) inner.push(content); // html节点 直接插入
                        else
                            attrs = {
                                ...attrs,
                                display: "SECOND",
                                "value.second": content.s,
                                "value.frame": content.f,
                                Event: unitConvert,
                                HTML: content.s // 单位换算信息 默认显示`秒`
                            };
                    } else inner.push(content);
                    return h.tr(h.th(icon), h.th(name), h.td(attrs, inner));
                }

                /**
                 * 加载`施放延迟`|`充能时间`面板属性
                 * @param {"fireRateWait"|"reloadTime"} type CD类型
                 * @param {Number|RangeValue} value
                 * @param {Boolean|String} [sign]
                 */
                castCD(type, value, sign) {
                    let s, f;
                    if (typeof value === "number") {
                        const time = new GameTime(value);
                        s = sign + time.s;
                        f = sign + time.f;
                    } else if (typeof value === "object") {
                        // 魔杖范围值
                        s = value.withChange(GameTime.toS).withChange(roundTo).toString("s");
                        f = value.toString("f");
                    }
                    return this.#tr(type, { s, f });
                }
                /**
                 * 加载`存在时间`面板属性
                 * @param {Number|{base:Number,fluctuation:Number}} value
                 * @param {Boolean|String} [sign]
                 */
                lifetime(value, sign) {
                    let s, f;
                    if (typeof value === "number") {
                        const time = new GameTime(value);
                        s = sign + time.s;
                        f = sign + time.f;
                    } else if (value.fluctuation === 0) {
                        // 实体存在时间 范围显示
                        const time = new GameTime(value.base);
                        s = time.s;
                        f = time.f;
                        if (value.base === -1) s = `永久`;
                    } else {
                        const min = new GameTime(value.base - value.fluctuation);
                        const max = new GameTime(value.base + value.fluctuation);
                        s = min.s + " ~ " + max.s;
                        f = min.f + " ~ " + max.f;
                    }
                    return this.#tr("lifetime", { s, f });
                }
                /**
                 * 加载`法力恢复速度`面板属性
                 * @param {Number|RangeValue} value
                 */
                manaChargeSpeed(value) {
                    let s, f;
                    if (typeof value === "number") {
                        s = value + "/s";
                        f = roundTo(GameTime.toS(value)) + "/f";
                    } else {
                        s = value.toString("/s");
                        f = value.withChange(GameTime.toS).withChange(roundTo).toString("/f");
                    }
                    return this.#tr("manaChargeSpeed", { s, f });
                }
                /**
                 * 加载`散射角度`面板属性
                 * @param {Number|RangeValue} value
                 * @param {Boolean|String} [sign]
                 */
                spreadDegrees(value, sign) {
                    let content;
                    if (typeof value === "number") content = sign + roundTo(value) + "°";
                    else content = value.withChange(roundTo).toString("°");
                    return this.#tr("spreadDegrees", content);
                }

                /**
                 * 加载`最大使用次数`|`剩余使用次数`面板属性
                 * @param {"maxUse"|"remainingUse"} type
                 * @param {{max:Number,remaining:Number?,unlimited:Boolean}} value
                 */
                timesUsed(type, value) {
                    const content = h.data();
                    if (value.unlimited) {
                        content.classList.add("unlimited");
                        content.title = "可无限化";
                    } else {
                        content.classList.add("never-unlimited");
                        content.title = "不可无限化";
                    }
                    if (type === "remainingUse") {
                        content.append(`${value.remaining}/`);
                    }
                    content.append(`${value.max}`);
                    return this.#tr(type, content);
                }

                /**
                 * @param {Number|SpellData.ProjectileData&RangeValue} [value]
                 */
                draw(value = 1) {
                    if (typeof value === "number") return this.#tr("draw", `${value}`);
                    else if (value.drawCount_Death) return this.#tr("draw_death", `${value.drawCount_Death}`);
                    else if (value.drawCount_Hit) return this.#tr("draw_hit", `${value.drawCount_Hit}`);
                    else if (value.drawCount_Timer) {
                        const time = new GameTime(value.drawDelay_Timer);
                        return this.#tr("draw_timer", {
                            s: `${value.drawCount_Timer} (${time.s})`,
                            f: `${value.drawCount_Timer} (${time.f})`
                        });
                    } else if (value.min) return this.#tr("draw", value.toString()); //魔杖不定抽取
                }

                /**
                 * 加载`生成锁 ⇌ 解锁条件`
                 * @param {String} flag 解锁条件
                 */
                unlock(flag) {
                    let lockNodes, unlockNodes;
                    {
                        const { icon, name } = PanelAttrInfo.query("lock");
                        lockNodes = h["[]"](h.th(icon), h.th(name), h.td("* ".repeat(Math.min(flag.length, 5))));
                    }
                    {
                        const { icon, name } = PanelAttrInfo.query("unlock");
                        unlockNodes = h["[]"](h.th(icon), h.th(name), h.td(flag));
                    }
                    return h.tr(
                        {
                            title: "点击查看解锁条件",
                            Event: showOrHideunlockFlag,
                            $: { lockNodes, unlockNodes, $display: false }
                        },
                        lockNodes
                    );
                }

                /**
                 * 加载`提供投射物`|`使用投射物`属性
                 * @param {"projectilesProvided"|"projectilesUsed"} type
                 * @param {Array<HTMLLIElement>} lis
                 */
                offerEntity(type, lis) {
                    const menu = h.menu({ class: "entities-tablist", role: "tablist" }, lis); //无障碍: 选项卡列表
                    for (let i = 0; i < lis.length; i++) h.$attach(lis[i], { role: "tab", Event: panelInfoSwitch });
                    lis[0].click(); //提供的数据会全部展示 此处点击以实现仅显示首个投射物信息
                    return this.#tr(type, menu);
                }
                /**
                 * 加载`血液材料(尸体材料)`属性
                 * @param {String} value_hurt
                 * @param {String} value_die
                 */
                bloodMaterial(value_hurt, value_die) {
                    let content = value_hurt;
                    if (value_die !== value_hurt && value_die !== "") content += ` ${value_die}`;
                    return this.#tr("bloodMaterial", content);
                }

                /**
                 * 加载面板属性(无特殊处理)
                 * @param {PanelAttrIDEnum} type
                 * @param {Number|String} value
                 * @param {Boolean|String} sign
                 */
                default(type, value, sign) {
                    let content;
                    if (value instanceof Node) content = value;
                    else content = sign + value;
                    return this.#tr(type, content);
                }
            };
        })();

        constructor() {
            super();
        }

        /** 从css中获取不需要显示的面板属性 */
        //prettier-ignore
        get ignoredPanelAttrs() {
            return window.getComputedStyle(this).getPropertyValue("--ignore-panel-attr").split(" ");
            // return this.computedStyleMap().get("--ignore-panel-attr")?.toString()?.split(" ") ?? [];
        }

        /** @param {ShadowRootInit} init  */
        attachShadow(init) {
            if (this.#shadowRoot) return this.#shadowRoot;
            return (this.#shadowRoot = super.attachShadow(init));
        }

        /** @param {Array<CSSStyleSheet>} [extraStyleSheets] 额外样式表 */
        [$symbols.initStyle](extraStyleSheets = [], mode = this.displayMode) {
            extraStyleSheets.push(styleSheet.base);
            //prettier-ignore
            switch(mode) {
                case "icon": extraStyleSheets.push(styleSheet.icon); break;
                case "panel": extraStyleSheets.push(styleSheet.panel)
            }
            this.#shadowRoot.adoptedStyleSheets = extraStyleSheets;
        }

        /** 内容更新函数 子类需要重写此函数以供属性变化时自动更新内容 */
        contentUpdate() {
            this[$symbols.initStyle]();
            this.loadPanelContent();
        }

        /**
         * 加载 template 内容 (多选项卡)
         * @param {Array<HTMLTemplateElement>} templates
         */
        async loadPanelContent(templates) {
            this.#shadowRoot.innerHTML = "";
            if (templates === undefined) {
                // 从html中解析内容
                await DOMContentLoaded;
                templates = [...this.querySelectorAll("template")];
                for (let i = 0; i < templates.length; i++) templates[i].remove();
            }
            if (templates.length) {
                const lis = [];
                for (let i = 0; i < templates.length; i++) {
                    const template = templates[i];
                    const main = h.main({ role: "tabpanel" });
                    const fns = [];
                    for (const script of template.content.querySelectorAll("script")) {
                        script.remove();
                        fns.push(Function("h", script.innerHTML).bind(main));
                    }
                    main.append(template.content);
                    for (const fn of fns) fn(h);
                    const li = h.li({ role: "tab", tabindex: 0, Event: panelTabsSwitch, $: { content: main } }, h.span(template.title));
                    if (template.hasAttribute("default")) lis.$default = li;
                    lis.push(li);
                }
                this.#shadowRoot.append(h.header({ hidden: templates.length < 2 }, h.menu({ role: "tablist" }, lis)));
                (lis.$default ?? lis[0]).click();
            } else this.#shadowRoot.innerHTML = `<main class=custom><slot></slot></main>`;
        }

        connectedCallback() {
            this.attachShadow({ mode: "closed" });
            this.contentUpdate();
        }

        //prettier-ignore
        get [Symbol.toStringTag]() { return "HTMLNoitaPanelElement" }

        attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue === null || oldValue === void 0) return;
            if (newValue !== oldValue) {
                if (this.isConnected) this.contentUpdate(); //contentUpdate 会优先调用子类重写的版本
            }
        }
    };
})();
customElements.define("noita-panel", freeze(Base));
