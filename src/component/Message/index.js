const Message = (() => {
    embed(`#db.js`);
    MessageBackgroundData.init();
    const HTMLNoitaMessageElement = class extends Base {
        static observedAttributes = Object.freeze([...super.observedAttributes, "message.background", "message.content", "message.template"]);
        static {
            const superStyleSheets = super.prototype.publicStyleSheets;
            /** @type {PublicStyleSheets} */ this.prototype.publicStyleSheets = {
                base: [...superStyleSheets.base, gss(embed(`#base.css`))]
            };
        }
        /** @type {ShadowRoot} */ #shadowRoot = this.attachShadow({ mode: "closed" });
        /** @type {MessageData} */ background;
        /** @type {String|Array<Node>} */ content;
        constructor(...param) {
            super();
            if (param.length > 1) {
                this.background = MessageBackgroundData.queryById(param[0]);
                this.content = param[1];
            } else if (param.length === 1) {
                const template = MessageBackgroundData.PresetData.get(param[0]);
                this.background = template.background;
                this.content = template.text;
            }
        }
        async contentUpdate() {
            this.#shadowRoot.innerHTML = "";
            this.#shadowRoot.adoptedStyleSheets = this.publicStyleSheets.base;
            const fragment = document.createDocumentFragment();
            const background = this.getAttribute("message.background");
            if (background) {
                this.background = MessageBackgroundData.queryById(background);
            }
            const h1 = document.createElement("h1");
            const content = this.getAttribute("message.content");
            if (content) this.content = content;
            if (this.content) h1.innerText = this.content;
            else {
                if (this.content) h1.append(this.content);
                else {
                    const templateId = this.getAttribute("message.template");
                    if (templateId) {
                        const data = MessageBackgroundData.PresetData.get(templateId);
                        h1.innerText = data.text;
                        this.background = data.background;
                    }
                }
            }
            fragment.append(await this.background.getBackgrounds(), h1);
            this.#shadowRoot.append(fragment);
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
