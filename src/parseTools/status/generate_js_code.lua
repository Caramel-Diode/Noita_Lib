package.path        = ";./?.lua;" .. package.path;
local util          = require "src.parseTools.util";

--- 重新实现的`setfenv`
local setfenv       = function(fn, env) return load(string.dump(fn, true), "status_list.lua", "b", env); end;
--- @alias StatusItem {id:string,ui_name:string,ui_description:string,ui_icon:string,protects_from_fire:boolean?,remove_cells_that_cause_when_activated:boolean?,effect_entity:string,is_harmful:boolean?,min_threshold_normalized:number?}
local env           = {
    dofile_once    = function() end,
    --- @type StatusItem[]
    status_effects = {}, --状态表
};

local module, error = loadfile(dataPath .. "/scripts/status_effects/status_list.lua", "t", env);

if not error then
    local success, result = pcall(module)
    if not success then print("加载或执行脚本时出错:", result); end
else
    return "Loadfile Error";
end
--- 返回给调用方的数据
local output = {};

for index, status in ipairs(env.status_effects) do
    output[index] = {
        id = status.id,
        name = status.ui_name,
        desc = status.ui_description,
        icon = status.ui_icon,
        fireProtection = util.nonNil(status.protects_from_fire, false),
        removeCells = util.nonNil(status.remove_cells_that_cause_when_activated, false),
        harmful = util.nonNil(status.is_harmful, false),
        entity = util.nonNil(status.effect_entity, ""),
        threshold = util.nonNil(status.min_threshold_normalized, 0)
    }
end

--- 将表转为JSON5返回给调用方
return "const statusDatas =" .. util.cretaeJSON5(output);
