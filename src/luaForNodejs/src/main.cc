/// node API 头文件
#include <napi.h>
#include <string.h>

#include <iostream>
/// lua库头文件
#include <lua.hpp>
#include <sstream>  // 需要添加头文件

// 注册表唯一键（确保不冲突）
constexpr char LOGGER_REGISTRY_KEY[] = "CPP_LOGGER_INSTANCE";

class LuaLogger {
private:
    std::vector<std::string> logs_;

public:
    // 合并日志并清空（线程安全）
    std::string JoinLogs() {
        std::vector<std::string> logs_to_process;
        {
            logs_.swap(logs_to_process);  // 原子交换并清空原日志
        }

        if (logs_to_process.empty())
            return "";

        std::ostringstream oss;
        for (size_t i = 0; i < logs_to_process.size(); ++i) {
            if (i > 0)
                oss << "\n";
            oss << logs_to_process[i];
        }
        return oss.str();
    }
    // 线程安全的日志记录
    void AddLog(const std::string& msg) { logs_.push_back(msg); }
};

Napi::Value lua_table_to_js_object(Napi::Env env, lua_State* L) {
    Napi::Object jsObject = Napi::Object::New(env);

    int tableIndex = lua_gettop(L);

    // 压入初始 nil 键
    lua_pushnil(L);

    // 遍历表中的所有键值对
    while (lua_next(L, tableIndex) != 0) {
        Napi::Value key, value;  // JS 键值
        key = Napi::Symbol::New(env, Napi::String::New(env, "-"));
        value = Napi::Symbol::New(env, Napi::String::New(env, "-"));

        switch (lua_type(L, -2)) {  // 键位于索引 -2
        case LUA_TNIL:              // 0
            key = Napi::Symbol::New(env, Napi::String::New(env, "Nil"));
            break;
        case LUA_TBOOLEAN:  // 1
            key = Napi::Symbol::New(env, Napi::String::New(env, lua_toboolean(L, -2) ? "Boolean(true)" : "Boolean(false)"));
            break;
        case LUA_TLIGHTUSERDATA:  // 2
            key = Napi::Symbol::New(env, Napi::String::New(env, "Lightuserdata"));
            break;
        case LUA_TNUMBER:  // 3
            key = Napi::Symbol::New(env, Napi::String::New(env, "Number(" + std::to_string(lua_tonumber(L, -2)) + ")"));
            break;
        case LUA_TSTRING:  // 4
            key = Napi::String::New(env, lua_tostring(L, -2));
            break;
        case LUA_TTABLE:  // 5
            key = Napi::Symbol::New(env, Napi::String::New(env, "Table"));
            break;
        case LUA_TFUNCTION:  // 6
            key = Napi::Symbol::New(env, Napi::String::New(env, "Function"));
            break;
        case LUA_TUSERDATA:  // 7
            key = Napi::Symbol::New(env, Napi::String::New(env, "Userdata"));
            break;
        case LUA_TTHREAD:  // 8
            key = Napi::Symbol::New(env, Napi::String::New(env, "Thread"));
            break;
        }

        switch (lua_type(L, -1)) {  // 值位于索引 -1
        case LUA_TNIL:              // 0
            value = env.Null();
            break;
        case LUA_TBOOLEAN:  // 1
            value = Napi::Boolean::New(env, lua_toboolean(L, -1));
            break;
        case LUA_TLIGHTUSERDATA:  // 2
            value = Napi::Symbol::New(env, Napi::String::New(env, "Lightuserdata"));
            break;
        case LUA_TNUMBER:  // 3
            value = Napi::Number::New(env, lua_tonumber(L, -1));
            break;
        case LUA_TSTRING:  // 4
            value = Napi::String::New(env, lua_tostring(L, -1));
            break;
        case LUA_TTABLE:                             // 5
            value = lua_table_to_js_object(env, L);  // 递归处理
            break;
        case LUA_TFUNCTION:  // 6
            value = Napi::Symbol::New(env, Napi::String::New(env, "Function"));
            break;
        case LUA_TUSERDATA:  // 7
            value = Napi::Symbol::New(env, Napi::String::New(env, "Userdata"));
            break;
        case LUA_TTHREAD:  // 8
            value = Napi::Symbol::New(env, Napi::String::New(env, "Thread"));
            break;
        }
        jsObject.Set(key, value);
        // 弹出值，保留键用于下一次迭代
        lua_pop(L, 1);
    }

    return jsObject;
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

Napi::Object lua_do(const Napi::CallbackInfo& info, const int mode) {
    uint32_t argLength = info.Length();
    Napi::Env env = info.Env();
    /** js 返回值 */
    Napi::Object result = Napi::Object::New(env);
    if (argLength == 0)
        return result;
    lua_State* L = luaL_newstate();

    // 创建日志实例并存入注册表
    auto logger = new LuaLogger();
    lua_pushlightuserdata(L, (void*)LOGGER_REGISTRY_KEY);  // 键
    lua_pushlightuserdata(L, logger);                      // 值（指针）
    lua_settable(L, LUA_REGISTRYINDEX);                    // 存入注册表

    lua_pushcfunction(L, [](lua_State* L) -> int {  // Lambda 实现
        // 从注册表获取日志实例
        lua_pushlightuserdata(L, (void*)LOGGER_REGISTRY_KEY);
        lua_gettable(L, LUA_REGISTRYINDEX);
        LuaLogger* logger = static_cast<LuaLogger*>(lua_touserdata(L, -1));
        lua_pop(L, 1);  // 弹出指针

        // 收集所有参数
        std::string buffer;
        int nargs = lua_gettop(L);
        for (int i = 1; i <= nargs; ++i) {
            if (i > 1)
                buffer += "\t";
            size_t len;
            const char* str = luaL_tolstring(L, i, &len);
            buffer.append(str, len);
            lua_pop(L, 1);  // 清除临时字符串
        }

        // 写入日志
        if (logger)
            logger->AddLog(buffer);
        return 0;
    });

    if (argLength > 2 && info[2].IsBoolean()) {
        if (!info[2].ToBoolean().Value()) {
            // 仅加载安全的库（排除os/io等）
            luaL_requiref(L, "_G", luaopen_base, 1);        // 基础库
            luaL_requiref(L, "table", luaopen_table, 1);    // 表操作
            luaL_requiref(L, "math", luaopen_math, 1);      // 数学库
            luaL_requiref(L, "string", luaopen_string, 1);  // 字符串库
            lua_pop(L, 4);                                  // 清理栈
        } else
            luaL_openlibs(L);
    } else
        luaL_openlibs(L);
    lua_setglobal(L, "print");  // 覆盖全局 print
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
            if (lua_isnumber(L, -1)) {
                result.Set(Napi::String::New(env, "return"), Napi::Number::New(env, lua_tonumber(L, -1)));
            } else if (lua_isstring(L, -1)) {
                result.Set(Napi::String::New(env, "return"), Napi::String::New(env, lua_tostring(L, -1)));
            } else if (lua_isboolean(L, -1)) {
                result.Set(Napi::String::New(env, "return"), Napi::Boolean::New(env, lua_toboolean(L, -1)));
            } else if (lua_istable(L, -1)) {
                result.Set(Napi::String::New(env, "return"), lua_table_to_js_object(env, L));
            } else if (lua_isnil(L, -1)) {
                result.Set(Napi::String::New(env, "return"), env.Null());
            } else {
                result.Set(Napi::String::New(env, "return"), Napi::Symbol::New(env, Napi::String::New(env, "Unknow")));
            }

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

    lua_close(L);

    result.Set(Napi::String::New(env, "log"), Napi::String::New(env, logger->JoinLogs()));

    delete logger;
    return result;
}

Napi::Object doString(const Napi::CallbackInfo& info) { return lua_do(info, 1); }

Napi::Object doFile(const Napi::CallbackInfo& info) { return lua_do(info, 2); }

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "doString"), Napi::Function::New(env, doString));
    exports.Set(Napi::String::New(env, "doFile"), Napi::Function::New(env, doFile));
    exports.Set(Napi::String::New(env, "version"), Napi::String::New(env, LUA_VERSION));
    return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init);
