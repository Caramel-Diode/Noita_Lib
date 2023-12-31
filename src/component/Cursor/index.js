const Cursor = (() => {
    /** @type {Cursor} */ let instance = null;
    const HTMLNoitaCursorElement = class extends HTMLElement {
        #shadowRoot = this.attachShadow({ mode: "closed" });
        constructor() {
            super();
        }

        connectedCallback() {
            document.body.style.cursor = "none";
            this.#shadowRoot.adoptedStyleSheets = [gss(embed(`#base.css`))];
            document.addEventListener("mousemove", event => {
                const targetStyle = getComputedStyle(event.target);
                const cursorStyle = targetStyle.cursor;
                if (cursorStyle !== "none") {
                    event.target.style.setProperty("--noita-cursor", cursorStyle);
                    event.target.style.setProperty("cursor", "none");
                } else {
                    this.className = "";
                }
                const noitaCursorStyle = targetStyle.getPropertyValue("--noita-cursor");
                if (noitaCursorStyle) {
                    this.className = noitaCursorStyle;
                }
                this.style.left = `${event.clientX}px`;
                this.style.top = `${event.clientY}px`;
            });
        }

        /** @type {Array<String>} 属性变化监听列表 */
        static observedAttributes = [];

        /**
         * @param {String} name 更新的属性名
         * @param {String} oldValue 旧值
         * @param {String} newValue 新值
         */
        attributeChangedCallback(name, oldValue, newValue) {}

        static add() {
            if (instance) console.warn("你为什么两次鼠标指针捏?");
            else if (matchMedia("(pointer:fine)").matches) {
                // 检测设备是否使用鼠标
                instance = new this();
                document.body.append(instance);
            }
        }
        static remove() {
            if (instance) {
                instance.remove();
                instance = null;
            } else console.warn("不存在鼠标指针");
        }
    };
    return Object.freeze(HTMLNoitaCursorElement);
})();
customElements.define("noita-cursor", Cursor);
