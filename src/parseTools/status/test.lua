-- function nonNil(...)
--     local args = { ... }
--     for index, value in ipairs(args) do
--         print("???")
--         print(value)
--         if value ~= nil then
--             return value
--         end
--     end
--     return "!"
-- end

-- print(nonNil(nil, 1, 1, 1))

function find_first_not_nil(...)
    for _, arg in pairs{...} do
        if arg ~= nil then
            return arg
        end
    end
end

-- 测试用例
print(find_first_not_nil(nil, nil, 1, 2, 3))       -- 输出：1
print(find_first_not_nil(nil, "hello", nil, 2, 3)) -- 输出："hello"
print(find_first_not_nil(nil, nil, nil,"?"))           -- 输出：nil
