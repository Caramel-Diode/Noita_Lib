const lua = require("../build/Release/lua");

const result = lua.doString(
  //lua代码字符串
  `
  --print("x的类型: " .. type(x)) -- 检测x类型
  print(123)
  print(123)
  print(123)
  print(123)
  
  
  return {1,2,a=ipair} -- 向js返回结果
`,
  //注入全局变量
  { x: "1", y: 3 },
  //启用标准库
  false
);

console.log(result,lua.version);
