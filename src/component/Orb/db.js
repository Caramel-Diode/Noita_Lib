class OrbData {
    static spellIconUrls = new SpriteSpliter("OrbSpellIcons", embed(`#orb-spells.png`), null, 11).results;
    static orbUrls = new SpriteSpliter("OrbBackgrounds", embed(`#orbs.png`), 154, 4).results;
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
        const datas = [...[
            "common","空",,
            "red",   "空",,
            "discovered","熟悉的真理魔球",,
            "evil", "腐化魔球",,
            "0","岩浆之海魔球",0,
            "1","召唤地震魔球",1,
            "2","触手魔球",2,
            "3","核弹魔球",3,
            "4","死灵术魔球",4,
            "5","神圣炸弹魔球",5,
            "6","螺旋魔弹魔球",6,
            "7","雷云魔球",7,
            "8","烟花魔球",8,
            "9","召唤诱饵鹿魔球",9,
            "10","水泥魔球",10
        ].values().chunks(3)];
        for (let i = 0; i < datas.length; i++) {
            const data = freeze(new this(datas[i]));
            this.data.set(data.id, data);
        }
    }
}
