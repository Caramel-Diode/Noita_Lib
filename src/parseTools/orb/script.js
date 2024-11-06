const orb = {
    blank: "orb.png",
    red: "orb_red.png",
    discovered: "orb_discovered.png",
    evil: "orb_red_evil.png",
    0: "orb_00.png",
    1: "orb_01.png",
    2: "orb_02.png",
    3: "orb_03.png",
    4: "orb_04.png",
    5: "orb_05.png",
    6: "orb_06.png",
    7: "orb_07.png",
    8: "orb_08.png",
    9: "orb_09.png",
    10: "orb_10.png"
};

/**
 * @returns {Promise<Array<HTMLImageElement>>}
 */
const getSpellOrbs = () => Promise.all([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(e => PNG.removeGAMA("/data/items_gfx/orbs/" + orb[e])));
/**
 *
 * @param {Number} index
 * @param {Uint8Array} data
 */
const pixelEqual = (index, data) => {
    const bgData = mainImgData.data;
    return data[index] === bgData[index] && data[index + 1] === bgData[index + 1] && data[index + 2] === bgData[index + 2] && data[index + 3] === bgData[index + 3];
};
/**
 *
 * @param {HTMLCanvasElement} canvas
 */
const removeBg = canvas => {
    const ctx = canvas.getContext("2d");
    const imgdata = ctx.getImageData(0, 0, 20, 20);
    const { data } = imgdata;
    for (let i = 0; i < data.length; i += 4) {
        if (pixelEqual(i, data)) data[i + 3] = 0; //相同像素设置为透明
    }
    ctx.clearRect(0, 0, 20, 20);
    ctx.putImageData(imgdata, 0, 0);
};

/** @type {HTMLCanvasElement} */
const mainCanvas = new Canvas(20, 20);
const mainCtx = mainCanvas.getContext("2d");
/** @type {ImageData} */
let mainImgData = null;

const allOrbCanvas = {
    blank: null,
    red: null,
    discovered: null,
    evil: null
};
(async () => {
    const img = new Image();
    img.addEventListener("load", async () => {
        mainCtx.drawImage(img, 10, 26, 20, 20, 0, 0, 20, 20);
        mainImgData = mainCtx.getImageData(0, 0, 20, 20);
        const canvas = new Canvas(154, 42);
        const ctx = canvas.getContext("2d");
        let currentX = 0;
        for (let i = 0; i < 7; i++) {
            let x = 40 * i;
            ctx.drawImage(img, x + 9, 5, 22, 42, currentX, 0, 22, 42);
            currentX += 22;
        }
        // document.body.append(canvas, mainCanvas);
        // document.body.append(canvas);
        allOrbCanvas.blank = canvas;
        const spellOrbs = await getSpellOrbs();
        /** @type {HTMLCanvasElement} */
        const canvas_Spells = new Canvas(20 * 11, 20);
        const ctx_Spells = canvas_Spells.getContext("2d");
        let currentX_ = 0;
        for (const img of spellOrbs) {
            const cvs = new Canvas(20, 20);
            const ctx = cvs.getContext("2d");
            ctx.drawImage(img, 10, 26, 20, 20, 0, 0, 20, 20);
            removeBg(cvs);
            ctx_Spells.drawImage(cvs, currentX_, 0);
            currentX_ += 20;
        }
        document.body.append(canvas_Spells);
    });
    img.src = "/data/items_gfx/orbs/" + orb.blank;
})();

(async () => {
    for (const e of ["red", "discovered", "evil"]) {
        const img = new Image();
        img.addEventListener("load", () => {
            const canvas = new Canvas(154, 42);
            const ctx = canvas.getContext("2d");
            let currentX = 0;
            for (let i = 0; i < 7; i++) {
                let x = 40 * i;
                ctx.drawImage(img, x + 9, 5, 22, 42, currentX, 0, 22, 42);
                currentX += 22;
            }
            // document.body.append(canvas);
            allOrbCanvas[e] = canvas;
        });
        img.src = "/data/items_gfx/orbs/" + orb[e];
    }
})();

document.querySelector("#gen-data")?.addEventListener("click", () => {
    // document.body.append(allOrbCanvas.blank, allOrbCanvas.red, allOrbCanvas.discovered, allOrbCanvas.evil);
    /** @type {HTMLCanvasElement} */
    const canvas = new Canvas(154 * 4, 42);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(allOrbCanvas.blank, 0, 0);
    ctx.drawImage(allOrbCanvas.red, 154, 0);
    ctx.drawImage(allOrbCanvas.discovered, 154 * 2, 0);
    ctx.drawImage(allOrbCanvas.evil, 154 * 3, 0);
    document.body.append(canvas);
});
