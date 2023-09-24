component.perk = class extends component.base {
    static {
        const superStyleSheets = super.prototype.publicStyleSheets;
        this.prototype.publicStyleSheets = {
            /** @type {Array<CSSStyleSheet>} */
            icon: [...superStyleSheets.icon, gss(`"PerkElement_icon.css"`)],
            /** @type {Array<CSSStyleSheet>} */
            panel: [...superStyleSheets.panel, gss(`"PerkElement_panel.css"`)]
        };
        customElements.define("noita-perk", this);
    };

    /** @type {ShadowRoot} */
    #shadowRoot = this.attachShadow({ mode: "closed" });
    #displayMode;

    static observedAttributes = [...super.observedAttributes, "perk.id", "perk.name", "perk.count"];
    /** @type {DB.perk} */
    perkData;

    instanceData = {
        count: 1
    };

    constructor(...param) {
        super();
        let option = null;
        if (typeof param[0] === "object") {
            option = param[0];
            if (option.id) {
                this.setAttribute("perk.id", option.id);
            } else if (option.name) {
                this.setAttribute("perk.name", option.name);
            } else if (option.data) {
                this.perkData = option.data;
            }
            if (option.display) {
                this.setAttribute("display", option.display);
            }
            if (option.instanceData) {
                this.setAttribute("perk.count", option.instanceData.remain.toString());
                this.instanceData = option.instanceData;
            }
        }
    };

    async #loadIconContent() {
        const fragment = document.createDocumentFragment();
        this.#shadowRoot.adoptedStyleSheets = this.publicStyleSheets.icon;
        const div_background = document.createElement("div");
        div_background.classList.add("background", this.perkData.type);
        div_background.append(await this.perkData.getIcon());
        fragment.append(div_background);
        if (this.instanceData.count !== 1) {
            const data_count = document.createElement("data");
            data_count.append(this.instanceData.count.toString());
            fragment.append(data_count);
        }
        this.#shadowRoot.append(fragment);
        this.title = `${this.perkData.name}\n${this.perkData.id}\n${this.perkData.description}`;
    };

    async #loadPanelContent() {

    };

    contentUpdate() {
        this.#shadowRoot.innerHTML = "";
        this.#shadowRoot.adoptedStyleSheets = [];
        const displayMode = this.getAttribute("display");
        if (displayMode) this.#displayMode = displayMode;
        else {
            this.setAttribute("display", "icon");
            this.#displayMode = "icon";
        }
        const perkId = this.getAttribute("perk.id");
        if (perkId) this.perkData = DB.perk.queryById(perkId);
        else {
            const perkName = this.getAttribute("perk.name");
            if (perkName) this.perkData = DB.perk.queryByName(perkName);
            else {
                if (this.perkData === undefined) this.perkData = DB.perk.$NULL;
            }
        }
        const perkCount = this.getAttribute("perk.count");
        if (perkCount !== null && perkCount !== "") {
            this.instanceData.count = Number(perkCount);
        }
        if (this.#displayMode === "panel") this.#loadPanelContent();
        else this.#loadIconContent();
    };

    connectedCallback() {
        this.contentUpdate();
    };

    toString() {
        return `[obejct HTMLNoitaPerkElement #${this.perkData.id}]`;
    };

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === null) return;
        else if (newValue === oldValue) return;
        else {
            switch (name) {
                case "perk.id":
                case "perk.name":
                case "perk.count":
                    this.perkData = null;
                    break;
                case "display": this.#displayMode = undefined;
            }
            this.contentUpdate();
        }
    };
};