/**
 * `lua` 生成的状态数据
 * [lua file](generate_js_code.lua)
 */
type StatusData = {
    id: string;
    name: string;
    desc: string;
    icon: string;
    fireProtection: boolean;
    removeCells: boolean;
    harmful: boolean;
    entity: string;
    threshold: number;
};

declare const statusDatas: Array<StatusData>;
