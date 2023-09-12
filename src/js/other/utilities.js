/** `🔧 工具包` */
const utilities = {
    /**
     * 将图像中的白色像素切换为指定颜色
     * @param {ImageData} imageData
     * @param {String} hexColor_str 16进制色值 
     */
    setImageDataColor: (imageData, hexColor_str) => {
        console.log(hexColor_str);
        const hexColor_num = parseInt(hexColor_str, 16);
        const R = (hexColor_num) & 0xFF,
            G = (hexColor_num >> 8) & 0xFF,
            B = (hexColor_num >> 16) & 0xFF,
            A = (hexColor_num >> 24) & 0xFF;
        for (let i = 0; i < imageData.data.length; i += 4) {
            if (imageData.data[i] !== 0) {
                imageData.data[i] = R;
                imageData.data[i + 1] = G;
                imageData.data[i + 2] = B;
                imageData.data[i + 3] = A;
            }
        }
    },
    /**
     * 为正数添加`+`前缀
     * @param {Number} value 
     * @returns {String}
     */
    addPlusSign: value => `${value > 0 ? "+" : ""}${value}`,
    /**
     * 获得夹逼后的值
     * @param {Number} value 待夹逼的值
     * @param {Number} min 最小值
     * @param {Number} max 最大值
     * @returns 夹逼后的值
     */
    clamp: (value, min, max) => Math.min(Math.max(value, min), max),
    /**
     * 抽奖
     * @param {Number} winningRate 中奖率
     * @returns {Boolean} 是否中奖
     */
    draw: winningRate => Math.random() < winningRate,
    /**
     * 以帧为单位转换为以秒为单位 60帧每秒 结果保留两位小数
     * @param {Number} frame 帧
     * @returns {Number} 秒
     */
    frameToSecond: frame => Math.round(frame / 0.6) / 100,
    /**
     * 以弧度为单位转换为以角度为单位
     * @param {Number} rad 弧度
     * @returns {Number} 角度
     */
    radianToDegree: rad => rad * 180 / Math.PI,
    /**
     * 获取以 **度**`°`**分**`′`**秒**`″` 表示的精确角度
     * @param {Number} deg 角度
     * @param {Boolean} [needSign=false] 是否需要前缀`+`
     * @returns {String} 结果
     */
    getExactDegree: (deg, needSign = false) => {
        let temp1 = 0;
        let temp2 = 0;
        const temp3 = [];
        const value_temp = Math.abs(deg);
        const _d = Math.trunc(value_temp);
        temp1 = value_temp - _d;
        temp2 = temp1 * 60;
        const _m = Math.trunc(temp2);
        temp1 = temp2 - _m;
        const _s = Math.trunc(temp1 * 60);

        if (_d !== 0) temp3.push(_d, '°');
        if (_m !== 0) temp3.push(_m, '′');
        if (_s !== 0) temp3.push(_s, '″');
        let temp4 = temp3.join("");
        if (deg < 0) {
            temp4 = "-".concat(temp4);
        } else if (needSign) {
            temp4 = "+".concat(temp4);
        }
        return temp4;
    },
    /**
     * 生成样式表
     * @param {String} rules CSS规则表字符串
     * @returns {CSSStyleSheet} CSS样式表
     */
    generateCSSStyleSheet: rules => {
        const css = new CSSStyleSheet();
        css.replaceSync(rules);
        return css;
    },
    /**
     * 修改指定像素颜色
     * @param {ImageData} imageData 图像数据
     * @param {Number} x X坐标
     * @param {Number} y Y坐标
     * @param {String} hexColor_str 16进制色值
     */
    setImageDataPixelColor: (imageData, x, y, hexColor_str) => {
        const colorDataIndex = imageData.width * 4 * y + 4 * x;
        const hexColor_num = parseInt(hexColor_str, 16);
        imageData.data[colorDataIndex] = (hexColor_num) & 0xFF;//R
        imageData.data[colorDataIndex + 1] = (hexColor_num >> 8) & 0xFF;//G
        imageData.data[colorDataIndex + 2] = (hexColor_num >> 16) & 0xFF;//B
        imageData.data[colorDataIndex + 3] = (hexColor_num >> 24) & 0xFF;//A
    },
    base64ToImg: base64 => new Promise((resolve, reject) => {
        const img = document.createElement("img");
        img.src = base64;
        img.addEventListener("load", () => { resolve(img); });
    }),
    /**
     * 将Base64转为File对象
     * @param {String} base64 
     * @param {String} fileName 
     * @returns {File}
     */
    base64ToFile: (base64, fileName) => {
        const arr = base64.split(",");
        const type = arr[0].match(/:(.*?);/)[1];
        const StringData = atob(arr[1]);
        let i = StringData.length;
        const U8ArrayData = new Uint8Array(i);
        while (i--) U8ArrayData[i] = StringData.charCodeAt(i);
        return new File([U8ArrayData], fileName, { type });
    },
    /**
     * 将Base64转为URL
     * @param {String} base64 
     * @returns {String}
     */
    base64ToObjectURL: base64 => URL.createObjectURL(utilities.base64ToFile(base64, "")),
    /**
     * 拆分精灵图
     * @param {String} base64
     * @yields {Promise}
     */
    divideSprite: base64 => new Promise((resolve, reject) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.src = base64;
        img.addEventListener("load", () => {
            // 图标为正方形
            const iconSize = img.height;
            // 图标是水平排列的
            const iconAmount = img.width / iconSize;
            canvas.width = iconSize;
            canvas.height = iconSize;
            const icons = [];
            for (let i = 0; i < iconAmount; i++) {
                ctx.drawImage(img, -i * iconSize, 0);
                canvas.toBlob(blob => {
                    icons.push(URL.createObjectURL(blob));
                    if (icons.length === iconAmount) resolve(icons);
                }, "image/webp", 1);
                ctx.clearRect(0, 0, iconSize, iconSize);
            }
        });
    }),
    /** 解析相关工具 */
    parse: {
        /** 🏷️ 令牌类 */
        token: class Token {
            static regs = {
                /** 逻辑运算符 */
                logicalOperator: /[|&!]/,
                /** 单词 */
                word: /[A-Za-z0-9_]/,
                /** 数字 */
                number: /[0-9+\-]/,
                /** 空白符 */
                blank: /[\s]/,
            };
            static logData = {
                tokens: [],
                main: [],
                styles: [],
                baseStyle: "border-radius: 2px;padding: 1px 1px;line-height: 20px;",
                init() {
                    this.tokens = [];
                    this.main = [];
                    this.styles = [];
                }
            };
            static log() {
                console.debug(this.logData.main.join(""), ...this.logData.styles);
                // for (let i = 0; i < this.logData.tokens.length; i++) {
                //     const token = this.logData.tokens[i];
                //     console.log(
                //         `%c🏷️%c${token.data}%c   type: ${token.type} index: ${token.index} length: ${token.data.toString().length}`,
                //         this.logData.baseStyle,
                //         `${this.logData.baseStyle}color:${token.#enum.color};font-weight:${token.#enum.fontWeight};background-color:${token.#enum.bgColor};`,
                //         this.logData.baseStyle

                //     );
                // }
                console.table(this.logData.tokens, ["type", "index", "data"]);
            }
            /** @type { String } */
            type = "";
            /** @type { String } */
            data = "";
            /** @type { Array < String >} */
            #tempData = [];
            /** @type { String } */
            index = -1;
            /** @type { Object } */
            #enum;
            finish() {
                this.constructor.logData.tokens.push(this);
                if (this.#tempData.length > 0) {
                    let tempData = this.#tempData.join("");
                    if (this.#enum.type === "number") {
                        this.data = Number(tempData);
                    } else {
                        this.data = tempData;
                    }
                    this.#tempData = [];
                }
                const logData = this.constructor.logData;
                if (this.#enum.needBlank) {
                    logData.main.push("%c ");
                    logData.styles.push("line-height: 20px;");
                }
                logData.main.push(`%c${this.data}`);
                logData.styles.push(
                    `${logData.baseStyle}color:${this.#enum.color};font-weight:${this.#enum.fontWeight};background-color:${this.#enum.bgColor};`
                );

            };
            push(char) {
                this.#tempData.push(char);
            };

            constructor(tokenEnum, index) {
                if (tokenEnum) {
                    this.#enum = tokenEnum;
                    this.type = tokenEnum.id;
                    if (tokenEnum.data) {
                        this.data = tokenEnum.data;
                        this.finish();
                    }
                }
                if (index !== undefined) {
                    this.index = index;
                }
            };
        },
    }
};
/** @borrows utilities.generateCSSStyleSheet as gss */
const gss = utilities.generateCSSStyleSheet;