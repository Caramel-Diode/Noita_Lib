component.spell = class extends component.base {
    static {
        const superStyleSheets = super.prototype.publicStyleSheets;
        this.prototype.publicStyleSheets = {
            /** @type {Array<CSSStyleSheet>} */
            icon: [...superStyleSheets.icon, gss(`"SpellElement_icon.css"`)],
            /** @type {Array<CSSStyleSheet>} */
            panel: [...superStyleSheets.panel, gss(`"SpellElement_panel.css"`)]
        };
        customElements.define("noita-spell", this);
    };

    /** @type {ShadowRoot} */
    #shadowRoot = this.attachShadow({ mode: "closed" });

    static observedAttributes = [...super.observedAttributes, "spell.id", "spell.name", "spell.expression", "spell.remain"];
    static #typeInfoMap = new Map([
        ["null", ["NULL", "⚫"]],
        ["projectile", ["投射物", "🔴"]],
        ["staticProjectile", ["静态投射物", "🟠"]],
        ["modifier", ["投射修正", "🔵"]],
        ["drawMany", ["多重施放", "⚪"]],
        ["material", ["材料", "🟢"]],
        ["other", ["其他", "🟡"]],
        ["utility", ["实用", "🟣"]],
        ["passive", ["被动", "🟤"]]
    ]);

    #displayMode = undefined;
    #needDefaultFn = true;

    /** @type {Array<SpellData>} */
    spellDatas = [];
    /** @type {Number} */
    #currentDataIndex = -1;

    instanceData = {
        remain: Infinity
    };

    constructor(...params) {
        super();
        let option = null;
        if (typeof params[0] === "object") {
            if (params[0] instanceof Array) {
                this.spellDatas = params[0];
            } else {
                option = params[0];
            }
        }
        if (typeof params[1] === "object") {
            option = params[1];
        }
        if (option) {
            if (option.id) {
                this.setAttribute("spell.id", option.id);
            } else if (option.name) {
                this.setAttribute("spell.name", option.name);
            } else if (option.expression) {
                this.setAttribute("spell.expression", option.expression);
            } else if (option.needDefaultFn === false) {
                this.#needDefaultFn = false;
            } else if (option.datas) {
                this.spellDatas = option.datas;
            }
            if (option.display) {
                this.setAttribute("display", option.display);
            }
            if (option.instanceData) {
                this.instanceData = option.instanceData;
            }
        }

    };

    /**
     * 获取投射物数据表
     * @async
     * @param {SpellData} spellData 投射物数据
     * @returns {Promise<HTMLElement>}
     */
    static getDataSection = (() => {
        const loadAttr = super.loadPanelAttr;
        const switchFn = super.panelInfoSwitchFn;
        /** 
         * @param {SpellData} spellData
         * @returns {Promise<HTMLElement>}
         */
        return async spellData => {
            const section = document.createElement("section");
            const table_base = document.createElement("table");
            const table_modifier = document.createElement("table");
            const tbody_base = document.createElement("tbody");
            const tbody_modifier = document.createElement("tbody");
            table_base.append(tbody_base);
            table_modifier.append(tbody_modifier);

            const sd = spellData; //简写法术数据对象
            const dd = sd.damageMod; //简写伤害数据 damageData

            //#region 基本信息
            await loadAttr("type", this.#typeInfoMap.get(sd.type)[0], tbody_base); // 法术类型
            await loadAttr("manaDrain", sd.manaDrain, tbody_base); // 法力消耗
            if (sd.maxUse !== -1) await loadAttr("maxUse", { times: sd.maxUse, neverUnlimited: sd.neverUnlimited }, tbody_base); // 最大使用次数
            if (sd.draw.common + sd.draw.hit + sd.draw.timer.count + sd.draw.death) await loadAttr("draw", sd.draw, tbody_base); // 抽取
            // 先添加基本信息
            section.append(table_base);
            //#endregion

            //#region 投射物信息
            const relatedDataElements = [];
            const relatedSectionElements = [];
            for (let i = 0; i < sd.offeredProjectiles.length; i++) {
                const projectileData = sd.offeredProjectiles[i].projectileData;
                const num_min = sd.offeredProjectiles[i].num_min;
                const num_max = sd.offeredProjectiles[i].num_max;
                const isInCastState = sd.offeredProjectiles[i].isInCastState;

                const section_ = await component.entity.getDataSection(projectileData);
                section_.setAttribute("related-id", projectileData.id);
                section_.setAttribute("roles", "tabpanel");// 无障碍标注

                relatedSectionElements.push(section_);
                // 在修正信息和基本信息之间添加投射物信息
                section.append(section_);

                const data = document.createElement("data");
                data.setAttribute("tabindex", "0");// 无障碍 允许tab聚焦
                data.setAttribute("roles", "tab");
                data.relatedDataElements = relatedDataElements;
                data.relatedSectionElements = relatedSectionElements;
                data.value = projectileData.id;
                data.addEventListener("click", switchFn.byMouse);
                data.addEventListener("keydown", switchFn.byKeyboard);
                data.append(projectileData.name);
                if (num_min === num_max) {
                    if (num_min !== 0) data.append("(", num_min, ")");
                }
                else data.append("(", num_min, "~", num_max, ")");
                if (isInCastState) {
                    data.classList.add("in-cast-state");
                    data.title = "享受施法块属性加成";
                } else {
                    data.classList.add("not-in-cast-state");
                    data.title = "不享受施法块属性加成";
                }
                data.classList.add("unselected");
                relatedDataElements.push(data);
            }

            if (relatedDataElements[0]) {
                relatedDataElements[0].click();
                // 投射物间接提供的投射物信息会全部展示 此处点击以实现仅显示首个投射物信息
                // relatedDataElements[0].relatedTbodyElements[0].querySelector("data")?.click();
                loadAttr("projectilesProvided", relatedDataElements, tbody_base);
            }
            //#region 

            //#region 修正信息
            if (dd.projectile !== 0) await loadAttr("projectileDamage", dd.projectile, tbody_modifier, true); // 投射物伤害
            if (dd.melee !== 0) await loadAttr("meleeDamage", dd.melee, tbody_modifier, true); // 近战伤害
            if (dd.electricity !== 0) await loadAttr("electricityDamage", dd.electricity, tbody_modifier, true); // 雷电伤害
            if (dd.fire !== 0) await loadAttr("fireDamage", dd.fire, tbody_modifier, true); // 火焰伤害
            if (dd.explosion !== 0) await loadAttr("explosionDamage", dd.explosion, tbody_modifier, true); // 爆炸伤害
            if (dd.ice !== 0) await loadAttr("iceDamage", dd.ice, tbody_modifier, true); // 冰冻伤害
            if (dd.slice !== 0) await loadAttr("sliceDamage", dd.slice, tbody_modifier, true); // 切割伤害
            if (dd.healing !== 0) await loadAttr("healingDamage", dd.healing, tbody_modifier, true); // 治疗伤害
            if (dd.curse !== 0) await loadAttr("curseDamage", dd.curse, tbody_modifier, true); // 诅咒伤害
            if (dd.drill !== 0) await loadAttr("drillDamage", dd.drill, tbody_modifier, true); // 穿凿伤害
            if (sd.explosionRadius !== 0) await loadAttr("explosionRadius", sd.explosionRadius, tbody_modifier, true); // 爆炸半径
            if (sd.bounces !== 0) await loadAttr("bounces", sd.bounces, tbody_modifier, true); // 弹跳次数
            if (sd.recoilKnockback !== 0) await loadAttr("recoilKnockback", sd.recoilKnockback, tbody_modifier, true); // 击退
            if (sd.knockbackForce !== 0) await loadAttr("knockbackForce", sd.knockbackForce, tbody_modifier, true); // 后座力
            if (sd.spreadDegrees !== 0) await loadAttr("spreadDegrees", sd.spreadDegrees, tbody_modifier, true); // 散射
            if (sd.speedMultiplier !== 1) await loadAttr("speed", sd.speedMultiplier, tbody_modifier, true); // 投射物速度
            if (sd.damageCriticalChance !== 0) await loadAttr("damageCriticalChance", sd.damageCriticalChance, tbody_modifier, true); // 暴击率
            if (sd.fireRateWait !== 0) await loadAttr("fireRateWait", sd.fireRateWait, tbody_modifier, true); // 施放延迟
            if (sd.reloadTime !== 0) await loadAttr("reloadTime", sd.reloadTime, tbody_modifier, true); // 充能时间
            if (sd.lifetimeAdd !== 0) await loadAttr("lifetime", sd.lifetimeAdd, tbody_modifier, true); // 存在时间
            // 最后添加修正信息
            section.append(table_modifier);
            //#endregion

            return section;
        };
    })();

    #IconClickFn() {
        const dialog = document.createElement("dialog");
        const publicFn = e => {
            e.preventDefault();
            dialog.remove();
        };
        dialog.addEventListener("close", publicFn);
        dialog.addEventListener("contextmenu", publicFn);
        const closeButton = document.createElement("button");
        closeButton.innerText = "关闭";
        closeButton.addEventListener("click", publicFn);
        dialog.append(new this.constructor(this.spellDatas, { display: "panel" }));
        dialog.append(closeButton);
        document.body.append(dialog);
        dialog.showModal();
    };

    /** 加载图标模式内容 */
    async #loadIconContent() {
        if (this.spellDatas.length > 0) {
            const fragment = document.createDocumentFragment();
            this.#shadowRoot.adoptedStyleSheets = this.publicStyleSheets.icon;
            const titles = [];
            const ol = document.createElement("ol");
            ol.part = "tape";
            ol.style.cssText = `--amount: ${this.spellDatas.length}`;
            for (let i = 0; i < this.spellDatas.length; i++) {
                const spellData = this.spellDatas[i];
                const li = document.createElement("li");
                li.className = spellData.type;
                li.append(await spellData.getIcon());
                ol.append(li);
                titles.push(`${this.constructor.#typeInfoMap.get(spellData.type)[1]}${spellData.name}\n${spellData.id}\n${spellData.description}`);
            }
            this.title = titles.join("\n\n");
            fragment.append(ol);
            if (this.instanceData.remain !== Infinity) {
                const data_remain = document.createElement("data");
                data_remain.append(this.instanceData.remain.toString());
                fragment.append(data_remain);
            }
            this.#shadowRoot.append(fragment);
            this.setAttribute("role", "button");
            this.setAttribute("tabindex", "0");
            if(this.#needDefaultFn) {
                this.addEventListener("click", this.#IconClickFn);
            }
        }
    };

    static #panelDataSwitch = (() => {
        const main = event => {
            /** @type {HTMLLIElement} */
            let li;
            if (event.target instanceof HTMLCanvasElement) {
                li = event.target.parentElement;
            } else if (event.target instanceof HTMLLIElement) {
                li = event.target;
            }
            const parent = li.parentElement;
            for (let i = 0; i < parent.children.length; i++) {
                parent.children[i].removeAttribute("class");
            }
            li.className = "selected";
            li.relatedElement_noitaSpell.#loadPanelContent(li.spellDataIndex);
        };
        return {
            /**
             * 用于鼠标触发 `左键`
             * @param {MouseEvent} event
             */
            byMouse: event => {
                main(event);
            },
            /**
             * 用于键盘触发 `Enter`
             * @param {KeyboardEvent} event
             */
            byKeyboard: event => {
                if (event.key === "Enter") main(event);
                else if (event.key === "Escape") event.target.blur();
            }
        };
    })();

    /**
     * 加载面板模式内容
     * @param {Number} [index = 0] 法术数据索引
     */
    async #loadPanelContent(index = 0) {
        this.#shadowRoot.adoptedStyleSheets = this.publicStyleSheets.panel;
        const fragment = document.createDocumentFragment();
        if (this.#currentDataIndex !== -1) { //非首次加载 进行更新操作
            this.#shadowRoot.querySelector("main").remove();
        } else { //首次加载 尝试加载选项卡
            if (this.spellDatas.length > 1) { //仅有单个法术数据时不显示选项卡
                const header = document.createElement("header");//视口容器 适配滚动条
                const ol = document.createElement("ol");//选项卡
                for (let i = 0; i < this.spellDatas.length; i++) {
                    const sd = this.spellDatas[i];
                    const li = document.createElement("li");
                    li.append(await sd.getIcon(), ` ${sd.name}`);
                    li.spellDataIndex = i;
                    li.relatedElement_noitaSpell = this;
                    li.setAttribute("tabindex", "0");
                    li.setAttribute("roles", "tabpanel");
                    li.addEventListener("click", this.constructor.#panelDataSwitch.byMouse);
                    li.addEventListener("keydown", this.constructor.#panelDataSwitch.byKeyboard);
                    ol.append(li);
                }
                ol.children[index].className = "selected";
                header.append(ol);
                fragment.append(header);
            }
        }
        this.#currentDataIndex = index;
        const sd = this.spellDatas[index];
        const main = document.createElement("main");
        const h1 = document.createElement("h1");//名称
        h1.setAttribute("switch.id", sd.id);
        h1.setAttribute("switch.name", sd.name);
        h1.setAttribute("tabindex", "0");// 无障碍 允许tab聚焦 
        h1.addEventListener("click", super.constructor.panelTitleSwitchFn.byMouse);
        h1.addEventListener("keydown", super.constructor.panelTitleSwitchFn.byKeyboard);
        h1.innerText = sd.name;
        const p = document.createElement("p");//描述
        p.append(sd.description);
        const section = await this.constructor.getDataSection(sd);//属性区
        section.className = "attr-area";
        main.append(await sd.getIcon(), h1, p, section);
        fragment.append(main);
        this.#shadowRoot.append(fragment);
    };

    contentUpdate() {
        this.#shadowRoot.innerHTML = "";
        this.#shadowRoot.adoptedStyleSheets = [];
        const displayMode = this.getAttribute("display");
        if (displayMode) this.#displayMode = displayMode;
        else {
            this.setAttribute("display", "icon");
            this.#displayMode = "icon";
        }
        const spellId = this.getAttribute("spell.id");
        if (spellId) this.spellDatas = [DB.spell.queryById(spellId)];
        else {
            const spellName = this.getAttribute("spell.name");
            if (spellName) this.spellDatas = [DB.spell.queryByName(spellName)];
            else {
                const spellExpression = this.getAttribute("spell.expression");
                if (spellExpression) this.spellDatas = DB.spell.queryByExpression(spellExpression);
                if (this.spellDatas.length === 0) this.spellDatas = [DB.spell.$NULL];
            }
        }
        if(this.hasAttribute("no-default-click-fn")) {
            this.#needDefaultFn = false;
        }
        if (this.#displayMode === "panel") this.#loadPanelContent();
        else this.#loadIconContent();
    }

    connectedCallback() {
        this.contentUpdate();
    };

    toString() {
        return `[obejct HTMLNoitaSpellElement #${this.spellData.id}]`;
    };

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === null) return;
        else if (newValue === oldValue) return;
        else {
            switch (name) {
                case "spell.id":
                case "spell.name":
                case "spell.remain":
                case "spell.expression":
                    this.spellDatas = [];
                    this.#currentDataIndex = -1;
                    break;
                case "display": this.#displayMode = undefined;
            }
            this.contentUpdate();
        }
    };
};