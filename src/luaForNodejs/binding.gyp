{
    "targets": [
      {
        "target_name": "lua",
        "sources": [ "src/main.cc" ],
        # cpp 文件调用 n-api 的头文件的时候能找到对应的目录
        # 增加一个头文件搜索路径
        "include_dirs": [
          "<!@(node -p \"require('node-addon-api').include\")",
          "lua_lib/include"
        ],
        "libraries": [
          # 记得改路径
          "D:/Project/Web/NoitaLib/src/luaForNodejs/lua_lib\lua54.lib"
        ],
        # 添加一个预编译宏，避免编译的时候并行抛错
        'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ],
      }
    ]
  }