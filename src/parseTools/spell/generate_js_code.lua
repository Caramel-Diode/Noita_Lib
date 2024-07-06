package.path  = ";./?.lua;" .. package.path;
local util    = require "src.parseTools.util";
-- local dataPath = "D:/Project/Noita_data_wak/2024.3.27/data"; -- data.wak解包路径由调用方注入
--- 重新实现的`setfenv`
local setfenv = function(fn, env) return load(string.dump(fn, true), "gun_actions.lua", "b", env); end;


local env = {
    ACTION_TYPE_PROJECTILE        = 0,  -- 投射物类型
    ACTION_TYPE_STATIC_PROJECTILE = 1,  -- 静态投射物类型
    ACTION_TYPE_MODIFIER          = 2,  -- 修正类型
    ACTION_TYPE_DRAW_MANY         = 3,  -- 多重类型
    ACTION_TYPE_MATERIAL          = 4,  -- 材料类型
    ACTION_TYPE_OTHER             = 5,  -- 其他类型
    ACTION_TYPE_UTILITY           = 6,  -- 实用类型
    ACTION_TYPE_PASSIVE           = 7,  -- 被动类型
    dofile_once                   = function() end,
    actions                       = {}, --法术表
};
local module, error = loadfile(dataPath .. "/scripts/gun/gun_actions.lua", "t", env);
if not error then
    local success, result = pcall(module)
    if not success then print("加载或执行脚本时出错:", result); end
else
    return "Loadfile Error";
end


--- 返回给调用方的数据
local output = {};
--- 法术行为运行环境
local actionEnv;

actionEnv = {
    --- 数据记录表
    ["#data"]                        = {},
    ["#modifierAction.c"]            = {},
    ["#modifierAction.shot_effects"] = {},
    ["#usedDraw"]                    = false,
    --- 替换原法术表内法术 用于让"随机"法术稳定选择"空白"法术以免影响面板属性读取
    actions                          = { [0] = { action = function() end } },

    mana                             = 0,
    -- current_reload_time              = 0, -- 该属性需要使用元表截获读取与修改操作
    shot_effects                     = {},
    deck                             = {},
    hand                             = {},
    discarded                        = {},
    force_stop_draws                 = false,
    c                                = {},
    draw_actions                     = function(count)
        actionEnv["#usedDraw"] = true;
        actionEnv["#data"].draw = actionEnv["#data"].draw + count;
    end,
    check_recursion                  = function(data, rec_) return rec_ or 0; end,
    move_discarded_to_deck           = function() end,
    order_deck                       = function() end,

    ACTION_DRAW_RELOAD_TIME_INCREASE = 0,    -- 默认充能时间增加量
    NULL_ENTITY                      = 0,    -- 空实体ID
    reflecting                       = true, -- C++ 反射状态机


    ---- C++ 暴露的函数

    Random                                   = function() return 0; end,
    EntityGetInRadiusWithTag                 = function(tag) return {} end,
    EntityGetAllChildren                     = function() end,
    EntityGetTransform                       = function() return 0, 0; end,
    EntityGetWithTag                         = function(tag) return {} end,
    EntityGetFirstComponent                  = function() end,
    EntityGetComponent                       = function() end,
    GetUpdatedEntityID                       = function() return 0; end,
    GameGetFrameNum                          = function() return 0; end,
    SetRandomSeed                            = function() end,
    EntityGetFirstComponentIncludingDisabled = function() end,

    add_projectile                           = function(entity_filename)
        local data = actionEnv["#data"];
        local key = "\"" .. entity_filename .. "\"";
        if data.projectiles[key] then
            data.projectiles[key].min = data.projectiles[key].min + 1;
        else
            data.projectiles[key] = {
                id = entity_filename,
                min = 1,
                max = 1,
                draw_hit = 0,
                draw_time_count = 0,
                draw_time_delay = 0,
                draw_death = 0
            }
        end
    end,
    add_projectile_trigger_timer             = function(entity_filename, delay_frames, action_draw_count)
        local data = actionEnv["#data"];
        local key = "\"" .. entity_filename .. "\"";
        if data.projectiles[key] then
            data.projectiles[key].min = data.projectiles[key].min + 1
        else
            data.projectiles[key] = {
                id = entity_filename,
                min = 1,
                max = 1,
                draw_hit = 0,
                draw_time_count = action_draw_count,
                draw_time_delay = delay_frames,
                draw_death = 0
            }
        end
    end,
    add_projectile_trigger_hit_world         = function(entity_filename, action_draw_count)
        local data = actionEnv["#data"];
        local key = "\"" .. entity_filename .. "\"";
        if data.projectiles[key] then
            data.projectiles[key].min = data.projectiles[key].min + 1
        else
            data.projectiles[key] = {
                id = entity_filename,
                min = 1,
                max = 1,
                draw_hit = action_draw_count,
                draw_time_count = 0,
                draw_time_delay = 0,
                draw_death = 0
            }
        end
    end,
    add_projectile_trigger_death             = function(entity_filename, action_draw_count)
        local data = actionEnv["#data"];
        local key = "\"" .. entity_filename .. "\"";
        if data.projectiles[key] then
            data.projectiles[key].min = data.projectiles[key].min + 1
        else
            data.projectiles[key] = {
                id = entity_filename,
                min = 1,
                max = 1,
                draw_hit = 0,
                draw_time_count = 0,
                draw_time_delay = 0,
                draw_death = action_draw_count
            }
        end
    end,
    find_the_wand_held                       = function() end,
    tostring                                 = function(v)
        if v then
            return tostring(v);
        else
            return "nil";
        end
    end,
    math                                     = math,
    ipairs                                   = ipairs,
    pairs                                    = pairs,
};

local init_current_reload_time = function()
    local modifierAction = {};
    rawset(actionEnv, "#modifierAction.current_reload_time", modifierAction);
    -- 默认修正属性使用覆盖模式
    local type_ = "=";
    local baseProp = {};
    -- 调用以下的运算符时代表修正属性使用累计模式
    setmetatable(baseProp, {
        __add = function(t1, t2)
            type_ = "+";
            return t2;
        end,
        __sub = function(t1, t2)
            type_ = "-";
            return t2;
        end,
        __mul = function(t1, t2)
            type_ = "*";
            return t2;
        end,
        __div = function(t1, t2)
            type_ = "/";
            return t2;
        end,
        __concat = function(t1, t2)
            type_ = "+";
            return t2;
        end,
        __lt = function(t1, t2)
            return false;
        end,
        __le = function(t1, t2)
            return true;
        end
    });
    setmetatable(actionEnv, {
        __index = function(t, k) return baseProp; end,
        __newindex = function(t, k, v)
            local pos;
            if (actionEnv["#usedDraw"]) then
                pos = "after";
            else
                pos = "before";
            end
            if type(v) ~= "table" then
                table.insert(modifierAction, { type = type_, value = v, prop = k, pos = pos });
            end
        end,
    });
end



local init_c = function()
    actionEnv.c = {};
    local modifierAction = {};
    -- 默认修正属性使用覆盖模式
    local type_ = "=";
    local baseProp = {};
    -- 调用以下的运算符时代表修正属性使用累计模式
    setmetatable(baseProp, {
        __add = function(t1, t2)
            type_ = "+";
            return t2;
        end,
        __sub = function(t1, t2)
            type_ = "-";
            return t2;
        end,
        __mul = function(t1, t2)
            type_ = "*";
            return t2;
        end,
        __div = function(t1, t2)
            type_ = "/";
            return t2;
        end,
        __concat = function(t1, t2)
            type_ = "+";
            return t2;
        end,
        __lt = function(t1, t2)
            if type(t1) == "table" then
                return false;
            else
                return false;
            end
        end,
        __le = function(t1, t2)
            if type(t1) == "table" then
                return false;
            else
                return false;
            end
        end
    });

    setmetatable(actionEnv.c, {
        __index = function(t, k) return baseProp; end,
        __newindex = function(t, k, v)
            local pos;
            if (actionEnv["#usedDraw"]) then
                pos = "after";
            else
                pos = "before";
            end
            table.insert(modifierAction, { type = type_, value = v, prop = k, pos = pos });
            -- 初始化记录器
            type_ = "=";
        end

    });
    actionEnv["#modifierAction.c"] = modifierAction;
end;

local init_shot_effects = function()
    actionEnv.shot_effects = {};
    local modifierAction = {};
    -- 默认修正属性使用覆盖模式
    local type = "=";
    local baseProp = {};
    -- 调用以下的运算符时代表修正属性使用累计模式
    setmetatable(baseProp, {
        __add = function(t1, t2)
            type = "+";
            return t2;
        end,
        __sub = function(t1, t2)
            type = "-";
            return t2;
        end,
        __mul = function(t1, t2)
            type = "*";
            return t2;
        end,
        __div = function(t1, t2)
            type = "/";
            return t2;
        end,
        __concat = function(t1, t2)
            type = "+";
            return t2;
        end,
        __lt = function(t1, t2)
            return false;
        end,
        __le = function(t1, t2)
            return true;
        end
    })

    setmetatable(actionEnv.shot_effects, {
        __index = function(t, k) return baseProp; end,
        __newindex = function(t, k, v)
            local pos;
            if (actionEnv["#usedDraw"]) then
                pos = "after";
            else
                pos = "before";
            end
            table.insert(modifierAction, { type = type, value = v, prop = k, pos = pos });
            -- 初始化记录器
            type = "=";
        end

    });
    actionEnv["#modifierAction.shot_effects"] = modifierAction;
end

for i, spell in ipairs(env.actions) do
    --- 重置变量
    actionEnv["#usedDraw"]     = false;
    actionEnv["#data"]         = {
        projectiles = {},
        draw = 0
    };
    actionEnv.force_stop_draws = false;
    init_c();
    init_shot_effects();
    init_current_reload_time();

    local data             = actionEnv["#data"];

    data.id                = spell.id;
    data.name              = spell.name;
    data.desc              = spell.description;
    data.icon              = spell.sprite;
    data.type              = spell.type + 1;
    data.spwanLevel        = spell.spawn_level;
    data.spawnProb         = spell.spawn_probability;
    data.spawnRequiresFlag = util.nonNil(spell.spawn_requires_flag, "");
    data.price             = spell.price;
    data.mana              = util.nonNil(spell.mana, 10);
    data.maxUse            = util.nonNil(spell.max_uses, 0);
    if util.nonNil(spell.never_unlimited, false) then
        data.maxUse = -data.maxUse; -- 使用负数表示不可无限化 0表示没有次数限制
    end
    data.recursive          = util.nonNil(spell.recursive, false);
    data.passive            = util.nonNil(spell.custom_xml_file, "");
    data.relatedProjectiles = util.nonNil(spell.related_projectiles, {});

    local success, result   = pcall(setfenv(spell.action, actionEnv))
    if not success then print("执行[" .. spell.id .. "]法术行为时出错:", result); end

    -- 将键值对形式的表转为数字索引以便于转换为数组
    local projectiles = {};
    for _, value in pairs(data.projectiles) do table.insert(projectiles, value); end
    data.projectiles = projectiles;
    if (not actionEnv["#usedDraw"]) then -- 不提供抽取的情况下修正位置无意义 重置为"none"
        for _, v in ipairs(actionEnv["#modifierAction.c"]) do v.pos = "none"; end
        for _, v in ipairs(actionEnv["#modifierAction.shot_effects"]) do v.pos = "none"; end
        for _, v in ipairs(actionEnv["#modifierAction.current_reload_time"]) do v.pos = "none"; end
    end
    data.modifierAction = {};
    for key, value in ipairs(actionEnv["#modifierAction.c"]) do table.insert(data.modifierAction, value); end
    for key, value in ipairs(actionEnv["#modifierAction.shot_effects"]) do table.insert(data.modifierAction, value); end
    for key, value in ipairs(actionEnv["#modifierAction.current_reload_time"]) do table.insert(data.modifierAction, value); end
    output[i] = data;
end

--- 将表转为JSON5返回给调用方
return "const spellBaseDatas =" .. util.cretaeJSON5(output);
