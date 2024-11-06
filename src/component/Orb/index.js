const Orb = (() => {
    embed(`#db.js`);
    OrbData.init();
    const styleSheet = css(embed(`#base.css`));
    OrbData.orbUrls.then(v => {
        styleSheet.insertRule(`:host{--bg:url(${v[0]})}`);
        styleSheet.insertRule(String.raw`:host([orb\.id="red"]){--bg:url(${v[1]})}`);
        styleSheet.insertRule(String.raw`:host([orb\.id="discovered"]){--bg:url(${v[2]})}`);
        styleSheet.insertRule(String.raw`:host([orb\.id="evil"]){--bg:url(${v[3]})}`);
    });

    return class HTMLNoitaOrbElement extends $class(Base, {
        /** @type {$ValueOption<String>} 禁用显示模式 */
        displayMode: { name: "display", $default: "#" },
        /** @type {$ValueOption<SpellId|SpellName|SpellAlias>} */
        orbId: { name: "orb.id", $default: "common" }
    }) {
        /**
         * @param {String} [id] 魔球id
         */
        constructor(id) {
            super();
            if (id) this.orbId = id;
        }

        /**
         * @override
         * @see Base#contentUpdate
         */
        contentUpdate() {
            this.shadowRoot.innerHTML = "";
            const { spellIcon, name } = (this.orbData = OrbData.data.get(this.orbId));
            if (this.orbId === "common" || this.orbId === "red") this.shadowRoot.append(h.div({ class: "insert" }, h.slot()));
            else this.shadowRoot.append(spellIcon);
            this.title = name;
            super[$symbols.initStyle]([styleSheet]);
        }

        //prettier-ignore
        get [Symbol.toStringTag]() { return `HTMLNoitaMessageElement #${this.orbId}` }
    };
})();
customElements.define("noita-orb", freeze(Orb));
