const Message = (() => {
    embed(`#db.js`);
    MessageBackgroundData.init();
    MessagePresetData.init();
    const loadInnerHTML = (bindThis, container) => {
        container.innerHTML = bindThis.innerHTML;
    };

    const HTMLNoitaMessageElement = class extends Base {
        static observedAttributes = Object.freeze([...super.observedAttributes, "message.style", "message.content", "message.preset"]);
        static {
            const superStyleSheets = super.prototype.publicStyleSheets;
            /** @type {PublicStyleSheets} */ this.prototype.publicStyleSheets = {
                base: [...superStyleSheets.base, gss(embed(`#base.css`))]
            };
        }
        /** @type {ShadowRoot} */ #shadowRoot = this.attachShadow({ mode: "closed" });
        /** @type {MessageBackgroundData} */ background;
        /** @type {String|Node} */ content;
        constructor(...param) {
            super();
            if (param.length > 1) {
                this.background = MessageBackgroundData.queryById(param[0]);
                this.content = param[1];
            } else if (param.length === 1) {
                const template = MessagePresetData.queryById(param[0]);
                this.background = template.background;
                this.content = template.text;
            }
        }

        async contentUpdate() {
            this.#shadowRoot.innerHTML = "";
            const background = this.getAttribute("message.style");
            if (background) {
                this.background = MessageBackgroundData.queryById(background);
            }
            const h1 = document.createElement("h1");
            const content = this.getAttribute("message.content");
            if (content) this.content = content;
            if (this.content) this.#shadowRoot.append(this.content);
            else {
                const presetId = this.getAttribute("message.preset");
                if (presetId) {
                    const data = MessagePresetData.queryById(presetId);
                    this.#shadowRoot.innerHTML = data.text;
                    this.background = data.background;
                } else {
                    // 载入内部innerHTML
                    const listener = () => {
                        loadInnerHTML(this, this.#shadowRoot);
                        document.removeEventListener("DOMContentLoaded", listener); //及时让GC回收未被引用的函数
                    };
                    document.addEventListener("DOMContentLoaded", listener);
                    // requestAnimationFrame(listener); // 这个无法获取到innerHTML
                }
            }
            this.#shadowRoot.adoptedStyleSheets = [...this.publicStyleSheets.base, gss(`:host{--url:url("${await this.background.url}")}`)];
        }

        connectedCallback() {
            this.contentUpdate();
        }

        toString() {
            return `[obejct HTMLNoitaMessageElement #${this.background.id}]`;
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue === null) return;
            else if (newValue === oldValue) return;
            else this.contentUpdate();
        }
    };
    return Object.freeze(HTMLNoitaMessageElement);
})();
customElements.define("noita-message", Message);
