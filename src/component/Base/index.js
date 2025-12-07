const globalCSS = css(embed(`#base.css`), { name: "base" });
const $css = Symbol("css");
const $content = Symbol("content");
const Base = (() => {
    const styleSheet = {
        icon: css(embed(`#icon.css`), { name: "base-icon" }),
        panel: css(embed(`#panel.css`), { name: "base-panel" })
    };

    embed(`#db.js`);

    PanelAttrInfo.Icon.urls.then(urls => urls.forEach(url => styleSheet.panel.insertRule(`[src="${url}"]{mask:url("${url}") center/100% 100%}`)));

    const panelTabsSwitch = (() => {
        class TabChangeEvent extends Event {
            /**
             * @param {string} from
             * @param {string} to
             */
            constructor(from, to) {
                super("tabchange");
                this.from = from;
                this.to = to;
                freeze(this);
            }
        }
        /**
         * ### 左右方向键导航
         * @param {HTMLLIElement} element 当前元素
         * @param {number} offset 偏移量
         */
        const navigate = (element, offset) => {
            /** @type {NodeListOf<HTMLLIElement>} */
            const elements = element.parentElement.childNodes; // 获取所有选项卡
            for (let i = 0; i < elements.length; i++) {
                if (elements[i] === element) return elements[i + offset]?.focus(); // 尝试聚焦目标选项卡
            }
        };

        const main = li => {
            /** @type {ShadowRoot} */
            const shadowRoot = li.getRootNode();

            /** @type {HTMLElement} */
            const targetPanel = li.content;
            if (!targetPanel.hidden) return;
            const [menu, , ...sections] = [...shadowRoot.childNodes];
            for (const e of sections) e.hidden = e !== targetPanel;
            let from = null,
                to = li.content;
            for (const e of menu.childNodes) {
                if (e.getAttribute("aria-selected") === "true") {
                    from = e.content;
                    e.setAttribute("aria-selected", "false");
                }
            }
            li.setAttribute("aria-selected", "true");
            shadowRoot.host.dispatchEvent(new TabChangeEvent(from, to));
        };
        return {
            main,
            event: {
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
                        main(event.currentTarget); // 切换到该选项卡
                    } else if (event.key === "Escape") event.target.blur(); // 退出焦点
                    else if (event.key === "ArrowLeft") navigate(event.currentTarget, -1); // 左
                    else if (event.key === "ArrowRight") navigate(event.currentTarget, 1); // 右
                    else if (event.key === "ArrowDown") {
                        // 下
                        /** @type {ShadowRoot} */
                        const shadowRoot = event.currentTarget.getRootNode();
                        shadowRoot.querySelector("h1").focus();
                    }
                }
            }
        };
    })();

    //#region 面板属性加载器
    const { roundTo } = _Math;

    const panelInfoSwitch = (() => {
        const main = target => {
            /** @type {boolean} 强制隐藏 */
            let forceToHidden = false;
            for (const li of target.parentElement.children) {
                /** @type {"true"|"false"} */
                const ariaSelected = li.getAttribute("aria-selected");
                if (ariaSelected === "true") {
                    // 再次选择已选中的选项卡将隐藏内容
                    if (li === target) forceToHidden = true;
                    li.setAttribute("aria-selected", "false");
                } else li.setAttribute("aria-selected", li === target);
            }

            //prettier-ignore
            for (const element of target.relatedSectionElements) 
                element.hidden = element.dataset.relatedId !== target.dataset.relatedId || forceToHidden;
        };

        return {
            main,
            event: {
                focus: soundEffect.select,
                // mouseenter: soundEffect.select,
                click: event => {
                    soundEffect.click();
                    main(event.currentTarget);
                },
                keydown: event => {
                    if (event.key === "Enter") {
                        soundEffect.click();
                        main(event.currentTarget);
                    } else if (event.key === "Escape") event.target.blur();
                },
                /** @param {MouseEvent} event  */
                mouseenter(event) {
                    soundEffect.select();
                    /** @type {HTMLLIElement & {relatedSectionElements:Array<HTMLElement>}} */
                    const li = event.currentTarget;
                    for (const element of li.relatedSectionElements) {
                        if (element.dataset.relatedId !== li.dataset.relatedId) continue;
                        element.classList.add("active");
                    }
                },
                /** @param {MouseEvent} event  */
                mouseleave(event) {
                    /** @type {HTMLLIElement & {relatedSectionElements:Array<HTMLElement>}} */
                    const li = event.currentTarget;
                    for (const element of li.relatedSectionElements) {
                        if (element.dataset.relatedId !== li.dataset.relatedId) continue;
                        element.classList.remove("active");
                    }
                }
            }
        };
    })();

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
            main,
            event: {
                focus: soundEffect.select,
                mouseenter: soundEffect.select,
                click: event => {
                    soundEffect.click();
                    main(event.target);
                },
                keydown: event => {
                    if (event.key === "Enter") {
                        soundEffect.click();
                        main(event.target);
                    } else if (event.key === "Escape") event.target.blur();
                }
            }
        };
    })();

    /**
     * 切换显示相互关联的<tr>的内容
     */
    const trContentSwitch = (() => {
        const relateDataSymbol1 = Symbol("relateData1");
        const relateDataSymbol2 = Symbol("relateData2");
        /**
         * @param {HTMLTableRowElement} element
         */
        const main = element => {
            const relateData1 = element[relateDataSymbol1];
            const relateData2 = element[relateDataSymbol2];

            if (element.classList.contains(relateData1.className)) {
                element.replaceChildren(...relateData2.content);
                element.classList.replace(relateData1.className, relateData2.className);
                return;
            }
            element.replaceChildren(...relateData1.content);
            element.classList.replace(relateData2.className, relateData1.className);
        };

        return {
            relateDataSymbol1,
            relateDataSymbol2,
            main,
            event: {
                focus: soundEffect.select,
                mouseenter: soundEffect.select,
                click: ({ currentTarget }) => {
                    soundEffect.click();
                    main(currentTarget);
                },
                keydown: ({ key, currentTarget }) => {
                    if (key === "Enter") {
                        soundEffect.click();
                        main(currentTarget);
                    } else if (key === "Escape") currentTarget.blur();
                }
            }
        };
    })();

    class PanelAttrLoader {
        /** @type {{[key:string]: HTMLElement}} */
        static #tagHoverPanelMap;
        static #modifierTips = {};
        /** @type {HTMLElement} */
        static #modifierTipsBefore;
        /** @type {HTMLElement} */
        static #modifierTipsAfter;
        static {
            runAtEnd(() => {
                const style = { display: "flex", placeItems: "center", gap: "8px" };
                this.#tagHoverPanelMap = {
                    projectile: h`noita-panel`("视作投射物，影响对投射物实体的选取判断。"),
                    projectile_player: h`noita-panel`("可引导 路奇仆从 的攻击目标。"),
                    prey: h`noita-panel`(h.div({ style }, "会被", new Spell({ exp: "#DEATH_CROSS", display: "list" }), "提供的投射物追踪。")),
                    homing_target: h`noita-panel`(h.div({ style }, "成为可追踪的目标，同时也会影响", new Spell({ id: "IF_ENEMY" }), "的判断且允许被", new Spell({ id: "AREA_DAMAGE" }), "提供的伤害领域伤害。")),
                    helpless_animal: h`noita-panel`("视作无辜生命。"),
                    hittable: h`noita-panel`("允许实体被命中。"),
                    mortal: h`noita-panel`("被视作常规生命体。"),
                    egg_item: h`noita-panel`("视为 蛋，可用于召唤门神BOSS"),
                    curse_NOT: h`noita-panel`(h.div({ style }, "不受", new Spell({ id: "CURSE" }), "的影响")),
                    polymorphable_NOT: h`noita-panel`("不受变形影响"),
                    glue_NOT: h`noita-panel`("不受到胶球的粘连"),
                    rocket: h`noita-panel`(h.div({ style }, "属于", h.span({ style: { color: "#ccc" } }, "魔法飞弹"), "系列投射物，不会被 ", new Spell({ id: "ALL_ROCKETS" }), " 转换。")),
                    black_hole: h`noita-panel`(h.div({ style }, "属于", h.span({ style: { color: "#ccc" } }, "黑洞"), "系列投射物，不会被 ", new Spell({ id: "ALL_BLACKHOLES" }), " 转换。")),
                    death_cross: h`noita-panel`(h.div({ style }, "属于", h.span({ style: { color: "#ccc" } }, "死亡十字"), "系列投射物，不会被 ", new Spell({ id: "ALL_DEATHCROSSES" }), " 转换。")),
                    disc_bullet_big: h`noita-panel`(h.div({ style }, "属于", h.span({ style: { color: "#ccc" } }, "大型圆锯"), "系列投射物，不会被 ", new Spell({ id: "ALL_DISCS" }), " 转换。")),
                    nuke: h`noita-panel`(h.div({ style }, "属于", h.span({ style: { color: "#ccc" } }, "核弹"), "系列投射物，不会被 ", new Spell({ id: "ALL_NUKES" }), " 转换。")),
                    nuke_giga: h`noita-panel`(h.div({ style }, "属于", h.span({ style: { color: "#ccc" } }, "核弹"), "系列投射物，不会被 ", new Spell({ id: "ALL_NUKES" }), " 转换。")),
                    destruction_target: h`noita-panel`(h.div({ style }, "可被", new Spell({ id: "DESTRUCTION" }), " 清除的目标。")),
                    touchmagic_immunity: h`noita-panel`(h.div({ style }, "不受", new Spell({ exp: "#TOUCH", display: "list" }), "造成的诅咒伤害。")),
                    necrobot_NOT: h`noita-panel`(h.div({ style }, "不可被复活机器人复活为死灵。")),
                    boss: h`noita-panel`(h.div({ style }, "头目")),
                    miniboss: h`noita-panel`(h.div({ style }, "小头目")),
                    enemy: h`noita-panel`(h.div({ style }, "敌人")),
                    robot: h`noita-panel`(h.div({ style }, "机器人"))
                };
                this.#modifierTips = {
                    after: h`noita-panel`("后置修正"),
                    before: h`noita-panel`("前置修正")
                };
            });
        }
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
                if (type === "*") type = "×";
                if (hidden) continue;
                /** @type {HTMLTableRowElement} */
                let target = null;
                //prettier-ignore
                $:switch (prop) {
                    case "effectInterval": //==== 作用间隔
                    case "damageInterval": //==== 伤害间隔
                    case "fireRateWait": //====== 施放延迟
                    case "reloadTime": //======== 充能时间
                        target = this.castCD(prop, value,type); break;
                    case "duration": //========== 持续时间 
                        target = this.duration(value); break;
                    case "lifetime": //========== 存在时间
                    case "lifetimeMax": //========== 最大存在时间
                        target = this.lifetime(prop,value, type); break;
                    case "manaChargeSpeed": //=== 法力充能速度
                        target = this.manaChargeSpeed(value); break;
                    case "spreadDegrees": //===== 散射角度
                        target = this.spreadDegrees(value, type); break;
                    case "collideWithShooterFrames": //==== 自命中延迟
                        target = this.collideWithShooterFrames(value); break;
                    case "speedMultiplier": //=== 投射物速度倍数
                        target = this.#tr(prop,type + value); break;
                    case "speedMax": //========== 投射物速度上限
                        target = this.speedMax(value); break;
                    case "speed": //============= 投射物速度
                        target = this.speed(value); break;
                    case "damageCriticalChance": // 暴击率
                        target = this.#tr("damageCriticalChance", type + value + "%"); break;
                    case "maxUse": //============== 最大使用次数
                    case "remainingUse": //======== 剩余使用次数
                        target = this.timesUsed(prop, value); break;
                    case "draw": //================ 抽取数
                        target = this.draw(value); break;
                    case "manaMax": //============= 最大法力
                    case "capacity": //============ 容量
                        target = this.#tr(prop, value.toString()); break;
                    case "unlock":
                        target = this.unlock(value); break;
                    case "projectilesProvided":
                    case "projectilesUsed":
                    case "loadEntities":
                    case "extraEntities":
                    case "gameEffectEntities":
                        target = this.offerEntity(prop, value); break;
                    case "bloodMaterial":
                        target = this.bloodMaterial(value.hurt, value.die); break;
                    case "trigger":
                        target = this.trigger(value); break;
                    case "tag":
                        target = this.tag(value); break;
                    // 爆炸伤害和爆炸半径需要根据爆炸条件做出特殊样式处理
                    case "explosionDamage":
                    case "explosionRadius":
                    case "explosionDestroyEnergy":
                        target = this.#tr(prop, type + value);
                        //不爆炸时启用disable样式
                        if(datas.explosionTrigger?.hidden === true) target.classList.add("disable");
                        break;
                    case "destroyDurability":
                        target = this.destroyDurability(prop, value); break;
                    case "explosionDestroyDurability":
                        target = this.destroyDurability(prop, value);
                        //不爆炸时启用disable样式
                        if(datas.explosionTrigger?.hidden === true) target.classList.add("disable");
                        break;
                    case "explosionCreateMaterial":
                        target = this.explosionCreateMaterial(value);
                        //不爆炸时启用disable样式
                        if(datas.explosionTrigger?.hidden === true) target.classList.add("disable");
                        break;
                    case "material":
                    case "trailMaterial":
                    case "particleMaterial":
                    case "materialConvertTo":
                        target = this.material(prop,type,value); break;
                    case "price":
                        target = this.price(value); break;
                    case "effectType":
                        target = this.effectType(value); break;
                    case "materialDamages":
                        target = this.materialDamages(value); break;
                    case "homingTarget":
                    case "target":
                    case "collideWithTag":
                        target = this.tagFilter(prop,value); break;
                    case "eatMaterials":
                    case "ignoredEatMaterials":
                        target = this.materialList(prop,value); break;
                    case "materialConvertMap":
                        target = this.materialConvertMap(value); break;
                    default:
                        // 伤害/承伤 属性
                        for(const damageType of DamageData.types) {
                            if(prop.startsWith(damageType) ) {
                                if(prop.endsWith("Damage") || prop.endsWith("DamageMultiplier")) {
                                    target = this.#tr(prop, type + value);
                                    break $;
                                }
                            }
                        }
                        if(prop.startsWith("var.")) {
                            target = this.vars(prop,value);
                            break $;
                        }
                        if(value === true)  {
                            this.#addBooleanFlag(prop);
                            continue;
                        }
                        if(value === false) continue;
                        target = this.default(prop,value,type);
                }
                if (pos) {
                    hoverMsg.attach(target.children[1], PanelAttrLoader.#modifierTips[pos]);
                    target.children[1].classList.add(pos);
                }
                this.container.append(target);
            }

            if (this.#booleanFlagTd.childElementCount) {
                const tr = this.#tr("booleanFlag");
                tr.append(this.#booleanFlagTd);
                this.container.append(tr);
            }
            return this;
        }

        #booleanFlagTd = h.td({ class: "boolean-flag-group" });
        /**
         * 加载boolean属性属性到一行中
         * @param {string} prop
         */
        #addBooleanFlag(prop) {
            const codeStyle = { color: "#1f9cf0", fontFamily: "Fira Code, JetBrains Mono, sans-serif", border: "1px solid #555", borderRadius: "4px", padding: "2px", margin: "2px", background: "#1f1f1f80", width: "fit-content" };
            const map = {
                collideWithEntities: h(h.div({ style: codeStyle }, "collide_with_entities"), h.div("允许命中实体。")),
                collideWithWorld: h(h.div({ style: codeStyle }, "collide_with_world"), h.div("允许命中地形。")),
                onCollisionDie: h(h.div({ style: codeStyle }, "on_collision_die"), h.div("命中地形或实体后失效。")),
                penetrateEntities: h(h.div({ style: codeStyle }, "penetrate_entities"), h.div("无论是否具有碰撞失效特性，命中实体后都不会失效，但是无法对重复命中同一实体。")),
                penetrateWorld: h(h.div({ style: codeStyle }, "penetrate_world"), h.div("不再命中地形。")),
                friendlyFire: h(h.div({ style: codeStyle }, "friendly_fire"), h.div("可以命中友方单位")),
                doMovetoUpdate: h(h.div({ style: codeStyle }, "do_moveto_update"), h.div("不会命中实体，一般为炸弹类型实体。"))
            };
            let desc = "";
            const content = map[prop];
            if (content) desc = h`noita-panel`({ "prompt-for-parent": "true" }, content);
            const { icon, name, className = "" } = PanelAttrInfo.query(prop);
            this.#booleanFlagTd.append(h.div({ class: "boolean-flag-item" }, icon, name, desc));
        }

        /**
         * 创建单位数据单元格
         * @param {String} s
         * @param {String} f
         */
        #createUnitDataTd(s, f) {
            const spanSecond = h.span({ dataset: { time: "second" }, hidden: this.#timeUnit === "f" }, s);
            const spanFrame = h.span({ dataset: { time: "frame" }, hidden: this.#timeUnit === "s" }, f);
            const td = h.td({ Event: unitConvert.event, dataset: { useShiftConvert: true } }, spanSecond, spanFrame);
            td[contentConvertFn.fnSymbol] = () => unitConvert.main(td);
            return td;
        }

        /**
         * 创建可切换内容的 <tr>
         * @param {{prop:string,content:Node|string}} opt1
         * @param {{prop:string,content:Node|string}} opt2
         */
        #createSwitchTr(opt1, opt2) {
            const tr = h.tr();
            {
                const { icon, name, className = "" } = PanelAttrInfo.query(opt1.prop);
                tr[trContentSwitch.relateDataSymbol1] = { className, content: [h.th(icon), h.th(name), h.td(opt1.content)] };
                tr.classList.add(className);
                tr.append(...tr[trContentSwitch.relateDataSymbol1].content);
            }
            {
                const { icon, name, className = "" } = PanelAttrInfo.query(opt2.prop);
                tr[trContentSwitch.relateDataSymbol2] = { className, content: [h.th(icon), h.th(name), h.td(opt2.content)] };
            }
            tr[contentConvertFn.fnSymbol] = () => trContentSwitch.main(tr);
            return h.$(tr, { Event: trContentSwitch.event, dataset: { useShiftConvert: true } });
        }

        /**
         * 加载属性表行
         * @param {string} prop
         * @param {string|Node} [content]
         * @returns {HTMLTableRowElement}
         */
        #tr(prop, content) {
            const { icon, name, className = "" } = PanelAttrInfo.query(prop);
            const tr = h.tr({ class: className }, h.th(icon), h.th(name));
            if (content) tr.append(h.td(content));
            return tr;
        }

        /**
         * @param {number} value
         */
        speedMax(value) {
            const tr = this.#tr("speedMax");
            tr.append(this.#createUnitDataTd(value + "px/s", roundTo(GameTime.toS(value)) + "px/f"));
            return tr;
        }
        /**
         * @param {RangeValue} value
         */
        speed(value) {
            const tr = this.#tr("speed");
            /* prettier-ignore */
            tr.append(this.#createUnitDataTd(
                value.toString("px/s"),
                value.withChange(GameTime.toS).withChange(roundTo).toString("px/f"))
            );
            return tr;
        }

        /**
         * 加载`施放延迟`|`充能时间`面板属性
         * @param {"fireRateWait"|"reloadTime"|"damageInterval"} prop CD类型
         * @param {number|RangeValue} value
         * @param {Boolean|String} [sign]
         */
        castCD(prop, value, sign) {
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
            const tr = this.#tr(prop);
            tr.append(this.#createUnitDataTd(s, f));
            return tr;
        }
        /**
         * 加载`存在时间`面板属性
         * @param {"lifetime"|"lifetimeMax"} prop
         * @param {number|RangeValue} value
         * @param {Boolean|String} [sign]
         */
        lifetime(prop, value, sign) {
            let s, f;
            const tr = this.#tr(prop);

            if (typeof value === "number") {
                const time = new GameTime(value);
                s = sign + time.s;
                f = sign + time.f;
                if (!sign && value === -1) {
                    s += " (永久)";
                    f += " (永久)";
                }
            } else {
                if (value.isFixed) {
                    const time = new GameTime(value.median);
                    s = time.s;
                    f = time.f;
                    if (value.median === -1) {
                        s += " (永久)";
                        f += " (永久)";
                    }
                } else {
                    const { median } = value;
                    hoverMsg.attachWithPanel(tr, [h.pre(`标准值:${median}f\n波动:±${value.max - median}f`)]);
                    const min = new GameTime(value.min);
                    const max = new GameTime(value.max);
                    s = min.s + " ~ " + max.s;
                    f = min.f + " ~ " + max.f;
                }
            }
            tr.append(this.#createUnitDataTd(s, f));
            return tr;
        }
        /**
         * 加载`持续时间`面板属性
         * @param {number} value
         */
        duration(value) {
            let { s, f } = new GameTime(value);
            if (value === -1) {
                s += " (永久)";
                f += " (永久)";
            }
            const tr = this.#tr("duration");
            tr.append(this.#createUnitDataTd(s, f));
            return tr;
        }

        /**
         * 自命中延迟
         * @param {number} value
         */
        collideWithShooterFrames(value) {
            let { s, f } = new GameTime(value);
            if (value === -1) {
                s += " (永久)";
                f += " (永久)";
            }
            const tr = this.#tr("collideWithShooterFrames");
            tr.append(this.#createUnitDataTd(s, f));
            return tr;
        }
        /**
         * 加载`GameEffect`类型面板属性
         * @param {string} value
         */
        effectType(value) {
            const tr = this.#tr("effectType");
            const map = {
                PROTECTION_ALL: "神佑",
                PROTECTION_PROJECTILE: "投射物免疫",
                PROTECTION_RADIOACTIVITY: "绿毒免疫",
                PROTECTION_MELEE: "近战免疫",
                PROTECTION_EXPLOSION: "爆炸免疫",
                PROTECTION_FREEZE: "冰冻免疫",
                PROTECTION_FIRE: "火焰免疫",
                PROTECTION_ELECTRICITY: "雷电免疫",
                STUN_PROTECTION_FREEZE: "冻结免疫",
                STUN_PROTECTION_ELECTRICITY: "电晕免疫",
                TELEPORTATION: "传送",
                WET: "潮湿",
                OILED: "油污",
                BLOODY: "染血",
                FROZEN: "冻结",
                POISON: "中毒",
                ON_FIRE: "燃烧",
                DRUNK: "醉酒",
                ALLERGY_RADIOACTIVE: "绿毒过敏",
                RAINBOW_FARTS: "彩虹屁"
            };
            tr.append(h.td(map[value] ?? value));
            return tr;
        }
        /**
         * 加载`法力恢复速度`面板属性
         * @param {number|RangeValue} value
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
         * @param {number|RangeValue} value
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
         * @param {"maxUse"|"remainingUse"} prop
         * @param {{max:number,remain:number?,unlimited:Boolean}} value
         */
        timesUsed(prop, value) {
            const content = h.data();
            const unlimitedPerkIcon = h.div({ style: { verticalAlign: "top", zoom: 2 } }, h.img({ is: "noita--perk", dataset: { id: "UNLIMITED_SPELLS" } }));
            if (value.unlimited) {
                unlimitedPerkIcon.style.display = "inline-grid";
                hoverMsg.attachWithPanel(content, "可无限化");
            } else {
                unlimitedPerkIcon.classList.add("invalid");
                hoverMsg.attachWithPanel(content, "不可无限化");
            }
            if (prop === "remainingUse") content.append(`${value.remain}/`);
            content.append(`${value.max} `, unlimitedPerkIcon);
            return this.#tr(prop, content);
        }

        /**
         * @param {number|{drawCount_Death:number,drawCount_Hit:number,drawCount_Timer:number,drawDelay_Timer:number}|RangeValue} [value]
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
         * @param {import("@spell").SpellData.SpawningData} spawn 生成数据
         */
        unlock({ requiresFlag, manualUnlock }) {
            return this.#createSwitchTr({ prop: "lock", content: "* ".repeat(Math.min(requiresFlag.length, 5)) }, { prop: "unlock", content: requiresFlag + (manualUnlock ? " (手动解锁)" : "") });
        }

        /**
         * 加载`价格 ⇌ 价格基准`
         * @param {import("@spell").SpellData.Price} value
         */
        price(value) {
            return this.#createSwitchTr({ prop: "price", content: value.toString() }, { prop: "priceBase", content: value.valueOf() });
        }

        /**
         * 加载`提供投射物`|`使用投射物`属性
         * @param {"projectilesProvided"|"projectilesUsed"|"loadEntities"} prop
         * @param {Array<HTMLLIElement>} lis
         */
        offerEntity(prop, lis) {
            const menu = h.menu({ class: "entities-tablist", role: "tablist" }, lis); //无障碍: 选项卡列表

            // 这里应该让首个实体选项卡默认隐藏 其余的默认显示
            // 此后的点击事件将会反转所有显示状态以达到首个显示 其余隐藏的目的
            for (const li of lis) h.$(li, { role: "tab", "aria-selected": "true", Event: panelInfoSwitch.event });
            lis[0].setAttribute("aria-selected", "false");
            panelInfoSwitch.main(lis[0]); //提供的数据会全部展示 此处点击以实现仅显示首个投射物信息
            if (menu.innerText.length > 100) menu.style.flexDirection = "column";
            return this.#tr(prop, menu);
        }

        /**
         * 加载`血液材料(尸体材料)`属性
         * @param {String} valueHurt
         * @param {String} valueDie
         */
        bloodMaterial(valueHurt, valueDie) {
            let content = h();
            if (valueHurt === "") content.append("无");
            else {
                const { name } = Material.queryById(valueHurt);
                const icon = h.img({ is: "noita--material", title: valueHurt, dataset: { id: valueHurt }, class: "material-icon" });
                content.append(icon, name);
            }
            if (valueDie !== valueHurt && valueDie !== "") {
                const { name } = Material.queryById(valueDie);
                const icon = h.img({ is: "noita--material", title: valueDie, dataset: { id: valueDie }, class: "material-icon" });
                content.append(",", icon, name);
            }
            return this.#tr("bloodMaterial", content);
        }

        /**
         *
         * @param {{type:"ON_HIT"|"ON_TIMER"|"ON_DEATH",delay:RangeValue?}} value
         */
        trigger(value) {
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
            const uselessTag = ["pipe_bomb", "teleportable_NOT", "player_projectile"];
            for (const tag of value) {
                if (uselessTag.includes(tag)) continue; // 这个标签暂时没有意义
                if (tag.startsWith("music_energy")) continue; // 不知道干什么的
                const li = h.li({ class: "entity-tag" }, tag);
                hoverMsg.attach(li, PanelAttrLoader.#tagHoverPanelMap[tag]);
                ul.append(li);
            }
            const tr = this.#tr("tag", ul);
            if (ul.children.length === 0) tr.hidden = true;
            return tr;
        }

        materialConvertMap(value) {
            const table = h.table({ class: "material-convert-map" });
            for (const [from, to] of Object.entries(value)) {
                // console.log({ from, to });

                const fromtd = h.td();
                if (from.startsWith("[")) fromtd.append(h.span({ class: "material-tag" }, from));
                else if (from === "*") fromtd.append(h.span("任何"));
                else {
                    fromtd.append(h.img({ is: "noita--material", title: from, dataset: { id: from }, class: "material-icon" }), Material.queryById(from).name);
                }
                table.append(
                    /* prettier-ignore */
                    h.tr(
                        fromtd,
                        h.td("⇒"),
                        h.td(h.img({ is: "noita--material", title: to, dataset: { id: to }, class: "material-icon" }), Material.queryById(to).name)
                    )
                );
            }
            return this.#tr("materialConvertMap", table);
        }

        /**
         *
         * @param {"material"|"trailMaterial"|"particleMaterial"|"materialConvertTo"} prop
         * @param {"+"|"="} type
         * @param {string} value
         */
        material(prop, type, value) {
            const { name } = Material.queryById(value);
            const icon = h.img({ is: "noita--material", title: value, dataset: { id: value }, class: "material-icon" });
            return this.#tr(prop, h(type, icon, name));
        }

        /**
         * 加载`材料伤害`面板属性
         * @param {{[key:string]:number}} value
         */
        materialDamages(value) {
            const table = h.table({ class: "material-damage-data-table" });
            const sorted = Object.entries(value).toSorted(([, a], [, b]) => b - a);
            for (const [materialID, damage] of sorted) {
                const icon = h.img({ is: "noita--material", title: materialID, dataset: { id: materialID }, class: "material-icon" });
                const { name } = Material.queryById(materialID);
                const tr = h.tr(h.th(icon, `${name}`), h.td(h.data(damage)));
                table.append(tr);
            }
            return this.#tr("materialDamages", table);
        }

        /**
         * 加载材料列表类属性面板
         * @param {string} prop
         * @param {{enum:Array<string>,tag:string}} value
         */
        materialList(prop, value) {
            const ul = h.ul({ class: "material-list" });
            for (const id of value.enum) {
                const icon = h.img({ is: "noita--material", title: id, dataset: { id }, class: "material-icon" });
                ul.append(h.li(icon, Material.queryById(id).name));
            }
            if (value.tag) ul.append(h.li({ class: "material-tag" }, PanelAttrInfo.query("tag").icon, value.tag));
            return this.#tr(prop, ul);
        }

        /**
         *
         * @param {"destroyDurability"|"explosionDestroyDurability"} prop
         * @param {number} value
         */
        destroyDurability(prop, value) {
            const tr = this.#tr(prop);
            const map = [
                "glass_box2d", //   0
                ,
                "rock_eroding", //  2
                "fungus_powder", // 3
                "sand", //          4
                "cheese_static", // 5
                ,
                ,
                "coal", //          8
                "wood", //          9
                "rock_static", //   10
                "steelmoss_static", // 11
                "gold", // 12
                "steel_grey_static", // 13
                "templerock_static", // 14
                "mat_gem_box2d_red", // 15
                "mat_gem_box2d_red" // 16
            ];
            const container = h.div({ class: "destroy-durability", style: { width: value > 9 ? "48px" : "32px" } });
            if (Number.isFinite(value)) {
                container.append(getPixelFontsImg(value));
                let materialId = map[value];
                while (!materialId) materialId = map[--value];
                /** @type {HTMLImageElement} */
                const img = Material.queryById(materialId).icon;
                img.addEventListener("load", () => container.style.setProperty("--img", `url(${img.getAttribute("src")})`));
                img.connectedCallback();
            } else container.append("任何");
            const td = h.td(container);
            tr.append(td);
            return tr;
        }

        /**
         *
         * @param {string} prop
         * @param {{string:string,int:number,float:number,boolean:boolean}} values
         */
        vars(prop, values) {
            let name = prop;
            let value = "";
            if (prop === "var.projectile_file") {
                name = "投射物路径";
                value = h.span({ style: { "--font-size": "16px" } }, values.string);
            } else if (prop === "var.orbit_projectile_type") {
                name = "环绕投射物";
                value = h.span({ style: { "--font-size": "18px" } }, values.string);
            } else if (prop === "var.colour_name") {
                name = "染色";
                value = values.string;
            } else if (prop === "var.orbit_projectile_speed") {
                name = "环绕投射物速度";
                value = values.float;
            } else if (prop === "var.true_orbit_dist") {
                name = "环绕距离";
                value = values.float;
            } else if (prop === "var.true_orbit_dir") {
                name = "环绕方向";
                value = values.float;
            } else if (prop === "var.chain_shot") {
                name = "已连锁次数";
                value = values.float;
            } else if (prop === "var.prev_entity_id") {
                name = "上次目标";
                value = values.float;
            } else if (prop === "var.prev_prev_entity_id") {
                name = "上上次目标";
                value = values.float;
            }
            const { icon } = PanelAttrInfo.query("execute");
            const tr = h.tr(h.th(icon), h.th(name), h.td(value));
            // if (name === prop) tr.hidden = true;
            return tr;
        }

        /** @param {string} value */
        explosionCreateMaterial(value) {
            const [materialId, prob] = value.split(":");
            const { name } = Material.queryById(materialId);
            const icon = h.img({ is: "noita--material", title: value, dataset: { id: materialId }, class: "material-icon" });
            return this.#tr("explosionCreateMaterial", h(icon, `${name}(${prob}%)`));
        }

        /**
         * 加载标签过滤器类属性面板
         * @param {string} prop
         * @param {string} value
         */
        tagFilter(prop, value) {
            return this.#tr(prop, h.span({ class: "entity-tag" }, PanelAttrInfo.query("tag").icon, value));
        }

        /**
         * 加载面板属性(无特殊处理)
         * @param {PanelAttrIDEnum} type
         * @param {number|String} value
         * @param {Boolean|String} sign
         */
        default(type, value, sign) {
            let content;
            if (value instanceof Node) content = value;
            else content = sign + value;
            return this.#tr(type, content);
        }
    }
    //#endregion

    return class HTMLNoitaElement extends $extends(HTMLElement, {
        /** @type {$ValueOption<"panel">} */
        displayMode: { name: "display", $default: "panel" },
        /** @type {$ValueOption<"common"|"white">} */
        borderStyle: { name: "border-style", $default: "common" },
        /** @type {$ValueOption<string>} */
        promptFor: { name: "prompt-for", $default: "", resetContent: false },
        /** @type {$ValueOption<boolean>} */
        promptForParent: { name: "prompt-for-parent", resetContent: false },
        /** @type {$ValueOption<string>} */
        promptForSelector: { name: "prompt-for.selector", $default: "", resetContent: false }
    }) {
        /** @type {ShadowRoot} */
        #shadowRoot;
        /** 用于确定是否已经渲染过内容 */
        #rendered = false;

        static PanelAttrInfo = PanelAttrInfo;

        /** 面板属性加载器 */
        static PanelAttrLoader = PanelAttrLoader;

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

        /**
         * 子类重写该对象以添加样式表
         * 样式表将继承父类的样式表
         */
        static [$css] = {
            base: [globalCSS],
            icon: [globalCSS, styleSheet.icon],
            panel: [globalCSS, styleSheet.panel]
        };

        /**
         * 递归获取构造器原型链中的样式表
         * @param {string} displayMode
         * @returns {Array<CSSStyleSheet>}
         */
        #getStyleSheets(displayMode, sheets = [], constructor = this.constructor) {
            /** @type {Array<CSSStyleSheet>} */
            const targetSheets = constructor[$css][displayMode] ?? constructor[$css].base;
            sheets.unshift(...targetSheets);
            if (constructor[$css] === Base[$css]) return sheets;
            return this.#getStyleSheets(displayMode, sheets, Object.getPrototypeOf(constructor));
        }

        async contentUpdate() {
            if (this.#rendered) return;
            let { displayMode } = this;
            if (displayMode.startsWith("panel")) displayMode = "panel";
            else if (displayMode.startsWith("icon")) displayMode = "icon";
            this.#shadowRoot.adoptedStyleSheets = this.#getStyleSheets(displayMode);
            this[$content]();
        }

        /**
         * 子类重写此函数以加载不同内容
         */
        async [$content]() {
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
            else {
                /* prettier-ignore */
                this.#shadowRoot.append(
                    h.div({class:"background"}),
                h.section(
                    h.slot(h.pre(`使用多个<tempalte title="选项卡名称">内容</tempalte>以选项卡模式填充内容\n或直接在内部以简易模式填充内容`))
                    ),
                    
                );
            }
        }

        /**
         * 加载 template 内容 (多选项卡)
         * @param {Array<HTMLTemplateElement>} templates
         */
        loadPanelContent(templates) {
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

                const li = h.li({ role: "tab", "aria-selected": "false", tabindex: 0, Event: panelTabsSwitch.event, $: { content: section } }, h.span(title));
                // li.switch = panelTabsSwitch.main(li);
                if (template.hasAttribute("data-default")) lis.$default = li;
                lis[i] = li;
                this.#shadowRoot.append(section);
            }
            lis.$default ??= lis[0];
            this.#shadowRoot.prepend(h.div({ class: "background" }));
            if (templates.length > 1) {
                this.#shadowRoot.prepend(h.menu({ role: "tablist" }, lis));
                panelTabsSwitch.main(lis.$default);
            } else this.#shadowRoot.childNodes[0].removeAttribute("role"); // 移除选项卡面板无障碍语义
            lis.$default.content.hidden = false;
        }

        connectedCallback() {
            if (this.shadowRoot) contentConvertFn.add(this.shadowRoot);

            if (this.#rendered) return;
            this.attachShadow({ mode: "open" });
            this.#shadowRoot.innerHTML = "";

            this.contentUpdate();
            this.#rendered = true; // 防止重复渲染

            // 作为悬浮提示挂载到其它元素
            /**
             * 为元素添加悬浮提示
             * @param {HTMLElement} target
             */
            const addPromptMsgTo = target => hoverMsg.attach(target, this);
            if (this.promptForParent) {
                const parent = this.parentElement ?? this.parentNode?.host;
                if (parent) addPromptMsgTo(parent);
                else console.warn(`父元素不存在`);
                this.promptForParent = null;
                this.remove();
            }

            if (this.promptFor) {
                // 允许指定多个目标
                for (const id of this.promptFor.split(" ")) {
                    const target = this.getRootNode().getElementById(id);
                    if (!target) {
                        console.warn(`无法找到id=${id}的元素`);
                        continue;
                    }
                    addPromptMsgTo(target);
                }
                this.promptFor = null;
                this.remove();
            }
            if (this.promptForSelector) {
                /** @type {Document|ShadowRoot|Element} */
                const root = this.parentElement ?? this.getRootNode();
                const { promptForSelector } = this;
                this.promptForSelector = null;
                root.querySelectorAll(promptForSelector).forEach(addPromptMsgTo);

                /** 观察文档节点的增加 以便于自动为新元素添加悬浮提示 */
                const observer = new MutationObserver(mutationsList => {
                    root.querySelectorAll(promptForSelector).forEach(addPromptMsgTo);
                });
                observer.observe(root, { childList: true, subtree: true });
                this.remove();
            }
        }

        disconnectedCallback() {
            contentConvertFn.delete(this.shadowRoot);
        }

        get focusedPanel() {
            for (const e of this.shadowRoot.children) {
                if (e.tagName === "MENU") continue;
                if (e.hidden) continue;
                return e;
            }
            return null;
        }

        //prettier-ignore
        get [Symbol.toStringTag]() { return "HTMLNoitaPanelElement" }
    };
})();
h["noita-panel"] = freeze(Base);

/**
 *
 * @param {string} str
 * @returns {HTMLCanvasElement}
 */
const getPixelFontsImg = str => {
    str = String(str);
    let width = 0;
    for (const char of str) {
        if ("0123456789".includes(char)) {
            width += 6;
            continue;
        }
        if ("ABCDEFGHIJKLMNOPQRSTUVWXYZ".includes(char)) {
            width += 7;
            continue;
        }
        if ("abcdefghijklmnopqrstuvwxyz".includes(char)) {
            width += 5;
            continue;
        }
        if (char === " ") {
            width += 2;
            continue;
        }
        throw new TypeError("仅支持A-Za-z0-9的字符");
    }

    const canvas = h.canvas({ width, height: 10 });
    const ctx = canvas.getContext("2d");
    /** @type {typeof CanvasRenderingContext2D.prototype.drawImage} */
    const draw = ctx.drawImage.bind(ctx);
    let currWidth = 0;
    (async () => {
        for (const char of str) {
            if (char === " ") {
                currWidth += 2;
                continue;
            }
            const { icon } = Base.PanelAttrInfo.query(char);
            icon.connectedCallback();
            const { promise, resolve } = Promise.withResolvers();
            icon.addEventListener("load", () => {
                if ("0123456789".includes(char)) {
                    draw(icon, 1, 0, 6, 7, currWidth, 0, 6, 7);
                    currWidth += 6;
                } else if ("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".includes(char)) {
                    draw(icon, 0, 0, 7, 7, currWidth, 0, 7, 7);
                    currWidth += 7;
                } else if ("abcdefhiklmnorstuvwxz".includes(char)) {
                    draw(icon, 1, 0, 5, 7, currWidth, 0, 5, 7);
                    currWidth += 5;
                } else if ("jgpqy".includes(char)) {
                    draw(icon, 1, 0, 5, 7, currWidth, 3, 5, 7);
                    currWidth += 5;
                }
                resolve();
            });
            await promise;
        }
    })();
    canvas.textContent = str;
    return canvas;
};

/**
 * 创建面板 **`<h1>`** 标题
 * @param {String} id
 * @param {String} name
 * @returns {HTMLHeadingElement} `<h1>` 元素
 */
const createPanelH1 = (() => {
    /** 切换标题内容事件回调 */
    const panelTitleSwitch = (() => {
        /**
         * @param  {HTMLHeadingElement} h1
         * 切换标题
         */
        const main = h1 => {
            const { id, name } = h1.dataset;
            h1.textContent = h1.textContent === id ? name : id;
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
                click: ({ currentTarget }) => {
                    soundEffect.click();
                    main(currentTarget);
                },
                /**
                 * 用于键盘触发 `Enter`
                 * @param {KeyboardEvent} event
                 */
                keydown: event => {
                    if (event.key === "Enter") {
                        soundEffect.click();
                        main(event.currentTarget); // 切换标题
                    } else if (event.key === "Escape") event.currentTarget.blur();
                    else if (event.ctrlKey || event.metaKey) {
                        if (event.key.toLocaleUpperCase() === "C") navigator.clipboard.writeText(event.currentTarget.innerText); // 复制标题
                    } else if (event.key === "ArrowUp") {
                        /** @type {ShadowRoot} */
                        const shadowRoot = event.currentTarget.getRootNode();
                        shadowRoot.querySelector("li.selected")?.focus();
                    }
                }
            }
        };
    })();
    return (id, name) => {
        const h1 = h.h1({ "data-id": id, "data-name": name, Event: panelTitleSwitch.event, dataset: { useShiftConvert: true } }, name);
        h1[contentConvertFn.fnSymbol] = () => panelTitleSwitch.main(h1);
        return h1;
    };
})();
