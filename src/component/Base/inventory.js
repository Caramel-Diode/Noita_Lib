class HTMLNoitaInventoryElement extends $class(HTMLElement, {
    /** @type {$ValueOption<"ol">} */
    type: { name: "type", $default: "ol" },
    /** @type {$ValueOption<"auto">} */
    size: { name: "size", $default: "auto" },
    /** @type {$ValueOption<"false"|"true">} */
    displayBlankSlot: { name: "display.blank-slot", $default: "false" }
}) {
    static #styleSheet = [styleSheet.base, css(embed(`#inventory.css`))];
    #shadowRoot = this.attachShadow({ mode: "open", slotAssignment: "manual" });
    /** @type {HTMLUListElement|HTMLOListElement} */
    #list;

    constructor() {
        super();
    }

    /**
     * ### 初始化列表元素
     * 在初始化后可以使用 `push`,`pop`,`unshift`,`shift`
     * 或者通过返回的列表元素自行添加列表项`<li>`
     * @param  {...HTMLLIElement} lis
     * @returns {HTMLUListElement|HTMLOListElement}
     */
    initList(...lis) {
        this.#list = h[this.type](...lis);
        return this.#list;
    }

    /**
     * 末尾追加
     * @param  {...Node} nodes
     */
    push(...nodes) {
        for (let i = 0; i < nodes.length; i++) this.#list.append(h.li({ part: "inventory-slot" }, nodes[i]));
    }

    /**
     * 末尾移除
     * @returns {HTMLElement}
     */
    pop() {
        const target = this.#list.children[this.#list.children.length - 1];
        if (target) {
            target.remove();
            return target.children[0];
        }
    }

    /**
     * 开头添加
     * @param  {...Node} nodes
     */
    unshift(...nodes) {
        for (let i = 0; i < nodes.length; i++) this.#list.prepend(h.li({ part: "inventory-slot" }, nodes[i]));
    }

    /**
     * 开头移除
     * @returns {HTMLElement}
     */
    shift() {
        const target = this.#list.children[0];
        if (target) {
            target.remove();
            return target.children[0];
        }
    }

    async connectedCallback() {
        this.#shadowRoot.adoptedStyleSheets = HTMLNoitaInventoryElement.#styleSheet;
        /* prettier-ignore */
        /** @type {HTMLUListElement|HTMLOListElement} */
        const list = this.#list ??= h[this.type]();
        this.#shadowRoot.append(list);
        await DOMContentLoaded;
        const { length } = this.children;
        for (let i = 0; i < length; i++) {
            const slot = h.slot();
            list.append(h.li({ part: "inventory-slot" }, slot));
            // 需要slot节点已经被添加到页面后才能分配成功
            queueMicrotask(() => slot.assign(this.children[i]));
        }
        if (isNaN(this.size)) return;
        if (this.displayBlankSlot === "false") return;
        for (let i = this.size - list.children.length; i >= 1; i--) list.append(h.li({ part: "inventory-slot" }));
    }
}
customElements.define("noita-inventory", freeze(HTMLNoitaInventoryElement));
