/**
 * `lua` 生成的状态数据
 * [lua file](generate_js_code.lua)
 */
type StatusData = {
    id: String;
    name: String;
    desc: String;
    icon: String;
    fireProtection: Boolean;
    removeCells: Boolean;
    harmful: Boolean;
    entity: String;
    threshold: Number;
};

declare const statusDatas: Array<StatusData>;
