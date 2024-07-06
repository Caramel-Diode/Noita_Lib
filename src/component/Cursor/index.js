const cursor = (() => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" height="39" width="39"><path d="M17.5 2.5h4v13h-4zm0 21h4v13h-4zm-15-6h13v4h-13zm21 0h13v4h-13z" fill="#fff" stroke="#000"/></svg>`;
    const svgUrl = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(`*{cursor:url("${svgUrl}") 19 19,default !important}`);
    document.addEventListener("DOMContentLoaded", () => (document.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet]));
    return Object.freeze({
        get disable() {
            return styleSheet.disabled;
        },
        set disable(value) {
            styleSheet.disabled = value;
        }
    });
})();
