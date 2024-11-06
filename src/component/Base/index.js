const Base = (() => {
    const styleSheet = {
        base: css(embed(`#base.css`)),
        icon: css(embed(`#icon.css`)),
        panel: css(embed(`#panel.css`))
    };

    embed(`#db.js`);

    PanelAttrInfo.Icon.urls.then(urls => urls.forEach(url => styleSheet.panel.insertRule(`[src="${url}"]{mask:url("${url}") center/100% 100%}`)));

    embed(`#input-range.js`);
    embed(`#inventory.js`);

    const panelTitleSwitch = (() => {
        /** @param  {HTMLHeadingElement} h1 */
        const main = h1 => {
            const { id, name } = h1.dataset;
            h1.innerText = h1.innerText === id ? name : id;
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
            /** @type {HTMLLIElement} */
            const li = event.currentTarget;
            /** @type {HTMLElement} */
            const targetPanel = li.content;
            if (!targetPanel.hidden) return;
            const [, ...sections] = li.getRootNode().childNodes;
            for (const e of sections) e.hidden = e !== targetPanel;
            for (const e of li.parentElement.childNodes) e.classList.remove("selected");
            li.classList.add("selected");
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
        displayMode: { name: "display", $default: "panel" },
        /** @type {$ValueOption<"common"|"white">} */
        borderStyle: { name: "border-style", $default: "common" },
        /** @type {$ValueOption<string>} */
        promptFor: { name: "prompt-for", $default: "" },
        /** @type {$ValueOption<string>} */
        promptForSelector: { name: "prompt-for.selector", $default: "" }
    }) {
        /** @type {ShadowRoot} */
        #shadowRoot;
        /**
         * 创建面板 **`<h1>`** 标题
         * @param {String} id
         * @param {String} name
         * @returns {HTMLHeadingElement} `<h1>` 元素
         */
        createPanelH1(id, name) {
            return h.h1({ "data-id": id, "data-name": name, Event: panelTitleSwitch }, name);
        }

        static PanelAttrInfo = PanelAttrInfo;

        /** 面板属性加载器 */
        static PanelAttrLoader = (() => {
            const { roundTo } = math;

            /** @type {Listeners} */
            const panelInfoSwitch = (() => {
                /** @param {KeyboardEvent|MouseEvent} event */
                const main = event => {
                    /** @type {HTMLLIElement & {relatedSectionElements: Array<HTMLElement>}} */
                    const target = event.currentTarget;
                    const selectedLi = target.parentElement.querySelector(".selected");
                    const forceToHidden = selectedLi === target; // 再次点击已选中的target时强制隐藏
                    target.classList.toggle("selected");
                    if (!forceToHidden) selectedLi?.classList.toggle("selected");
                    //prettier-ignore
                    for (let element of target.relatedSectionElements)
                        element.hidden = element.dataset.relatedId !== target.dataset.relatedId || forceToHidden;
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
                    const dataElements = element.querySelectorAll("[data-time]");
                    for (let i = 0; i < dataElements.length; i++) {
                        /** @type {HTMLElement} */
                        const e = element.children[i];
                        e.hidden = !e.hidden;
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
                /** @type {(prop:String)=>Boolean} */
                #isIgnored;
                #timeUnit;
                /**
                 * @param {Array<String>} ignore
                 * @param {"s"|"f"} timeUnit 默认显示时间单位
                 */
                constructor(ignore = [], timeUnit = "s") {
                    this.#timeUnit = timeUnit;
                    this.#isIgnored = Array.prototype.includes.bind(ignore);
                }
                /** @param {{[key: string]: {value:*,needSign:Boolean?,hidden:Boolean?}}} datas */
                load(datas) {
                    for (const prop in datas) {
                        if (this.#isIgnored(prop)) continue; //跳过被忽略的面板属性
                        let { value, hidden, type = "", pos } = datas[prop]; // type 是修正运算符
                        if (hidden) continue;
                        /** @type {HTMLTableRowElement} */
                        let target = null;
                        //prettier-ignore
                        switch (prop) {
                            case "effectInterval": //==== 作用间隔
                            case "damageInterval": //==== 伤害间隔
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
                            case "loadEntities":
                            case "extraEntities":
                            case "gameEffectEntities":
                                target = this.offerEntity(prop, value);
                                break;
                            case "bloodMaterial":
                                target = this.bloodMaterial(value.hurt, value.die);
                                break;
                            case "trigger":
                                target = this.trigger(value);
                                break;
                            case "tag":
                                target = this.tag(value);
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
                 * 创建单位数据单元格
                 * @param {String} s
                 * @param {String} f
                 */
                #createUnitDataTd(s, f) {
                    const spanSecond = h.span({ dataset: { time: "second" }, hidden: this.#timeUnit === "f" }, s);
                    const spanFrame = h.span({ dataset: { time: "frame" }, hidden: this.#timeUnit === "s" }, f);
                    return h.td({ Event: unitConvert }, spanSecond, spanFrame);
                }

                /**
                 * 加载属性表行
                 * @param {PanelAttrIDEnum} type
                 * @param {String|Node} [content]
                 * @returns {HTMLTableRowElement}
                 */
                #tr(type, content) {
                    const { icon, name, className = "" } = PanelAttrInfo.query(type);
                    const tr = h.tr({ class: className }, h.th(icon), h.th(name));
                    if (content) tr.append(h.td(content));
                    return tr;
                }

                /**
                 * 加载`施放延迟`|`充能时间`面板属性
                 * @param {"fireRateWait"|"reloadTime"|"damageInterval"} type CD类型
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
                    const tr = this.#tr(type);
                    tr.append(this.#createUnitDataTd(s, f));
                    return tr;
                }
                /**
                 * 加载`存在时间`面板属性
                 * @param {Number|RangeValue} value
                 * @param {Boolean|String} [sign]
                 */
                lifetime(value, sign) {
                    let s, f;
                    if (typeof value === "number") {
                        const time = new GameTime(value);
                        s = sign + time.s;
                        f = sign + time.f;
                    } else {
                        if (value.isFixed) {
                            const time = new GameTime(value.median);
                            s = time.s;
                            f = time.f;
                        } else {
                            const min = new GameTime(value.min);
                            const max = new GameTime(value.max);
                            s = min.s + " ~ " + max.s;
                            f = min.f + " ~ " + max.f;
                        }
                    }
                    const tr = this.#tr("lifetime");
                    tr.append(this.#createUnitDataTd(s, f));
                    return tr;
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
                    const tr = this.#tr("manaChargeSpeed");
                    tr.append(this.#createUnitDataTd(s, f));
                    return tr;
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
                 * @param {Number|{drawCount_Death:Number,drawCount_Hit:Number,drawCount_Timer:Number,drawDelay_Timer:Number}|RangeValue} [value]
                 */
                draw(value = 1) {
                    if (typeof value === "number") return this.#tr("draw", `${value}`);
                    const { drawCount_Death, drawCount_Hit, drawCount_Timer, drawDelay_Timer } = value;
                    if (drawCount_Death) return this.#tr("draw_death", `${drawCount_Death}`);
                    else if (drawCount_Hit) return this.#tr("draw_hit", `${drawCount_Hit}`);
                    else if (drawCount_Timer) {
                        const { s, f } = new GameTime(drawDelay_Timer);
                        const tr = this.#tr("draw_timer");
                        tr.append(this.#createUnitDataTd(drawCount_Timer + ` (${s})`, drawCount_Timer + ` (${f})`));
                        return tr;
                    }
                    return this.#tr("draw", value.toString()); //魔杖不定抽取
                }

                /**
                 * 加载`生成锁 ⇌ 解锁条件`
                 * @param {String} flag 解锁条件
                 */
                unlock(flag) {
                    let lockNodes, unlockNodes;
                    {
                        const { icon, name } = PanelAttrInfo.query("lock");
                        lockNodes = h(h.th(icon), h.th(name), h.td("* ".repeat(Math.min(flag.length, 5))));
                    }
                    {
                        const { icon, name } = PanelAttrInfo.query("unlock");
                        unlockNodes = h(h.th(icon), h.th(name), h.td(flag));
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
                 * @param {"projectilesProvided"|"projectilesUsed"|"loadEntities"} type
                 * @param {Array<HTMLLIElement>} lis
                 */
                offerEntity(type, lis) {
                    const menu = h.menu({ class: "entities-tablist", role: "tablist" }, lis); //无障碍: 选项卡列表
                    for (let i = 0; i < lis.length; i++) h.$(lis[i], { role: "tab", Event: panelInfoSwitch });
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
                 *
                 * @param {{type:"ON_HIT"|"ON_TIMER"|"ON_DEATH",delay:RangeValue?}} value
                 */
                trigger(value) {
                    console.log(value);

                    switch (value.type) {
                        case "ON_HIT":
                            return this.#tr("trigger", h(PanelAttrInfo.query("on_hit").icon, " 碰撞"));
                        case "ON_DEATH":
                            return this.#tr("trigger", h(PanelAttrInfo.query("on_death").icon, " 失效"));
                        case "ON_TIMER": // 需要重写部分 #tr函数的逻辑
                            const { delay } = value;
                            const { icon, name, className = "" } = PanelAttrInfo.query("trigger");

                            const tr = this.#tr("trigger");
                            let td;
                            if (delay.isFixed) {
                                const { s, f } = new GameTime(delay.median);
                                td = this.#createUnitDataTd(s, f);
                            } else {
                                const max = new GameTime(delay.max);
                                const min = new GameTime(delay.min);
                                td = this.#createUnitDataTd(` 定时(${min.s}~${max.s})`, ` 定时(${min.f}~${max.f})`);
                            }
                            td.prepend(PanelAttrInfo.query("on_timer").icon);
                            tr.append(td);
                            return tr;
                    }
                }

                /**
                 *
                 * @param {Array<String>} value
                 */
                tag(value) {
                    const ul = h.ul({ class: "entity-tag-list" });
                    for (let i = 0; i < value.length; i++) ul.append(h.li({ class: "entity-tag" }, value[i]));
                    return this.#tr("tag", ul);
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

        /** 从css中获取不需要显示的面板属性 */
        //prettier-ignore
        get ignoredPanelAttrs() {
            return getComputedStyle(this).getPropertyValue("--ignore-panel-attr").split(" ");
        }

        /**
         * @type {typeof HTMLElement.prototype.attachShadow}
         * @override 在 {@linkcode connectedCallback} 中被调用以达到自动创建shadowRoot的目的
         * @see HTMLElement#attachShadow
         */
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

        /**
         * @abstract
         * #### 内容更新函数 子类需要重写此函数以供属性变化时自动更新内容
         * ---
         * * **添加到文档时** 被 {@linkcode connectedCallback} 调用
         * * **关联属性更新时** 被 {@linkcode attributeChangedCallback} 调用
         */
        async contentUpdate() {
            this.#shadowRoot.innerHTML = "";
            this[$symbols.initStyle]();
            // 此函数被调用时意味着需要从LightDOM中获取内容
            await DOMContentLoaded;
            /** @type {Array<HTMLTemplateElement>} */
            const templates = [];
            /** @type {Array<HTMLElement>} */
            const children = [...this.children];
            for (let i = 0; i < children.length; i++) {
                /** @type {HTMLTemplateElement} */
                const element = children[i];
                if (element.tagName === "TEMPLATE") {
                    element.dataset.scope = true; //从LightDOM获取的内容需要隔离样式
                    templates.push(element);
                    element.remove(); // 不要移除其他元素 允许作为插槽内容嵌入
                }
            }
            if (templates.length) this.loadPanelContent(templates);
            else this.#loadSlotPanel();

            // 作为悬浮提示挂载到其它元素

            /** @type {Document|ShadowRoot} */
            const root = this.getRootNode();

            if (this.promptFor) {
                // 允许指定多个目标
                for (const id of this.promptFor.split(" ")) {
                    const target = root.getElementById(id);
                    if (!target) {
                        console.warn(`无法找到id=${id}的元素`);
                        continue;
                    }
                    if (target[promptMsg.symbol]) console.warn("被多个<noita-panel>绑定");
                    else {
                        target[promptMsg.symbol] = this;
                        h.$(target, { Event: promptMsg.event });
                    }
                }
                this.promptFor = "";
                this.remove();
            }
            if (this.promptForSelector) {
                for (const target of root.querySelectorAll(this.promptForSelector)) {
                    if (target[promptMsg.symbol]) console.warn("被多个<noita-panel>绑定");
                    else {
                        target[promptMsg.symbol] = this;
                        h.$(target, { Event: promptMsg.event });
                    }
                }
                this.promptForSelector = "";
                this.remove();
            }
        }

        #loadSlotPanel() {
            /* prettier-ignore */
            this.#shadowRoot.append(
                h.section({ class: "custom" },
                    h.slot(
                        h.p(
                            h.div(`使用多个<tempalte title="选项卡名称">内容</tempalte>以选项卡模式填充内容`),
                            h.div("或直接在内部以简易模式填充内容")
                        )
                    )
                )
            );
        }

        /**
         * 加载 template 内容 (多选项卡)
         * @param {Array<HTMLTemplateElement>} templates
         */
        loadPanelContent(templates) {
            this.#shadowRoot.innerHTML = "";
            /** @type {Array<HTMLLIElement>} */
            const lis = [];
            for (let i = 0; i < templates.length; i++) {
                const template = templates[i];
                const section = h.section({ role: "tabpanel", hidden: true });
                if (template.hasAttribute("class")) section.className = template.className;
                if (template.hasAttribute("style")) section.style.cssText = template.style.cssText;
                const { content, title, dataset } = template;
                if (dataset.scope) {
                    const shadowRoot = section.attachShadow({ mode: "open" });
                    const scriptCodes = [];
                    const styleCodes = [];
                    for (let i = 0; i < content.children.length; i++) {
                        const element = content.children[i];
                        switch (element.tagName) {
                            case "SCRIPT":
                                scriptCodes.push(element.text);
                                element.remove();
                                continue;
                            case "STYLE":
                                styleCodes.push(element.textContent);
                                element.remove();
                                continue;
                        }
                    }
                    shadowRoot.adoptedStyleSheets = [css(styleCodes.join(""))];
                    shadowRoot.append(content);
                    Function("h", scriptCodes.join("\n")).bind(shadowRoot, h)();
                } else section.append(content);

                const li = h.li({ role: "tab", tabindex: 0, Event: panelTabsSwitch, $: { content: section } }, h.span(title));
                if (template.hasAttribute("default")) lis.$default = li;
                lis[i] = li;
                this.#shadowRoot.append(section);
            }
            lis.$default ??= lis[0];
            if (templates.length > 1) {
                this.#shadowRoot.prepend(h.menu({ role: "tablist" }, lis));
                lis.$default.click();
            } else this.#shadowRoot.childNodes[0].removeAttribute("role"); // 移除选项卡面板无障碍语义
            lis.$default.content.hidden = false;
        }

        connectedCallback() {
            this.attachShadow({ mode: "open" });
            this.contentUpdate();
        }

        //prettier-ignore
        get [Symbol.toStringTag]() { return "HTMLNoitaPanelElement" }

        attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue === null || oldValue === void 0) return;
            if (newValue !== oldValue && this.isConnected) this.contentUpdate(); //contentUpdate 会优先调用子类重写的版本
        }
    };
})();
customElements.define("noita-panel", freeze(Base));
