module = {}
local isLineEnd = function(char)
    return char == "\r" or char == "\n"
end
---@param str string
module.parseCSV = function(str)
    local cellDatas = {}
    local rowHeads = {}
    local columnHeads = {}
    local headToIndex = function(table, name)
        for index, value in ipairs(table) do
            if name == value then return index end
        end
        return name
    end
    local result;
    result = {
        rowHeads = rowHeads,
        columnHeads = columnHeads,
        ---获取指定行列单元格的值
        ---* 允许使用表头值(字符串)或者行列号(从1开始的数字)
        ---@param row string|number
        ---@param column string|number
        ---@return string|nil
        get = function(row, column)
            if type(row) == "string" and row ~= "" then
                row = headToIndex(columnHeads, row) -- 尝试转为数字索引
                if type(row) == "string" then return nil end
            end
            if type(column) == "string" and column ~= "" then
                column = headToIndex(rowHeads, column) -- 尝试转为数字索引
                if type(column) == "string" then return nil end
            end
            return cellDatas[row .. "," .. column]
        end,
        ---设置指定行列单元格的值
        ---* 允许使用表头值(字符串)或者行列号(从1开始的数字)
        ---* 不存在的单元格会自动新建
        ---@param row string|number
        ---@param column string|number
        set = function(row, column, value)
            local info = { newRow = false, newColumn = false, newCell = false }
            if type(row) == "string" and row ~= "" then
                row = headToIndex(columnHeads, row) -- 尝试转为数字索引
                if type(row) == "string" then       -- 新增行
                    result.set(#columnHeads + 1, 1, row);
                    row = #rowHeads;
                    info.newRow = true
                    info.newCell = true
                end
            end
            if type(column) == "string" and column ~= "" then
                column = headToIndex(rowHeads, column) -- 尝试转为数字索引
                if type(column) == "string" then       -- 新增列
                    result.set(1, #rowHeads + 1, column);
                    column = #columnHeads;
                    info.newRow = true
                    info.newCell = true
                end
            end
            info.newCell = info.newCell or result.get(row, column) ~= nil
            cellDatas[row .. "," .. column] = value
            if row == 1 then rowHeads[column] = value end
            if column == 1 then columnHeads[row] = value end
            return info
        end,
        --- 转为csv字符串
        tostring = function()
            local cache = {}
            for row = 1, #columnHeads do
                for column = 1, #rowHeads do
                    local value = result.get(row, column)
                    if (value == nil) then value = "" end
                    table.insert(cache, value)
                    if column == #rowHeads then
                        table.insert(cache, "\n")
                    else
                        table.insert(cache, ",")
                    end
                end
            end
            return table.concat(cache)
        end
    }
    local len = #str - 1
    local state_quotationMark = 0   -- 双引号状态机
    local state_escapeCharacter = 0 -- 转义符状态机
    local cellValueCache = {}
    local pos = { row = 1, column = 1 }
    for i = 1, len do
        local char = string.sub(str, i, i)
        if state_quotationMark == 1 then -- 处于双引号包裹中
            table.insert(cellValueCache, char)
            if char == '"' then
                if state_escapeCharacter == 0 then
                    state_quotationMark = 0   -- 双引号包裹结束
                else
                    state_escapeCharacter = 0 -- 消费转义符
                end
            elseif char == '\\' then
                if state_escapeCharacter == 0 then
                    state_escapeCharacter = 1 -- 为下个字符开启转义
                else
                    state_escapeCharacter = 0
                end
            else
                assert(isLineEnd(char) == false, "存在未闭合的引号 不应当在此处换行\n:" .. "(" .. pos.column .. "," .. pos.row .. ")")
                state_escapeCharacter = 0 -- 消费转义符
            end
        else
            if char == '"' then
                table.insert(cellValueCache, char)
                state_quotationMark = 1 -- 进入双引号包裹
            elseif char == ',' then     -- 分隔符为en逗号
                result.set(pos.row, pos.column, table.concat(cellValueCache))
                cellValueCache = {}
                pos.column = pos.column + 1
            elseif isLineEnd(char) then
                -- 对连续换行(空行)和"\r\n"(Windows换行符)特殊处理
                if (isLineEnd(string.sub(str, i - 1, i - 1)) == false) then
                    result.set(pos.row, pos.column, table.concat(cellValueCache))
                    cellValueCache = {}
                    pos.row = pos.row + 1
                    pos.column = 1
                end
            else
                table.insert(cellValueCache, char)
            end
        end
    end
    result.set(pos.row, pos.column, table.concat(cellValueCache))
    return result
end

return module
