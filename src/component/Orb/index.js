const Orb = (() => {
    embed(`#db.js`);
    OrbData.init();
    const styleSheet = gss(embed(`#base.css`));
    OrbData.orbUrls.then(v => {
        styleSheet.insertRule(`:host{--bg:url(${v.common})}`);
        styleSheet.insertRule(String.raw`:host([orb\.id="red"]){--bg:url(${v.red})}`);
        styleSheet.insertRule(String.raw`:host([orb\.id="discovered"]){--bg:url(${v.discovered})}`);
        styleSheet.insertRule(String.raw`:host([orb\.id="evil"]){--bg:url(${v.evil})}`);
    });

    return class HTMLNoitaOrbElement extends $class(Base, {
        displayMode: { name: "display", $default: "#" },
        /** @type {$ValueOption<SpellId|SpellName|SpellAlias>} */
        orbId: { name: "orb.id", $default: "common" }
    }) {
        /** @type {ShadowRoot} */ #shadowRoot = this.attachShadow({ mode: "closed" });
        constructor(id = "common") {
            super();
            this.orbId = id;
        }

        contentUpdate() {
            this.#shadowRoot.innerHTML = "";
            const data = OrbData.data.get(this.orbId);
            this.orbData = data;
            if (this.orbId === "common" || this.orbId === "red") this.#shadowRoot.append(h.div({ class: "insert" }, h.slot()));
            else this.#shadowRoot.append(data.spellIcon);
            this.title = data.name;
            super[$symbols.initStyle]([styleSheet]);
        }

        connectedCallback() {
            this.contentUpdate();
        }
    };
})();
customElements.define("noita-orb", freeze(Orb));
