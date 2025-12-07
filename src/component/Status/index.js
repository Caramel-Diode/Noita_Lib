const Status = (() => {
    embed(`#db.js`);
    StatusData.init();

    return class HTMLNoitaStatusElement extends $extends(Base, {
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

        #loadPanelContent() {}

        #loadIconContent() {
            this.shadowRoot.append(this.statusData.icon);
            hoverMsg.attachWithPanel(this, [h.pre(this.statusData.desc.replaceAll("\\n", "\n"))]);
        }

        static [$css] = {
            icon: [css(embed(`#icon.css`), { name: "status-icon" })],
            panel: [css(embed(`#panel.css`), { name: "status-panel" })]
        };

        [$content]() {
            this.statusData = StatusData.query(this.statusId, +this.statusThreshold);
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
h["noita-status"] = freeze(Status);
