const Status = (() => {
    embed(`#db.js`);
    StatusData.init();

    const styleSheet = {
        icon: css(embed(`#icon.css`)),
        panel: css(embed(`#panel.css`))
    };

    return class HTMLNoitaStatusElement extends $class(Base, {
        /** @type {$ValueOption<"icon"|"panel">} */
        displayMode: { name: "display", $default: "icon" },
        /** @type {$ValueOption<String>} */
        statusId: { name: "status.id" },
        /** @type {$ValueOption<String>} 同个id会存在不同的状态阶段 这个值用于区分阶段 */
        statusThreshold: { name: "status.threshold", $default: "0" }
    }) {
        /** @type {typeof StatusData.query} */
        static query = StatusData.query.bind(StatusData);

        /** @type {StatusData} */
        statusData;

        /**
         * @param {String} [id] 状态id
         * @param {Number} [threshold] 状态阶段值
         */
        constructor(id, threshold) {
            super();
            if (id) this.statusId = id;
            if (threshold) this.statusThreshold = threshold;
        }

        /** @param {Array<CSSStyleSheet>} [extraStyleSheets] 额外样式表 */
        [$symbols.initStyle](extraStyleSheets = []) {
            let { displayMode } = this;
            if (displayMode.startsWith("panel")) {
                extraStyleSheets.push(styleSheet.panel);
                displayMode = "panel";
            } else if (displayMode.startsWith("icon")) {
                extraStyleSheets.push(styleSheet.icon);
                displayMode = "icon";
            }
            super[$symbols.initStyle](extraStyleSheets, displayMode);
        }

        #loadPanelContent() {}

        #loadIconContent() {
            this.shadowRoot.append(this.statusData.icon);
            promptMsg.attach(this, [h.pre(this.statusData.desc.replaceAll("\\n", "\n"))]);
        }

        /**
         * @override
         * @see Base#contentUpdate
         */
        contentUpdate() {
            this.statusData = StatusData.query(this.statusId, +this.statusThreshold);
            this[$symbols.initStyle]();

            switch (this.displayMode) {
                case "panel":
                    this.#loadPanelContent();
                    break;
                case "icon":
                    this.#loadIconContent();
                    break;
            }
        }

        get [Symbol.toStringTag]() {
            return `HTMLNoitaStatusElement < ${this.statusData.id} >`;
        }
    };
})();
customElements.define("noita-status", freeze(Status));
