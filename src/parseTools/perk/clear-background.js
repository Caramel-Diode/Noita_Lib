const getImgDataWithoutBg = (async () => {
    /** @type {Uint8ClampedArray} */
    const bgData_common = await (() => {
        const img = createElement("img");
        const canvas = createElement("canvas");
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext("2d");
        return new Promise((resolve, reject) => {
            img.addEventListener("load", () => {
                ctx.drawImage(img, 0, 0);
                resolve(ctx.getImageData(0, 0, 16, 16).data);
            });
            /** 该图像数据为通用的天赋背景框 */
            img.src = `bg-common.png`;
        });
    })();
    /** @type {Uint8ClampedArray} */
    const bgData_essence = await (() => {
        const img = createElement("img");
        const canvas = createElement("canvas");
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext("2d");
        return new Promise((resolve, reject) => {
            img.addEventListener("load", () => {
                ctx.drawImage(img, 0, 0);
                resolve(ctx.getImageData(0, 0, 16, 16).data);
            });
            /** 该图像数据为精粹背景框 */
            img.src = `bg-essence.png`;
        });
    })();
    /**
     * 对比像素是否完全相同
     * @param {ImageData} data 待比较的图像数据
     * @param {Number} index 像素信息索引
     * @returns {Boolean}
     */
    const pixelEqual = (data, index, bgData = bgData_common) => {
        const X = (index / 4) % 16;
        const Y = (index / 4 - X) / 16;
        // console.log(`(${X},${Y})   `, "R:", bgData[index], "G:", bgData[index + 1], "B:", bgData[index + 2], "A:", bgData[index + 3]);
        // console.log(`#(${X},${Y})   `, "R:", data[index], "G:", data[index + 1], "B:", data[index + 2], "A:", data[index + 3]);
        return data[index] === bgData[index] && data[index + 1] === bgData[index + 1] && data[index + 2] === bgData[index + 2] && data[index + 3] === bgData[index + 3];
    };
    const $bgData = {
        common: bgData_common,
        essence: bgData_essence
    };
    /**
     * 获取不带背景框的图像数据
     * @param {HTMLImageElement} img
     * @param {"common"|"essence"} [type] 类型(精粹与普通天赋的背景不一样)
     */
    return (img, type = "common") => {
        const bgData = $bgData[type];
        const canvas = createElement("canvas");
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, 16, 16);
        const data = imgData.data;
        // console.groupCollapsed(`像素对比信息 ${img.src}`);
        for (let i = 0; i < data.length; i += 4) {
            if (pixelEqual(data, i, bgData)) data[i + 3] = 0; //相同像素设置为透明
        }
        // console.groupEnd();
        return imgData;
    };
})();
