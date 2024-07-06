/// node API 头文件
#include <napi.h>
#include <string.h>
/// lua库头文件
#include <iostream>
#include <lua.hpp>

// 覆盖标准库的print
int lua_print(lua_State *L) {
    // 获取参数数量
    int nargs = lua_gettop(L);
    // 获取调用位置信息
    lua_Debug ar;
    lua_getstack(L, 1, &ar);
    lua_getinfo(L, "Sl", &ar);
    // 格式化输出

    std::cout << "[Lua:" << ar.short_src << ":" << ar.currentline << "]\t";
    // 遍历参数并输出
    for (int i = 1; i <= nargs; ++i) {
        if (i > 1)
            std::cout << "\t";
        std::cout << lua_tostring(L, i);
    }
    std::cout << std::endl;
    return 0;
}

/**
 * ### 调用`lua`代码
 * ----------------
 * #### 输入参数
 * 1. `code` lua 代码字符串
 * 2. `input` 输入参数表
 * ----------------
 * #### 返回值 `{ error: String|null, output: any }`
 *  - `state`: 执行状态
 *  - `return`: 返回数据
 */

Napi::Object lua_do(const Napi::CallbackInfo &info, const int mode) {
    Napi::Env env = info.Env();
    /** js 返回值 */
    Napi::Object result = Napi::Object::New(env);
    lua_State *L = luaL_newstate();

    uint32_t argLength = info.Length();
    if (argLength > 0) {
        if (argLength > 2 && info[2].IsBoolean()) {
            if (info[2].ToBoolean().Value())
                luaL_openlibs(L);
        } else
            luaL_openlibs(L);
        lua_register(L, "print", lua_print);
        if (argLength > 1 && info[1].IsObject()) {
            Napi::Object inputs = info[1].ToObject();
            Napi::Array keys = inputs.GetPropertyNames();
            uint32_t length = keys.Length();
            for (uint32_t i = 0; i < length; i++) {
                Napi::Value key = keys.Get(i);
                // 对于Symbol类型的键忽略处理
                if (key.IsSymbol())
                    continue;
                const std::string keyStr = key.ToString().Utf8Value();
                Napi::Value value = inputs.Get(key);
                if (value.IsString())
                    lua_pushstring(L, value.ToString().Utf8Value().c_str());
                else if (value.IsNumber())
                    lua_pushnumber(L, value.ToNumber().DoubleValue());
                else if (value.IsBoolean())
                    lua_pushboolean(L, value.ToBoolean().Value());
                lua_setglobal(L, keyStr.c_str());
            }
        }
        if (info[0].IsString()) {
            Napi::String state = Napi::String::New(env, "LUA_OK");
            int evalState = -1;
            if (mode == 1) {  // doString
                evalState = luaL_dostring(L, info[0].ToString().Utf8Value().c_str());
            } else {  // dofile
                evalState = luaL_dofile(L, info[0].ToString().Utf8Value().c_str());
                result.Set(Napi::String::New(env, "filepath"), info[0]);
            }
            if (evalState == 0) {
                lua_gettop(L);
                if (lua_isnumber(L, -1))
                    result.Set(Napi::String::New(env, "return"), Napi::Number::New(env, lua_tonumber(L, -1)));
                else if (lua_isstring(L, -1))
                    result.Set(Napi::String::New(env, "return"), Napi::String::New(env, lua_tostring(L, -1)));
                else if (lua_isboolean(L, -1))
                    result.Set(Napi::String::New(env, "return"), Napi::Boolean::New(env, lua_toboolean(L, -1)));
                else
                    result.Set(Napi::String::New(env, "return"), Napi::Symbol::New(env, Napi::String::New(env, "Unsupported types")));
            } else {
                switch (evalState) {
                case 1:
                    state = Napi::String::New(env, "LUA_YIELD");
                    break;
                case 2:
                    state = Napi::String::New(env, "LUA_ERRRUN");
                    break;
                case 3:
                    state = Napi::String::New(env, "LUA_ERRSYNTAX");
                    break;
                case 4:
                    state = Napi::String::New(env, "LUA_ERRMEM");
                    break;
                case 5:
                    state = Napi::String::New(env, "LUA_ERRERR");
                    break;
                }
                result.Set(Napi::String::New(env, "error"), Napi::String::New(env, lua_tostring(L, -1)));
            }

            result.Set(Napi::String::New(env, "state"), state);

        } else {
            // 首个参数`code` 为lua代码字符串 必须为字符串类型 否则会抛出类型异常
            Napi::TypeError::New(env, "Wrong parameter type").ThrowAsJavaScriptException();
            result.Set(Napi::String::New(env, "error"), Napi::String::New(env, "Wrong parameter type"));
        }
    }
    lua_close(L);
    return result;
}

Napi::Object doString(const Napi::CallbackInfo &info) { return lua_do(info, 1); }

Napi::Object doFile(const Napi::CallbackInfo &info) { return lua_do(info, 2); }

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "doString"), Napi::Function::New(env, doString));
    exports.Set(Napi::String::New(env, "doFile"), Napi::Function::New(env, doFile));
    return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init);
