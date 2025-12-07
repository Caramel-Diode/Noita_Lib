class Icon extends $icon(12, "状态") {
    static urls = new SpriteSpliter("StatusIcons", embed(`#icon.png`), 12).results;
    /** @type {StatusData?} */ #data;

    /** @param {StatusData} data  */
    constructor(data) {
        super();
        this.#data = data;
    }

    connectedCallback() {
        const data = this.#data ?? StatusData.query(this.dataset.id, +this.getAttribute("status.threshold"));
        this.alt = data.name;
        this.src = data.asyncIconUrl;
    }
}

Icon.define("-status");

class StatusData {
    /** @type {Map<String,Array<StatusData>>} */
    static data = new Map();

    /**
     *
     * @param {String} id
     * @param {Number} threshold
     */
    static query(id, threshold) {
        const datas = this.data.get(id);
        if (!datas) return;
        if (datas.length === 1) return datas[0];
        for (let i = 0; i < datas.length; i++) {
            const data = datas[i];
            if (threshold <= data.threshold) return data;
        }
        return datas.at(-1);
    }
    /** @type {Number} */
    #iconIndex;

    constructor(data) {
        [this.id, this.name, this.desc, this.entity, this.#iconIndex, , this.threshold] = data;
        [this.fireProtection, this.harmful, this.removeCells] = new Bits(data[5]).toArray(3);
    }

    /** @return {Promise<String>} */
    get asyncIconUrl() {
        return new Promise(resolve => Icon.urls.then(value => resolve(value[this.#iconIndex])));
    }

    get icon() {
        return new Icon(this);
    }

    static init() {
        [...embed(`#data.js`).values().chunks(7)].forEach(e => {
            const data = freeze(new this(e));
            const exists = this.data.get(data.id);
            if (exists) exists.push(data);
            else this.data.set(data.id, [data]);
        });
    }
}
