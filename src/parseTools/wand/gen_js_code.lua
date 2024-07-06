package.path = ";./?.lua;" .. package.path
local util = require "src.parseTools.util"
dofile(dataPath .. "/scripts/gun/procedural/wands.lua")
-- 1000.png 这个魔杖并没有在表中 手动添加一下
table.insert(wands, {
    name = "undefined!",
    file = "data/items_gfx/wands/wand_1000.png",
    grip_x = 0,
    grip_y = 0,
    tip_x = 0,
    tip_y = 0,
    fire_rate_wait = 0,
    actions_per_round = 0,
    shuffle_deck_when_empty = 0,
    deck_capacity = 0,
    spread_degrees = 0,
    reload_time = 0,
})
return "const wandTemplateDatas = " .. util.cretaeJSON5(wands)
--- 数据最好处理的一次
