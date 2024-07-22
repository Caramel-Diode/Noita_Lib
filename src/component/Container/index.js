/** @typedef {import("@contanier").ContainerType} ContainerType */
/** @typedef {import("@material").MaterialData} MaterialData */
const Container = (() => {
    embed(`#db.js`);
    ContainerData.init();
    const styleSheet = {
        base: gss(embed(`#base.css`)),
        icon: gss(embed(`#icon.css`)),
        panel: gss(embed(`#panel.css`))
    };

    return class HTMLNoitaContainerElement extends $class(Base, {
        /** @type {$ValueOption<"icon"|"panel">} */
        displayMode: { name: "display", $default: "icon" },
        /** @type {$ValueOption<ContainerType>} */
        containerType: { name: "container.type", $default: "common" },
        /** @type {$ValueOption<String>} */
        containerContent: { name: "container.content" }
    }) {
        /** @type {ShadowRoot} */ #shadowRoot = this.attachShadow({ mode: "closed" });
        /** @type {Array<{type:"COLOR"|"MATERIAL",amount:Number,color?:String,material?:MaterialData}>} 容器内容 */
        #content = [];
        #amount_all = 0;
        /** @type {ContainerData} */
        containerData;
        constructor() {
            super();
        }

        #parseContentExpression() {
            const data = [...(this.containerContent ??= "")];
            const result = [];
            if (data) {
                this.#amount_all = 0;
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
                    } else if (char === ":") state = 3; // 指定数量
                    else if (!/\s/.test(char)) {
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
                        if (currentContent.type === "COLOR") {
                            currentContent.color = currentContent.color_cache.join("");
                            currentContent.color_cache = null;
                        } else if (currentContent.type === "MATERIAL") {
                            currentContent.material = Material.queryById(currentContent.material_cache.join(""));
                            currentContent.material_cache = null;
                        }
                        currentContent.amount = Number(currentContent.amount_cache.join(""));
                        currentContent.amount_cache = null;
                        this.#amount_all += currentContent.amount;
                        state = 0;
                    }
                }
                if (currentContent.type === "COLOR") currentContent.color = currentContent.color_cache.join("");
                else if (currentContent.type === "MATERIAL") currentContent.material = Material.queryById(currentContent.material_cache.join(""));
                currentContent.amount = Number(currentContent.amount_cache.join(""));
                this.#amount_all += currentContent.amount;
            }
            this.#content = result;
        }

        #getCascadingSVGs = () => {
            const fragment = new DocumentFragment();
            fragment.append(this.containerData.createSVG());
            let currentFillHeight = this.#amount_all;
            for (let i = 0; i < this.#content.length; i++) {
                const item = this.#content[i];
                if (item.type === "COLOR") {
                    fragment.append(this.containerData.createSVG(currentFillHeight, item.color));
                } else {
                    //                                                                                                                            我是否应该移除透明度?
                    fragment.append(this.containerData.createSVG(currentFillHeight, "#" + item.material.color /*.slice(0, -2)*/));
                }
                currentFillHeight -= item.amount;
            }
            return fragment;
        };

        async #loadIconContent() {
            this.#shadowRoot.append(this.#getCascadingSVGs());
        }

        async #loadPanelContent() {
            const { name, desc } = this.containerData;
            let h1Text = "空" + name;
            const svgs = this.#getCascadingSVGs();
            const h1Cache = [];
            const tableCache = [];
            for (let i = 0; i < this.#content.length; i++) {
                const item = this.#content[i];
                if (item.type === "COLOR") {
                    h1Cache.push(item.color);
                    tableCache.push(`<tr><td>${item.amount}%</td><th style="color:${item.color}">${item.color}</th></tr>`);
                } else {
                    h1Cache.push(item.material.name);
                    tableCache.push(`<tr><td>${item.amount}%</td><th>${item.material.name}</th></tr>`);
                }
            }
            if (this.#amount_all !== 0) h1Text = `${h1Cache.join("+")}${name}(${this.#amount_all}%)`;
            const table = h.table({ class: "attrs", HTML: tableCache.join("") });
            this.loadPanelContent([h.template(h.h1(h1Text), svgs, table, h.p(desc))]);
        }

        /**
         * @override
         * @param {Array<CSSStyleSheet>} [extraStyleSheets] 额外样式表
         */
        [$symbols.initStyle](extraStyleSheets = []) {
            extraStyleSheets.push(styleSheet.base);
            //prettier-ignore
            switch(this.displayMode) {
                case "icon": extraStyleSheets.push(styleSheet.icon); break;
                case "panel": extraStyleSheets.push(styleSheet.panel)
            }
            super[$symbols.initStyle](extraStyleSheets);
        }
        /** @override */
        contentUpdate() {
            this.#parseContentExpression();
            this.#shadowRoot.innerHTML = "";
            this[$symbols.initStyle]();
            this.containerData = ContainerData.query(this.containerType);
            //prettier-ignore
            switch(this.displayMode) {
                case "panel": this.#loadPanelContent(); break;
                case "icon": this.#loadIconContent(); break;
                default: throw new TypeError("不支持的显示模式");
            }
        }

        connectedCallback() {
            this.contentUpdate();
        }

        get [Symbol.toStringTag]() {
            const datas = [];
            for (let i = 0; i < this.spellDatas.length; i++) {
                const spell = this.spellDatas[i];
                datas.push(spell.id);
            }
            return `HTMLNoitaContainerElement < ${datas.join(",")} >`;
        }
    };
})();
customElements.define("noita-container", Container);
