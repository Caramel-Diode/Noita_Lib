/** @typedef {import("TYPE").MessageBackgroundId} MessageBackgroundId */
/** @typedef {import("TYPE").MessagePresetId} MessagePresetId */
/** @typedef {import("TYPE").Preset$[MessagePresetId]} MessagePresetContent */
const Message = (() => {
    embed(`#db.js`);
    MessageBackgroundData.init();
    MessagePresetData.init();
    const styleSheet = { base: gss(embed(`#base.css`)) };
    // 默认使用 important 样式
    MessageBackgroundData.query("important").url.then(v => styleSheet.base.insertRule(`:host{--url:url("${v}")}`));

    //prettier-ignore
    for (const [id, data] of MessageBackgroundData.data_map) 
        data.url.then(v => styleSheet.base.insertRule(String.raw`:host([message\.style="${id}"]){--url:url("${v}")}`));
    //prettier-ignore
    for (const [id, data] of MessagePresetData.data_map) 
        data.background.url.then(v => styleSheet.base.insertRule(String.raw`:host([message\.preset="${id}"]){--url:url("${v}")}`));

    return class HTMLNoitaMessageElement extends $class(Base, {
        displayMode: { name: "display", $default: "#" },
        /** @type {$ValueOption<MessageBackgroundId>} */
        messageStyle: { name: "message.style", $default: "important" },
        /** @type {$ValueOption<MessagePresetContent>} */
        messageContent: { name: "message.content", $default: "使用 message.content 属性设置或者直接在内部填充内容" },
        /** @type {$ValueOption<MessagePresetId>} */
        messagePreset: { name: "message.preset" }
    }) {
        /** @type {ShadowRoot} */ #shadowRoot = this.attachShadow({ mode: "closed" });

        constructor(...param) {
            super();
            if (param.length > 1) {
                this.messageStyle = param[0];
                this.messageContent = param[1];
            } else if (param.length === 1) this.messagePreset = param[0];
        }

        /** @param {Array<CSSStyleSheet>} [extraStyleSheets] 额外样式表 */
        [$symbols.initStyle](extraStyleSheets = []) {
            extraStyleSheets.push(styleSheet.base);
            super[$symbols.initStyle](extraStyleSheets);
        }

        contentUpdate() {
            const preset = this.messagePreset;
            const presetData = MessagePresetData.query(this.messagePreset);
            this.#shadowRoot.innerHTML = `<h1><slot>${presetData?.text ?? this.messageContent}</slot></h1>`;
            this[$symbols.initStyle]();
        }

        connectedCallback() {
            this.contentUpdate();
        }

        //prettier-ignore
        get [Symbol.toStringTag]() { return `HTMLNoitaMessageElement #${this.background.id}` }
    };
})();
customElements.define("noita-message", freeze(Message));
