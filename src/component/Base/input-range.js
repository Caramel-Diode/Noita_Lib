class HTMLNoitaInputRangeElement extends $class(HTMLElement, {
    /** @type {$ValueOption<"0">} */
    min: { name: "min", $default: "0" },
    /** @type {$ValueOption<"100">} */
    max: { name: "max", $default: "100" }
}) {
    static #styleSheet = [styleSheet.base, css(embed(`#input-range.css`))];
    #shadowRoot = this.attachShadow({ mode: "closed" });
    /** @type {HTMLButtonElement} 滑块 */
    #thumb = h.button({ class: "thumb", tabindex: -114514 });
    /** @type {HTMLInputElement} 内置input:range */
    #range = h.inputRange();

    connectedCallback() {
        this.role = "slider"; //无障碍: 滑动条
        const thumb = this.#thumb;
        const track = h.div({ class: "track" });
        const inputRange = this.#range;
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
        this.#shadowRoot.adoptedStyleSheets = HTMLNoitaInputRangeElement.#styleSheet;
        inputRange.min = 0;
        addEventListener("load", () => (inputRange.max = this.offsetWidth - this.offsetHeight));
        this.title = this.value ?? 0;
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
}

customElements.define("noita-input-range", freeze(HTMLNoitaInputRangeElement));
