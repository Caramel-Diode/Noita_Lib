/** @param {String} name */
const humpNaming = name => {
    const chars = [...name];
    for (let i = 0; i < chars.length; i++) {
        const char = chars[i];
        if (char === "_") {
            chars[i] = "";
            i++;
            chars[i] = chars[i]?.toLocaleUpperCase() ?? "";
        }
    }
    return chars.join("");
};

const toHumpNamingObject = obj => {
    const r = {};
    for (const key in obj) {
        r[humpNaming(key)] = obj[key];
    }
    return r;
};

const zh_cn = langData.getZH_CN;

class NoitaEntity {
    static #compsEnum = ["ProjectileComponent", "AnimalAIComponent", "AIAttackComponent", "DamageModelComponent", "LifetimeComponent", "WormAIComponent", "WormComponent"];
    /** @param {ElementNode<"Entity">} element */
    constructor(element) {
        this.nameKey = element.attr.get("name")?.slice(1) ?? "";
        this.sprite = element.childNodes.query("SpriteComponent")[0];
        if (this.nameKey) this.name = zh_cn(this.nameKey);
        /** @type {ElementNode<"Base">} */
        const $base = element.childNodes.query("Base")[0];
        if ($base) {
            element.childNodes.push(...$base.childNodes);
            const { promise, reject, resolve } = Promise.withResolvers();
            /** @type {Promise<ElementNode<"Base">>} */
            this.$base = promise;
            const path = $base.attr.get("file");
            fetch(`/${path}`).then(async response => {
                const doc = XML.parse(await response.text(), { ignore: ["#text", "#comment"] });
                const r = new NoitaEntity(doc.childNodes[0]);
                r["☆from☆"] = [...(this["☆from☆"] ?? []), path];
                resolve(r);
            });
        }
        /** @type {Array<ElementNode<"">>} */
        const comps = element.childNodes.query(node => NoitaEntity.#compsEnum.includes(node.tagName), false);
        // console.log(comps, element.childNodes);
        for (const comp of comps) {
            const tagName = comp.tagName;
            if (tagName === "ProjectileComponent") {
                if (this.projectileComponent) {
                    console.warn("出现重复的组件", tagName);
                    continue; // 跳过
                }
                this.projectileComponent = toHumpNamingObject(new ProjectileComponent(comp));
            } else if (tagName === "AnimalAIComponent" || tagName === "AIAttackComponent") {
                if (!this.animalAIComponents) this.animalAIComponents = [];
                const animalAIComponent = new AnimalAIComponent(comp);
                const _ = {};
                for (const key in animalAIComponent) _[humpNaming(key)] = animalAIComponent[key];
                this.animalAIComponents.push(_);
            } else if (tagName === "DamageModelComponent") {
                if (this.damageModelComponent) {
                    console.warn("出现重复的组件", tagName);
                    continue; // 跳过
                }
                this.damageModelComponent = toHumpNamingObject(new DamageModelComponent(comp));
            } else if (tagName === "LifetimeComponent") {
                if (this.lifetimeComponent) {
                    console.warn("出现重复的组件", tagName);
                    continue; // 跳过
                }
                this.lifetimeComponent = toHumpNamingObject(new LifetimeComponent(comp));
            } else if (tagName === "WormAIComponent" || tagName === "WormComponent") {
                if (this.wormAIComponent) {
                    console.warn("出现重复的组件", tagName);
                    continue; // 跳过
                }
                this.wormAIComponent = toHumpNamingObject(new WormAIComponent(comp));
            }
        }
        console.log(this);
    }
    /** 计算最终属性 */
    async calcValues() {
        const $base = (await this.$base) ?? {};
        $base.calcValues?.();
        if (this.projectileComponent || $base.projectileComponent) {
            const _ = Object.assign({}, this.projectileComponent ?? {}, $base.projectileComponent ?? {});
            this.projectileComponent = _;
        }
        delete this.$base;
        return this;
    }
    toString() {
        const resultObject = {};
    }
}
const start = async XMLPath => {
    const entityXMLData = await (await fetch(`/${XMLPath}`)).text();
    const doc = XML.parse(entityXMLData, { ignore: ["#text", "#comment"] });
    const entity = new NoitaEntity(doc.childNodes[0]);
    const imgXMLPath = entity.sprite.attr.get("image_file");
    loadSpriteAnimation(imgXMLPath);
};

const loadSpriteAnimation = async url => {
    const spriteXMLData = await (await fetch(`/${url}`)).text();
    const sprite = new Sprite(XML.parse(spriteXMLData));
    await sprite.ready;
    const container = document.querySelector("#animations");
    for (const e of sprite.canvas) {
        const label = createElement("label");
        const viewport = createElement("div");
        viewport.className = "animation-viewport";
        viewport.style = `--n:${e.frameData.count};--h:${e.frameData.h}px;--w:${e.frameData.w}px`;
        viewport.append(e);
        const span = createElement("span");
        span.innerText = e.frameData.name;
        label.append(span, viewport);
        container.append(label);
    }
};

(async () => {
    await langData.ready;
    // const animalList = await Promise.all(
    //     animalList
    //         .map(async e => XML.parse(await (await fetch(`animal_xmls/${e}.xml`)).text()))
    // );

    animalList.forEach(async (v, i, a) => void (a[i] = XML.parse(await (await fetch(`entity_xmls/${v}.xml`)).text())));
    console.log(animalList);
})();
