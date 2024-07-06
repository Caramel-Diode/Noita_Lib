package.path = ";./?.lua;" .. package.path
local util = require "src.parseTools.util"
dofile(dataPath .. "/scripts/perks/perk_list.lua")

local perkData = {}

for i, v in ipairs(perk_list) do
    local stackable_maximum = 0
    local max_in_perk_pool = 1

    if v.stackable_is_rare then
        stackable_is_rare = 1
        max_in_perk_pool = 1
    end
    if v.max_in_perk_pool then
        max_in_perk_pool = v.max_in_perk_pool
    end
    if v.stackable == true then
        stackable_maximum = 128
        max_in_perk_pool = 2
    end
    if v.stackable_maximum then
        stackable_maximum = v.stackable_maximum
    end

    table.insert(perkData, {
        id                = v.id,
        name              = v.ui_name,
        desc              = v.ui_description,
        type              = 1,
        stackable_maximum = stackable_maximum,
        max_in_perk_pool  = max_in_perk_pool,
        game_effect       = util.nonNil(v.game_effect, ""),
        usable_by_enemies = util.boolToNum(util.nonNil(v.usable_by_enemies, true)),
        -- icon              = string.match(string.match(v.perk_icon, "[%w_]+%.png"), "[%w_]+") -- 取完整路径 精粹与普通天赋不在一起
        icon              = v.perk_icon
    })
end

return "const perkDatas =" .. util.cretaeJSON5(perkData)
