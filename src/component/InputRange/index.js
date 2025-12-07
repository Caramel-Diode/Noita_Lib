class HTMLNoitaInputRangeElement extends $extends(HTMLElement, {
    /** @type {$ValueOption<"0">} */
    min: { name: "min", $default: "0" },
    /** @type {$ValueOption<"100">} */
    max: { name: "max", $default: "100" }
}) {
    static #styleSheet = [globalCSS, css(embed(`#base.css`), { name: "input-range-base" })];
    #shadowRoot = this.attachShadow({ mode: "closed" });
    /** @type {HTMLButtonElement} 滑块 */
    #thumb;
    /** @type {HTMLInputElement} 内置input:range */
    #range;
    constructor() {
        super();
        this.#shadowRoot.adoptedStyleSheets = HTMLNoitaInputRangeElement.#styleSheet;
    }

    contentUpdate() {
        const thumb = (this.#thumb = h.button({ class: "thumb", tabindex: -114514 }));
        const track = h.div({ class: "track" });
        const inputRange = (this.#range = h.inputRange());
        inputRange.value = this.getAttribute("value") ?? 0;
        inputRange.addEventListener("input", event => {
            inputRange.max = this.offsetWidth - this.offsetHeight;
            thumb.style.left = inputRange.value + "px";
            this.setAttribute("value", Math.round(Number(this.min) + ((Number(this.max) - Number(this.min)) * inputRange.valueAsNumber) / inputRange.max));
            this.title = this.value;
            this.dispatchEvent(new InputEvent(event.type));
        });
        /// 模拟hover
        inputRange.addEventListener("mousemove", ({ offsetX }) => {
            if (offsetX >= /* left */ inputRange.valueAsNumber && offsetX <= /* right */ inputRange.valueAsNumber + this.offsetHeight) thumb.classList.add("hover");
            else thumb.classList.remove("hover");
        });
        inputRange.addEventListener("mouseleave", () => thumb.classList.remove("hover"));

        this.#shadowRoot.append(thumb, track, inputRange);

        inputRange.min = 0;
        addEventListener("load", () => (inputRange.max = this.offsetWidth - this.offsetHeight));
        this.title = this.value ?? 0;
    }

    connectedCallback() {
        if (this.#shadowRoot.children.length) return; // 防止重复渲染
        this.role = "slider"; //无障碍: 滑动条
        this.contentUpdate();
    }

    get value() {
        return this.getAttribute("value");
    }

    set value(value) {
        this.#range.value = (+value * this.#range.max) / (+this.max - +this.min);
        this.#thumb.style.left = this.#range.value + "px";
    }

    get valueAsNumber() {
        return +this.value;
    }

    //prettier-ignore
    get [Symbol.toStringTag]() { return "HTMLNoitaInputRangeElement" }
}
h["noita-input-range"] = freeze(HTMLNoitaInputRangeElement);
