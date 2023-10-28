/** ## [`✨ 法术`](https://noita.wiki.gg/zh/wiki/法术) */
const Spell = (() => {
    embed(`#db.js`);
    SpellData.init();

    const typeInfoMap = new Map([
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
    const HTMLNoitaSpellElement = class extends Base {
        static queryById = id => SpellData.queryById(id);
        static queryByName = name => SpellData.queryByName(name);
        static queryByExp = exp => SpellData.queryByExp(exp);
        static observedAttributes = Object.freeze([...super.observedAttributes, "spell.id", "spell.name", "spell.exp", "spell.remain"]);

        static {
            const superStyleSheets = super.prototype.publicStyleSheets;
            /** @type {PublicStyleSheets} */ this.prototype.publicStyleSheets = {
                icon: [...superStyleSheets.icon, gss(embed(`#icon.css`))],
                panel: [...superStyleSheets.panel, gss(embed(`#panel.css`))]
            };
        }

        /** @type {ShadowRoot} */ #shadowRoot = this.attachShadow({ mode: "closed" });
        /** @type {DisplayMode} */ #displayMode = undefined;
        #needDefaultFn = true;

        /** @type {Array<SpellData>} */ spellDatas = [];
        /** @type {Number} */ #currentDataIndex = -1;

        instanceData = {
            remain: Infinity
        };
        /**
         * 
         * @param  {[Array<SpellData>,SpellElementConstructParam]|SpellElementConstructParam} params 
         */
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
                if (option.id) this.setAttribute("spell.id", option.id);
                else if (option.name) this.setAttribute("spell.name", option.name);
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
        }

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
                    titles.push(`${typeInfoMap.get(spellData.type)[1]}${spellData.name}\n${spellData.id}\n${spellData.description}`);
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
                if (this.#needDefaultFn) {
                    this.addEventListener("click", this.#IconClickFn);
                }
            }
        }

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
         * 加载面板模式内容
         * @param {Number} [index = 0] 法术数据索引
         */
        async #loadPanelContent(index = 0) {
            this.#shadowRoot.adoptedStyleSheets = this.publicStyleSheets.panel;
            const fragment = document.createDocumentFragment();
            if (this.#currentDataIndex !== -1) {
                //非首次加载 进行更新操作
                this.#shadowRoot.querySelector("main").remove();
            } else {
                //首次加载 尝试加载选项卡
                if (this.spellDatas.length > 1) {
                    //仅有单个法术数据时不显示选项卡
                    const header = document.createElement("header"); //视口容器 适配滚动条
                    const ol = document.createElement("ol"); //选项卡
                    ol.className = "spells-tabpanel";
                    for (let i = 0; i < this.spellDatas.length; i++) {
                        const sd = this.spellDatas[i];
                        const li = document.createElement("li");
                        li.append(await sd.getIcon(), ` ${sd.name}`);
                        li.spellDataIndex = i;
                        li.relatedElement_noitaSpell = this;
                        li.setAttribute("roles", "tabpanel");
                        util.addFeatureTo(li, Spell.#panelDataSwitch);
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
            const h1 = this.createPanelH1(sd.id, sd.name);
            const p = document.createElement("p"); //描述
            p.innerText = sd.description;
            //#region 属性区
            /*###############################################################################*/
            const section = document.createElement("section");
            const table_base = document.createElement("table");
            const table_modifier = document.createElement("table");
            const tbody_base = document.createElement("tbody");
            const tbody_modifier = document.createElement("tbody");
            table_base.append(tbody_base);
            table_modifier.append(tbody_modifier);

            //#region 投射物信息
            const relatedLiElements = [];
            const relatedSectionElements = [];
            for (let i = 0; i < sd.offeredProjectiles.length; i++) {
                const projectileData = sd.offeredProjectiles[i].projectileData;
                const num_min = sd.offeredProjectiles[i].num_min;
                const num_max = sd.offeredProjectiles[i].num_max;
                const isInCastState = sd.offeredProjectiles[i].isInCastState;
                // 获取实体的数据
                const section_offeredProjectile = await Entity.getDataSection(projectileData);
                section_offeredProjectile.setAttribute("related-id", projectileData.id);
                section_offeredProjectile.setAttribute("roles", "tabpanel"); // 无障碍标注
                relatedSectionElements.push(section_offeredProjectile);
                section.append(section_offeredProjectile); // 在修正信息和基本信息之间添加投射物信息
                const li = document.createElement("li");
                li.setAttribute("related-id", projectileData.id);
                li.relatedLiElements = relatedLiElements;
                li.relatedSectionElements = relatedSectionElements;
                li.append(projectileData.name);
                if (num_min === num_max) {
                    if (num_min !== 0) li.append(`(${num_min})`);
                } else li.append(`(${num_min}~${num_max})`);
                if (isInCastState) {
                    li.classList.add("in-cast-state");
                    li.title = "享受施法块属性加成";
                } else {
                    li.classList.add("not-in-cast-state");
                    li.title = "不享受施法块属性加成";
                }
                li.classList.add("unselected");
                relatedLiElements.push(li);
            }
            //#endregion

            //#region 修正信息
            const dd = sd.damageMod; //简写伤害数据 damageData
            let modLoader = new Base.panelAttrLoader(tbody_modifier);
            if (dd.projectile) modLoader.damage("projectileDamage", dd.projectile, true); // 投射物伤害
            if (dd.melee) modLoader.damage("meleeDamage", dd.melee, true); // 近战伤害
            if (dd.electricity) modLoader.damage("electricityDamage", dd.electricity, true); // 雷电伤害
            if (dd.fire) modLoader.damage("fireDamage", dd.fire, true); // 火焰伤害
            if (dd.explosion) modLoader.damage("explosionDamage", dd.explosion, true); // 爆炸伤害
            if (dd.ice) modLoader.damage("iceDamage", dd.ice, true); // 冰冻伤害
            if (dd.slice) modLoader.damage("sliceDamage", dd.slice, true); // 切割伤害
            if (dd.healing) modLoader.damage("healingDamage", dd.healing, true); // 治疗伤害
            if (dd.curse) modLoader.damage("curseDamage", dd.curse, true); // 诅咒伤害
            if (dd.drill) modLoader.damage("drillDamage", dd.drill, true); // 穿凿伤害
            if (sd.explosionRadius) modLoader.default("explosionRadius", sd.explosionRadius, true); // 爆炸半径
            if (sd.bounces) modLoader.default("bounces", sd.bounces, true); // 弹跳次数
            if (sd.recoilKnockback) modLoader.default("recoilKnockback", sd.recoilKnockback, true); // 击退
            if (sd.knockbackForce) modLoader.default("knockbackForce", sd.knockbackForce, true); // 后座力
            if (sd.spreadDegrees) modLoader.spreadDegrees(sd.spreadDegrees, true); // 散射
            if (!sd.speedMultiplier) modLoader.speed("speed", sd.speedMultiplier, true); // 投射物速度
            if (sd.damageCriticalChance) modLoader.damageCriticalChance(sd.damageCriticalChance); // 暴击率
            if (sd.fireRateWait) modLoader.castCD("fireRateWait", sd.fireRateWait, true); // 施放延迟
            if (sd.reloadTime) modLoader.castCD("reloadTime", sd.reloadTime, true); // 充能时间
            if (sd.lifetime) modLoader.lifetime(sd.lifetime, true); // 存在时间
            if (sd.trailMaterial) modLoader.default("trailMaterial", sd.trailMaterial); // 提供轨迹
            if (sd.trailMaterialAmount) modLoader.default("trailMaterialAmount", sd.trailMaterialAmount, true); // 轨迹浓度
            if (sd.material) modLoader.default("material", sd.material); // 提供材料
            if (sd.materialAmount) modLoader.default("materialAmount", sd.materialAmount, true); // 材料浓度
            section.append(table_modifier); //添加到最后
            //#endregion

            //#region 基本信息
            const baseLoader = new Base.panelAttrLoader(tbody_base);
            baseLoader.default("type", typeInfoMap.get(sd.type)[0]); // 法术类型
            baseLoader.default("manaDrain", sd.manaDrain); // 法力消耗
            if (sd.maxUse !== -1) baseLoader.timesUsed("maxUse", { max: sd.maxUse, neverUnlimited: sd.neverUnlimited }); // 最大使用次数
            if (sd.draw.common + sd.draw.hit + sd.draw.timer.count + sd.draw.death) baseLoader.draw(sd.draw); // 抽取
            if (sd.passiveEffect) baseLoader.default("passiveEffect", sd.passiveEffect); //被动效果
            if (relatedLiElements[0]) baseLoader.offerEntity("projectilesProvided", relatedLiElements);
            section.prepend(table_base); //添加到最前
            //#endregion
            /*###############################################################################*/
            //#endregion
            main.append(await sd.getIcon(), this.createPanelH1(sd.id, sd.name), p, section);
            fragment.append(main);
            this.#shadowRoot.append(fragment);
        }

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
            if (spellId) this.spellDatas = [SpellData.queryById(spellId)];
            else {
                const spellName = this.getAttribute("spell.name");
                if (spellName) this.spellDatas = [SpellData.queryByName(spellName)];
                else {
                    const spellExp = this.getAttribute("spell.exp");
                    if (spellExp) this.spellDatas = SpellData.queryByExp(spellExp);
                    if (this.spellDatas.length === 0) this.spellDatas = [SpellData.$NULL];
                }
            }
            const spellRemain = this.getAttribute("spell.remain");
            if (spellRemain !== null && spellRemain !== "") {
                this.instanceData.remain = Number(spellRemain);
            }
            if (this.hasAttribute("no-default-click-fn")) {
                this.#needDefaultFn = false;
            }
            if (this.#displayMode === "panel") this.#loadPanelContent();
            else this.#loadIconContent();
        }

        connectedCallback() {
            this.contentUpdate();
        }

        toString() {
            const datas = [];
            for (let i = 0; i < this.spellDatas.length; i++) {
                const spell = this.spellDatas[i];
                datas.push(spell.id);
            }
            return `[obejct HTMLNoitaSpellElement #${datas.join[","]}]`;
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue === null) return;
            else if (newValue === oldValue) return;
            else {
                switch (name) {
                    case "spell.id":
                    case "spell.name":
                    case "spell.remain":
                    case "spell.exp":
                        this.spellDatas = [];
                        this.#currentDataIndex = -1;
                        break;
                    case "display":
                        this.#displayMode = undefined;
                }
                this.contentUpdate();
            }
        }
    };
    return Object.freeze(HTMLNoitaSpellElement);
})();
customElements.define("noita-spell", Spell);
