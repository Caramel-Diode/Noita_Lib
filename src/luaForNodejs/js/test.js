const lua = require("../build/Release/lua");
// console.log(lua.doString(`
//     dofile("D:/Project/Web/nodejsLua/js/lua2.lua")
//     return x + y + z
//     `, { x: 1, y: 3 }));
console.log(lua.doFile(`./lua/test.lua`, { x: 1, y: 3 }));
