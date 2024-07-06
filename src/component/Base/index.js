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
        const main = event => {
            /** @type {HTMLHeadingElement} */
            const h1 = event.target;
            const id = h1.getAttribute("switch.id");
            const name = h1.getAttribute("switch.name");
            if (h1.innerText === id) h1.innerText = name;
            else if (h1.innerText === name) h1.innerText = id;
            else console.error("内容意外修改");
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
                else if (event.ctrlKey || event.metaKey) {
                    if (event.key.toLocaleUpperCase() === "C") {
                        navigator.clipboard.writeText(event.currentTarget.innerText);
                    }
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
            const h1 = $html`<h1 switch.id="${id}" switch.name="${name}">${name}</h1>`;
            util.addFeatureTo(h1, panelTitleSwitch);
            return h1;
        }

        static PanelAttrInfo = PanelAttrInfo;

        /** 面板属性加载器 */
        static PanelAttrLoader = (() => {
            const roundTo = math_.roundTo;

            // const ged = math_.getExactDegree;
            const addFeatureTo = util.addFeatureTo;
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
                    if (element.getAttribute("display") === "false") {
                        element.innerHTML = "";

                        element.append(element.th1_unlock, element.th2_unlock, element.td_unlock);
                        element.setAttribute("display", "true");
                        element.title = "点击隐藏解锁条件";
                    } else {
                        element.innerHTML = "";
                        element.append(element.th1_lock, element.th2_lock, element.td_lock);
                        element.setAttribute("display", "false");
                        element.title = "点击查看解锁条件";
                    }
                };
                return {
                    click: event => main(event.currentTarget),
                    keydown: event => {
                        if (event.key === "Enter") main(event.currentTarget);
                        else if (event.key === "Escape") event.currentTarget.blur();
                    }
                };
            })();
            return class PanelAttrLoader {
                /**
                 * @type {HTMLTableSectionElement}
                 * #### tableBody容器
                 * *不对外开放*
                 * ```html
                 * <tbody> ... </tbody>
                 * ```
                 */
                #tbody = createElement("tbody");
                /**
                 * @type {HTMLTableElement} 表格容器
                 */
                container = createElement("table");
                /**
                 * @param {HTMLTableSectionElement} target
                 * @param {Array<{type:String,value:*, needSign:Boolean?,hidden:Boolean?}>} datas
                 */
                constructor(datas) {
                    if (datas) this.load(datas);
                    this.container.append(this.#tbody);
                    this.container.className = "attrs";
                }
                /** @param {{[key: string]: {value:*,needSign:Boolean?,hidden:Boolean?}}} datas */
                load(datas) {
                    for (const prop in datas) {
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
                        this.#tbody.append(target);
                    }
                }

                /**
                 * 加载属性表行
                 * @param {PanelAttrIDEnum} type
                 * @param {String|Node|{second:Number,frame:Number}} content
                 * @returns {HTMLTableRowElement}
                 */
                #tr(type, content) {
                    let inner = "",
                        attrs = "",
                        listeners;
                    const contentType = typeof content;
                    if (contentType === "string" || contentType === "number") inner = content;
                    else if (contentType === "object") {
                        if (content instanceof Node) inner = content; // html节点 直接插入
                        else {
                            // 单位换算信息 默认显示`秒`
                            attrs = `display="SECOND" value.second="${content.second}" value.frame="${content.frame}"`;
                            inner = content.second;
                            listeners = unitConvert;
                        }
                    }
                    const { icon, name, className = "" } = PanelAttrInfo.query(type);
                    return $html`<tr><th>${icon}</th><th>${name}</th><td class="${className}" ${attrs} on-event=${listeners}>${inner}</td></tr>`;
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
                    return this.#tr(type, { second: s, frame: f });
                }
                /**
                 * 加载`存在时间`面板属性
                 * @param {Number|{base:Number,fluctuation:Number}} value
                 * @param {Boolean|String} [sign]
                 */
                lifetime(value, sign) {
                    let s, f;
                    if (typeof value === "number") {
                        const time = new GameTime(value.base);
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
                    return this.#tr("lifetime", { second: s, frame: f });
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
                    return this.#tr("manaChargeSpeed", { second: s, frame: f });
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
                    const content = createElement("data");
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
                            second: `${value.drawCount_Timer} (${time.s})`,
                            frame: `${value.drawCount_Timer} (${time.f})`
                        });
                    } else if (value.min) return this.#tr("draw", value.toString()); //魔杖不定抽取
                }

                /**
                 * 加载`生成锁 ⇌ 解锁条件`
                 * @param {String} flag 解锁条件
                 */
                unlock(flag) {
                    const tr = createElement("tr");
                    const attrInfo_lock = PanelAttrInfo.query("lock");
                    const attrInfo_unlock = PanelAttrInfo.query("unlock");

                    tr.th1_lock = createElement("th");
                    tr.th2_lock = createElement("th");
                    tr.th1_lock.append(attrInfo_lock.icon);
                    tr.th2_lock.append(attrInfo_lock.name);
                    tr.td_lock = createElement("td");
                    tr.td_lock.innerText = "* ".repeat(Math.min(flag.length, 5));

                    tr.th1_unlock = createElement("th");
                    tr.th2_unlock = createElement("th");
                    tr.th1_unlock.append(attrInfo_unlock.icon);
                    tr.th2_unlock.append(attrInfo_unlock.name);
                    tr.td_unlock = createElement("td");
                    tr.td_unlock.innerText = flag;

                    tr.setAttribute("display", "false");
                    addFeatureTo(tr, showOrHideunlockFlag);
                    tr.append(tr.th1_lock, tr.th2_lock, tr.td_lock);
                    tr.title = "点击查看解锁条件";

                    return tr;
                }

                /**
                 * 加载`提供投射物`|`使用投射物`属性
                 * @param {"projectilesProvided"|"projectilesUsed"} type
                 * @param {Array<HTMLLIElement>} value
                 */
                offerEntity(type, value) {
                    const menu = $html`<menu class=entities-tablist role=tablist></menu>`; //无障碍: 选项卡列表
                    for (let i = 0; i < value.length; i++) {
                        const li = value[i];
                        li.role = "tab"; //无障碍: 选项卡
                        addFeatureTo(li, panelInfoSwitch);
                        menu.append(li);
                    }
                    // console.log(value[0]);
                    value[0].click(); //提供的数据会全部展示 此处点击以实现仅显示首个投射物信息
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

        /** @param {ShadowRootInit} init  */
        attachShadow(init) {
            return (this.#shadowRoot = super.attachShadow(init));
        }

        /** @param {Array<CSSStyleSheet>} [extraStyleSheets] 额外样式表 */
        [$symbols.initStyle](extraStyleSheets = []) {
            extraStyleSheets.push(styleSheet.base);
            //prettier-ignore
            switch(this.displayMode) {
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

        /** 加载 template 内容 (多选项卡) */
        async loadPanelContent(templates) {
            if (templates === undefined) {
                // 从html中解析内容
                await DOMContentLoaded;
                templates = [...this.querySelectorAll("template")];
                for (let i = 0; i < templates.length; i++) templates[i].remove();
            }
            if (templates.length) {
                const fragment = new DocumentFragment();
                const lis = [];
                for (let i = 0; i < templates.length; i++) {
                    const template = templates[i];
                    const li = $html`<li role=tab tabindex=0 on-event=${panelTabsSwitch /*增加切换选项卡对应内容功能*/}><span>${template.title /*title属性将作为选项卡标题*/}</span></li>`;
                    const main = $html`<main role=tabpanel>${template.content /*不进行克隆 需要保留节点上的事件等原始数据*/}</main>`;
                    if (template.hasAttribute("default")) lis.$default = li;
                    li.content = main; //绑定main元素
                    lis.push(li);
                }
                //视口容器 适配滚动条 内容存在多个时需要显示选项卡
                const header = $html`<header><menu role=tablist>${lis}</menu></header>`;
                header.hidden = templates.length < 2;
                fragment.append(header);
                this.#shadowRoot.append(fragment);
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
