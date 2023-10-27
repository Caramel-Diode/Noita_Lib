const Container = (() => {
    embed(`#svg.data.js`);
    const styleSheet_base = gss(embed(`#base.css`));

    const HTMLNoitaContainerElement = class extends Base {
        static {
            const superStyleSheets = super.prototype.publicStyleSheets;
            /** @type {PublicStyleSheets} */ this.prototype.publicStyleSheets = {
                icon: [...superStyleSheets.icon, styleSheet_base, gss(embed(`#icon.css`))],
                panel: [...superStyleSheets.panel, styleSheet_base, gss(embed(`#panel.css`))]
            };
        }
        /** @type {ShadowRoot} */ #shadowRoot = this.attachShadow({ mode: "closed" });
        /** @type {DisplayMode} */ #displayMode = undefined;
        materials = [];
        #color = "";
        /** @type {"common","conical","jar","bag"} */ #type = "";
        #amount = 100;
        #content = [];
        #amount_all = 0;
        constructor() {
            super();
        }

        #parseContentExpression() {
            const data = this.getAttribute("container.content");
            const result = [];
            if (data) {
                const regex_blank = util.parse.Token.regs.blank;
                let currentContent;
                let state = 0; /// 1: 匹配颜色中 2:匹配材料中 3:匹配数量中
                for (let i = 0; i < data.length; i++) {
                    const char = data[i];
                    currentContent = result.at(-1);
                    if (char === "#") {
                        if (state !== 0) {
                            if (currentContent.type === "COLOR") currentContent.color = currentContent.color_cache.join("");
                            else if (currentContent.type === "MATERIAL") currentContent.material = currentContent.material_cache.join("");
                            currentContent.amount = Number(currentContent.amount_cache.join(""));
                            this.#amount_all += currentContent.amount;
                        }
                        //指定颜色
                        result.push({
                            type: "COLOR",
                            amount: 0,
                            amount_cache: [],
                            color: null,
                            color_cache: ["#"]
                        });
                        state = 1;
                    } else if (char === ":") {
                        // 指定数量
                        state = 3;
                    } else if (!regex_blank.test(char)) {
                        if (state === 0) {
                            result.push({
                                type: "MATERIAL",
                                amount: 0,
                                amount_cache: [],
                                material: null,
                                material_cache: [char]
                            });
                            state = 2;
                        } else if (state === 1) currentContent.color_cache.push(char);
                        else if (state === 2) currentContent.material_cache.push(char);
                        else if (state === 3) currentContent.amount_cache.push(char);
                    } else {
                        //此处char为空白符
                        if (currentContent.type === "COLOR") currentContent.color = currentContent.color_cache.join("");
                        else if (currentContent.type === "MATERIAL") currentContent.material = currentContent.material_cache.join("");
                        currentContent.amount = Number(currentContent.amount_cache.join(""));
                        this.#amount_all += currentContent.amount;
                        state = 0;
                    }
                }
                if (currentContent.type === "COLOR") currentContent.color = currentContent.color_cache.join("");
                else if (currentContent.type === "MATERIAL") currentContent.material = currentContent.material_cache.join("");
                currentContent.amount = Number(currentContent.amount_cache.join(""));
                this.#amount_all += currentContent.amount;
            }
            this.#content = result;
            console.log(result);
        }

        #getCascadingSvgs = () => {
            const fragment = document.createDocumentFragment();
            const svgGenerator = svgGenerators.get(this.#type) ?? svgGenerators.get("common");
            fragment.appendChild(svgGenerator());
            let currentFillHeight = this.#amount_all;
            console.log(this.#content);
            for (let i = 0; i < this.#content.length; i++) {
                const item = this.#content[i];
                if (item.type === "COLOR") {
                    fragment.append(svgGenerator(currentFillHeight, item.color));
                } else {
                    // === "MATERIAL"
                    //#todo: 等材料数据库完成后补充
                }
                currentFillHeight -= item.amount;
            }
            return fragment;
        };

        async #loadIconContent() {
            this.#shadowRoot.adoptedStyleSheets = this.publicStyleSheets.icon;
            this.#shadowRoot.append(this.#getCascadingSvgs());
        }

        async #loadPanelContent() {}

        contentUpdate() {
            this.#shadowRoot.innerHTML = "";
            this.#shadowRoot.adoptedStyleSheets = [];
            const displayMode = this.getAttribute("display");
            if (displayMode) this.#displayMode = displayMode;
            else {
                this.setAttribute("display", "icon");
                this.#displayMode = "icon";
            }
            const type = this.getAttribute("container.type");
            if (type) this.#type = type;
            if (this.#displayMode === "panel") this.#loadPanelContent();
            else this.#loadIconContent();
        }

        connectedCallback() {
            this.#parseContentExpression();
            this.contentUpdate();
        }

        toString() {
            const datas = [];
            for (let i = 0; i < this.spellDatas.length; i++) {
                const spell = this.spellDatas[i];
                datas.push(spell.id);
            }
            return `[obejct HTMLNoitaContainerElement #${datas.join[","]}]`;
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue === null) return;
            else if (newValue === oldValue) return;
            else {
                // switch (name) {
                //     case "spell.id":
                //     case "spell.name":
                //     case "spell.remain":
                //     case "spell.exp":
                //         this.spellDatas = [];
                //         this.#currentDataIndex = -1;
                //         break;
                //     case "display":
                //         this.#displayMode = undefined;
                // }
                this.contentUpdate();
            }
        }
    };
    return Object.freeze(HTMLNoitaContainerElement);
})();
customElements.define("noita-container", Container);
