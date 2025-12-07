// 为index 提供全部的嵌入依赖

// 工具集
embed(`#public/htmlTools.js`);
embed(`#public/cssTools.js`);
embed(`#public/util.js`);
embed(`#public/XML.js`);
embed(`#public/CSV.js`);
embed(`#public/damageData.js`);
embed(`#public/translation.js`);

// 组件库
embed(`#component/Base/index.js`); // 基础
embed(`#component/Inventory/index.js`); // 基础
embed(`#component/InputRange/index.js`); // 基础
embed(`#component/Material/index.js`); // 材料
embed(`#component/Entity/index.js`); // 实体
embed(`#component/Spell/index.js`); // 法术
embed(`#component/Wand/index.js`); // 魔杖
embed(`#component/Perk/index.js`); // 天赋
embed(`#component/Cursor/index.js`); // 光标
embed(`#component/Message/index.js`); // 通知
embed(`#component/Container/index.js`); // 容器
embed(`#component/Orb/index.js`); // 魔球
embed(`#component/Status/index.js`); // 状态
