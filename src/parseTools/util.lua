--- 通用env 函数


function dofile_once() end

local function isArray(t)
    for index, value in pairs(t) do
        if type(index) == "string" then
            return false
        end
    end
    return true
end

---- 将表转为JSON5格式
--- @param table_ table
--- @return string
local function cretaeJSON5(table_)
    local result = {}
    if isArray(table_) then
        for index, value in ipairs(table_) do
            local _type = type(value)
            if _type == "number" then
                table.insert(result, value)
            elseif _type == "string" then
                table.insert(result, "'")
                table.insert(result, value)
                table.insert(result, "'")
            elseif _type == "boolean" then
                if value then
                    table.insert(result, "true")
                else
                    table.insert(result, "false")
                end
            elseif _type == "table" then
                table.insert(result, cretaeJSON5(value))
            end
            table.insert(result, ",")
        end
        table.remove(result)
        return "[" .. table.concat(result) .. "]"
    else
        for index, value in pairs(table_) do
            table.insert(result, index)
            table.insert(result, ":")
            local _type = type(value)
            if _type == "number" then
                table.insert(result, value)
            elseif _type == "string" then
                table.insert(result, "'")
                table.insert(result, value)
                table.insert(result, "'")
            elseif _type == "boolean" then
                if value then
                    table.insert(result, "true")
                else
                    table.insert(result, "false")
                end
            elseif _type == "table" then
                table.insert(result, cretaeJSON5(value))
            end
            table.insert(result, ",")
        end
        table.remove(result)
        return "{" .. table.concat(result) .. "}"
    end
end

return {
    cretaeJSON5 = cretaeJSON5,
    --- 布尔值转为数字
    --- @param boolValue boolean
    --- @return integer
    boolToNum = function(boolValue)
        if boolValue then
            return 1
        else
            return 0
        end
    end,
    --- 空值替补
    --- @generic V:any
    --- @param ... V
    --- @return V
    nonNil = function(...)
        for _, value in pairs { ... } do
            if value ~= nil then
                return value
            end
        end
    end
}
