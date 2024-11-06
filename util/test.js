import $CSS from "./util.css.js";
const result = $CSS.min(`/* 为内部组件使用的组件公共样式表 在仅在内部使用时引入 避免样式污染 */

main:not(.custom) {
    display: grid;
    place-content: center;
}
tr:hover {
    --attr-icon-color: #eda949;
}

th.before {
    /* prettier-ignore */
    background: 
        linear-gradient(#00f, #00f) right 11px center/ 4px 4px no-repeat,
        linear-gradient(#fff8, #fff8) right 10px center/ 6px 6px no-repeat;
}
th.after {
    /* prettier-ignore */
    background: 
        linear-gradient(#ff0, #ff0) right 11px center/ 4px 4px no-repeat,
        linear-gradient(#fff8, #fff8) right 10px center/ 6px 6px no-repeat;
}
/* 属性图标 */
.attr-icon {
    width: 21px;
    height: 21px;
    object-fit: none;
    object-position: -100% -100%;
    background: var(--attr-icon-color, #fff);
}
.attr-icon::selection {
    background-color: #948064;
}
/* 允许被tab聚焦的元素 */
tr[tabindex] > td,
[tabindex]:is(td, h1) {
    background: var(---foucs-bg);
}

[tabindex],
[tabindex] > td {
    transition: all 0.2s linear;
    will-change: contents;
    cursor: pointer;
}

/*########## 图标区 ##########*/
main > :is(canvas, svg, img) {
    grid-area: icon;
    place-self: center;
    zoom: var(--zoom, 5);
}

/*########## 属性区 ##########*/
main > .attrs {
    grid-area: attr;
    place-self: stretch;
}

/* 首个th  */
.attrs th:nth-child(1) {
    max-width: 21px;
    width: 21px;
}

.attrs th:nth-child(2) {
    padding-left: 10px;
    /* max-width: 180px;
    min-width: 180px; */
    width: 180px;
    color: #cfcfcf;
    --font-weight: 300;
}

.attrs td {
    min-width: 80px;
}

.attrs :is(th, td) {
    font-weight: ;
    text-align: left;
    height: 26px;
    line-height: 100%;
    border-radius: 3px;
    white-space: nowrap;
    --font-size: 24px;
    --font-weight: 300;
}

h1,
p {
    grid-area: name;
    color: #cfcfcf;
    line-height: 30px;
    place-self: stretch;
    --font-size: 24px;
    --font-weight: 300;
}

/*########## 标题区 ##########*/
h1 {
    grid-area: name;
    place-self: stretch;
}

/*########## 描述区 ##########*/
p {
    grid-area: desc;
    max-width: 400px;
}

/* 享受施法块加成 */
[entity\.relation="common"],
[entity\.relation="cast"],
[entity\.relation="relate"] {
    --mark-color: var(--attr-color-green);
}

/* 不享受施法块加成 */
[entity\.relation="orbit"],
[entity\.relation="bounce"],
[entity\.relation="low-speed"],
[entity\.relation="death"],
[entity\.relation="hit"],
[entity\.relation="timer"],
[entity\.relation="null"] {
    --mark-color: var(--attr-color-red);
}

section:not([hidden]) {
    display: grid;
    grid-template-columns: 1fr;
    place-items: center stretch;
    place-content: center;
    gap: 14px;
}

.unlimited {
    color: var(--attr-color-green);
}

.never-unlimited {
    color: var(--attr-color-red);
}

.entities-tablist {
    gap: 6px;
}

.entities-tablist > li {
    display: flex;
    place-items: center;
    cursor: pointer;
    transition: all 300ms linear 0ms;
    color: color-mix(in srgb, var(--mark-color), #0000);
    padding: 0 10px 0 0;
}

/* 选中时 */
.entities-tablist > li.selected {
    color: var(--mark-color);
}

.entities-tablist > li:is(:hover, :focus-visible) {
    padding: 0 10px;
    --font-weight: 600;
}

.entities-tablist > li[entity\.relation] {
    /* prettier-ignore */
    background:
        var(---foucs-bg-left),
        linear-gradient(var(--relation-color), var(--relation-color)) center right/4px 4px no-repeat;
}

.entities-tablist > li[entity\.relation="common"] {
    --relation-color: #0000;
}

.entities-tablist > li[entity\.relation="relate"] {
    --relation-color: #f08705;
}

.entities-tablist > li[entity\.relation="cast"] {
    --relation-color: #1cd66c;
}

.entities-tablist > li[entity\.relation="orbit"] {
    --relation-color: #a200a1;
}

.entities-tablist > li[entity\.relation="bounce"] {
    --relation-color: #118811;
}

.entities-tablist > li[entity\.relation="low-speed"] {
    --relation-color: #e21e26;
}

.entities-tablist > li[entity\.relation="death"] {
    --relation-color: #d8deea;
}

.entities-tablist > li[entity\.relation="hit"] {
    --relation-color: #f7c34f;
}

.entities-tablist > li[entity\.relation="timer"] {
    --relation-color: #3b6bcb;
}
`)
console.log(result);
