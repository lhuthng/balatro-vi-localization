local source = dofile("../Balatro/localization/vi.lua")
local output = io.open("output.json", "w")
local function to_json(obj)
    local function serialize(val)
        local data_type = type(val)
        if data_type == "table" then
            return to_json(val)
        elseif data_type == "string" then
            return '"' .. val .. '"'
        else
            error("Invalid data type")
        end
    end
    local res
    if #obj > 0 or next(obj) == nil then
        res = "["
        for _, val in pairs(obj) do
            res = res .. serialize(val) .. ","
        end
        if #obj > 0 then
            res = res:sub(1, -2)
        end
        res = res .. "]"
    else
        res = "{"
        for key, val in pairs(obj) do
            res = res .. '"' .. key .. '"' .. ":" .. serialize(val) .. ","
        end
        res = res:sub(1, -2) .. "}"
    end
    return res
end
if output then
    output:write(to_json(source))
    output:close()
end