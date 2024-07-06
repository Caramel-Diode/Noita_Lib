class Sprite {
    /**
     * @typedef {Object} FramesData
     * @prop {String} name 动画名
     * @prop {Number} count 总帧数
     * @prop {Number} h 高度
     * @prop {Number} w 宽度
     * @prop {Number} x 起始x坐标
     * @prop {Number} y 起始y坐标
     */

    /** @type {Array<FramesData>} */
    #frameDatas = [];
    /** @type {Array<HTMLCanvasElement & {frameData:FramesData}>} */
    canvas = [];
    ready = null;
    /** @param {HTMLImageElement} img */
    #genCanvas(img, resolve) {
        for (const data of this.#frameDatas) {
            const canvas = createElement("canvas");
            canvas.height = data.h;
            canvas.width = data.w * data.count;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, data.x, data.y, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
            canvas.frameData = data;
            this.canvas.push(canvas);
        }
        resolve();
    }

    /** @param {DocumentNode} doc */
    constructor(doc) {
        const img = new Image();
        const { promise, resolve } = Promise.withResolvers();
        img.addEventListener("load", resolve);
        img.src = "/" + doc.childNodes[0].attr.get("filename");
        const rectAnimations = doc.childNodes.query("RectAnimation");
        for (const ra of rectAnimations) {
            const attr = ra.attr;
            this.#frameDatas.push({
                name: attr.get("name"),
                count: Number(attr.get("frame_count")),
                h: Number(attr.get("frame_height")),
                w: Number(attr.get("frame_width")),
                x: Number(attr.get("pos_x")),
                y: Number(attr.get("pos_y"))
            });
        }
        const { promise: promise_, resolve: resolve_ } = Promise.withResolvers();
        this.ready = promise;
        promise.then(() => this.#genCanvas(img, resolve_));
    }
}
