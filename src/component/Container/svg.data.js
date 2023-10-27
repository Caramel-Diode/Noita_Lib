const svgGenerators = (() => {
    const createSvg = (innerHTML, clipPath = "", color = "") => {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.innerHTML = innerHTML;
        svg.setAttribute("height", "16");
        svg.setAttribute("width", "16");
        let style = ``;
        if (clipPath) style = `clip-path:path("${clipPath}");`;
        if (color) style += `--mix-color:${color}`;
        svg.style = style;
        return svg;
    };
    return new Map([
        [
            "common",
            (clipValue = -1, color = "") => {
                let clipPath = ``;
                // x / 100 * 11
                if (clipValue !== -1) clipPath = `M0 14h16v-${(11 * clipValue) / 100}h-16z`;
                return createSvg(`<path d="M5 2v1h2V2" fill="#777777"/><path d="M7 2h1v1H7" fill="#959595"/><path d="M8 2h3v1H8" fill="#c3c3c3"/><path class="fill-5a5a5a" d="M6 3v4H5v1H4v1H3v3h1v1h1v1h6v-1h-1V3"/><path class="fill-777777" d="M10 3H7v1H6v4H5v3h1v1h1v1h5v-1h1v-1h-3z"/><path class="fill-959595" d="M10 4H7v3H6v4h1v1h5v-1h1V9h-1V8h-1V7h-1"/><path class="fill-c3c3c3" d="M9 4H8v2H7v4h1v1h3v-1h1V9h-1V8h-1V5H9"/>`, clipPath, color);
            }
        ],
        [
            "conical",
            (clipValue = -1, color = "") => {
                let clipPath = ``;
                if (clipValue !== -1) clipPath = `M0 14h16v-${(11 * clipValue) / 100}h-16z`;
                return createSvg(`<path d="M9 2h1v1H9" fill="#c3c3c3"/><path d="M7 2h2v1H7" fill="#959595"/><path d="M6 2v1h1V2z" fill="#777777"/><path class="fill-5a5a5a" d="M8 3H7v2H6v2H5v2H4v2H3v2h1v1h4"/><path class="fill-777777" d="M8 3v1H7v1H6v3H5v3H4v2h4v1h4v-1H9V3"/><path class="fill-959595" d="M8 4h1v3h1v2h1v2h1v2H8"/><path class="fill-c3c3c3" d="M9 5h1v2h1v2h1v2h1v2h-1v-2h-1V9h-1V7H9z"/>`, clipPath, color);
            }
        ],
        [
            "jar",
            (clipValue = -1, color = "") => {
                let clipPath = ``;
                if (clipValue !== -1) clipPath = `M0 14h16v-${(11 * clipValue) / 100}h-16z`;
                return createSvg(`<path d="M4 2H5V3H4" fill="#5a5a5a"/><path d="M5 2h2v1H5" fill="#777777"/><path d="M7 2h1v1H7" fill="#959595"/><path d="M8 2h4v1H8" fill="#c3c3c3"/><path class="fill-5a5a5a" d="M5 3h6V4H5"/><path class="fill-c3c3c3" d="M4 4h8v7H4"/><path class="fill-5a5a5a" d="M4 4v1h1V4zm0 2v3h1V6zm0 4v3h1v-3zm1 3v1h6v-1h1v-1h-2v1H9v-1H8v1H7v-1H6v1z"/><path class="fill-959595" d="M5 4v8h7V9h-1v1h-1v1H9v-1H8V9H7V7H6V6h1V5H6V4zm4 6h1V9H9z"/><path class="fill-777777" d="M4 5v1h2V5zm1 2v1h1V7zM4 9v1h1v3h1v-2h1v-1H6V9zm3 2v2h1v-2zm4 0v1h1v-1zm-2 1v1h1v-1z"/>`, clipPath, color);
            }
        ],
        [
            "bag",
            (clipValue = -1, color = "") => {
                let clipPath = ``;
                if (clipValue !== -1) clipPath = `M0 15h16v-${clipValue / 10}h-16z`;
                return createSvg(`<path class="fill-7a6a44" d="M6 5h7v3h1v2h1v3h-1v1h-1v1H2v-1H1v-3h1V9h4z"/><path class="fill-937f52" d="M7 5v1H5v1H4v1H3v3h1v1H3v1h1v1h1v-1h1v1h1v-1h2v-1h1v1h1v-2h1v-1h1V9h-1V7h-1V6H8V5zm5 6v1h1v-1zm-9 1v-1H2v1z"/><path d="M6 9h3v1h1v1h1v1H4v-1h1v-1h1" fill="#494664"/><path d="M7 8h1v1h1v2H8v1H7v-1H6v-1h1v1h1V9H7" fill="#585670"/><path d="M13 1h1v2h-1v1H9V3H8V1h2v1h3" fill="#937f52"/><path d="M8 2h2v1h1v1h1V2h2v1h-1v1h-1v1h-2V4H9V3H8" fill="#7a6a44"/><path d="M7 4h3v1h3v1h-3V5H7" fill="#434157"/>`, clipPath, color);
            }
        ]
    ]);
})();
