const Orb = (() => {
    embed(`#db.js`);
    OrbData.init();
    const styleSheet = css(embed(`#base.css`), { name: "orb-base" });
    OrbData.orbUrls.then(v => {
        /** @type {CSSLayerBlockRule} */
        const layer = styleSheet.cssRules[0];
        layer.insertRule(`:host{--bg:url(${v[0]})}`);
        layer.insertRule(String.raw`:host([orb\.id="red"]){--bg:url(${v[1]})}`);
        layer.insertRule(String.raw`:host([orb\.id="discovered"]){--bg:url(${v[2]})}`);
        layer.insertRule(String.raw`:host([orb\.id="evil"]){--bg:url(${v[3]})}`);
    });
    return class HTMLNoitaOrbElement extends $extends(Base, {
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

        static [$css] = { base: [styleSheet] };

        /**
         * @override
         * @see Base#contentUpdate
         */
        [$content]() {
            const { spellIcon, name } = (this.orbData = OrbData.data.get(this.orbId));
            if (this.orbId === "common" || this.orbId === "red") this.shadowRoot.append(h.div({ class: "insert" }, h.slot()));
            else this.shadowRoot.append(spellIcon);
            this.title = name;
        }

        //prettier-ignore
        get [Symbol.toStringTag]() { return `HTMLNoitaMessageElement #${this.orbId}` }
    };
})();
h["noita-orb"] = freeze(Orb);
