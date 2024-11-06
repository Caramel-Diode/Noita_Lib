class OrbData {
    static spellIconUrls = new SpriteSpliter("OrbSpellIcons", embed(`#orb-spells.png`)).results;
    static orbUrls = new SpriteSpliter("OrbBackgrounds", embed(`#orbs.png`), 154).results;
    /** @type {Map<String,OrbData>} */
    static data = new Map();
    #spellIndex;
    /**
     * @param {Array} data
     */
    constructor(data) {
        [this.id, this.name, this.#spellIndex] = data;
    }

    get spellIcon() {
        const img = new Image(20, 20);
        img.alt = "魔球法术图标";
        if (this.#spellIndex !== undefined) OrbData.spellIconUrls.then(v => (img.src = v[this.#spellIndex]));
        return img;
    }

    static init() {
        const _ = "真理魔球";
        //prettier-ignore
        const datas = toChunks([
            "common","空",,
            "red",   "空",,
            "discovered","熟悉的真理魔球",,
            "evil", "腐化魔球",,
            "0",_,0,
            "1",_,1,
            "2",_,2,
            "3",_,3,
            "4",_,4,
            "5",_,5,
            "6",_,6,
            "7",_,7,
            "8",_,8,
            "9",_,9,
            "10",_,10
        ],3);
        for (let i = 0; i < datas.length; i++) {
            const data = freeze(new this(datas[i]));
            this.data.set(data.id, data);
        }
    }
}
