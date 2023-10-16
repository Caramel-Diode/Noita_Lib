/** [材料数据库](material.js) */
DB.material = class {
    /** @type {String} `★主键` 材料标识符 */ id;
    /** @type {String} 名称 */ name;
    /** @type {String} 类型 `固液气` */ type;
    /** @type {String} 密度 */ density;
    /** 
     * @type {String} 可燃性 
     * * `0:不可燃`
     * * `1:无氧燃`
     * * `2:需氧燃`
     */
    burnable;
    /** @type {Number} 血量 */ hp;
    /** @type {Number} 血量 */ fireHp;

    constructor(datas) {
        this.id = datas[0];
        this.name = datas[1];
        this.type = datas[2];

    }
}