const Message = (() => {
    embed(`#db.js`);
    MessageData.init();
    const styleSheet = css(embed(`#base.css`));
    // 默认使用 important 样式
    MessageData.backgrounds.important.then(url => styleSheet.insertRule(`:host{--url:url("${url}")}`));

    //prettier-ignore
    for (const id in MessageData.backgrounds) // 根据背景ID设定9点图样式
        MessageData.backgrounds[id].then(url => styleSheet.insertRule(String.raw`:host([message\.style="${id}"]){--url:url("${url}")}`));

    //prettier-ignore
    for (const [id, { background }] of MessageData.data) // 根据预设ID设定9点图样式
        background.then(url => styleSheet.insertRule(String.raw`:host([message\.preset="${id}"]){--url:url("${url}")}`));

    return class HTMLNoitaMessageElement extends $class(Base, {
        /** @type {$ValueOption<String>} 禁用显示模式 */
        displayMode: { name: "display", $default: "#" },
        /** @type {$ValueOption<String>} */
        messageStyle: { name: "message.style", $default: "important" },
        /** @type {$ValueOption<String>} */
        messageContent: { name: "message.content", $default: "" },
        /** @type {$ValueOption<String>} */
        messagePreset: { name: "message.preset" }
    }) {
        /**
         * @overload 自定义
         * @param {String} style 样式
         * @param {String} content 内容
         */
        /**
         * @overload 预设
         * @param {String} preset 预设方案
         */
        /**
         * @param {String} [p1]
         * @param {String} [p2]
         */
        constructor(p1, p2) {
            super();
            if (p2) {
                this.messageStyle = p1;
                this.messageContent = p2;
            } else if (p1) this.messagePreset = p1;
        }

        /** @param {Array<CSSStyleSheet>} [extraStyleSheets] 额外样式表 */
        [$symbols.initStyle](extraStyleSheets = []) {
            extraStyleSheets.push(styleSheet);
            super[$symbols.initStyle](extraStyleSheets);
        }

        /**
         * @override
         * @see Base#contentUpdate
         */
        contentUpdate() {
            this.shadowRoot.append(h.h1(h.slot(MessageData.data.get(this.messagePreset)?.text ?? this.messageContent ?? "内部未填充内容")));
            this[$symbols.initStyle]();
        }

        //prettier-ignore
        get [Symbol.toStringTag]() { return `HTMLNoitaMessageElement #${this.background.id}` }
    };
})();
customElements.define("noita-message", freeze(Message));
