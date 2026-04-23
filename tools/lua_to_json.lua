local input_path = arg[1] or "../lang.lua"
local output_path = arg[2] or "output.json"

local ok, source = pcall(dofile, input_path)
if not ok then
    io.stderr:write("Failed to load input Lua: " .. tostring(source) .. "\n")
    os.exit(1)
end

local function is_array(tbl)
    local max_index = 0
    local count = 0
    for key, _ in pairs(tbl) do
        if type(key) ~= "number" or key < 1 or key % 1 ~= 0 then
            return false
        end
        if key > max_index then
            max_index = key
        end
        count = count + 1
    end
    return max_index == count
end

local function escape_json_string(str)
    local escaped = str
    escaped = escaped:gsub("\\", "\\\\")
    escaped = escaped:gsub('"', '\\"')
    escaped = escaped:gsub("\b", "\\b")
    escaped = escaped:gsub("\f", "\\f")
    escaped = escaped:gsub("\n", "\\n")
    escaped = escaped:gsub("\r", "\\r")
    escaped = escaped:gsub("\t", "\\t")
    escaped = escaped:gsub("[%z\1-\31]", function(ch)
        return string.format("\\u%04x", string.byte(ch))
    end)
    return escaped
end

local function serialize_json(value)
    local value_type = type(value)

    if value_type == "string" then
        return '"' .. escape_json_string(value) .. '"'
    end
    if value_type == "number" or value_type == "boolean" then
        return tostring(value)
    end
    if value == nil then
        return "null"
    end
    if value_type ~= "table" then
        error("Unsupported type: " .. value_type)
    end

    if is_array(value) then
        local parts = {}
        for i = 1, #value do
            parts[#parts + 1] = serialize_json(value[i])
        end
        return "[" .. table.concat(parts, ",") .. "]"
    end

    local keys = {}
    for key, _ in pairs(value) do
        keys[#keys + 1] = key
    end
    table.sort(keys, function(a, b)
        return tostring(a) < tostring(b)
    end)

    local parts = {}
    for _, key in ipairs(keys) do
        local key_str = '"' .. escape_json_string(tostring(key)) .. '"'
        parts[#parts + 1] = key_str .. ":" .. serialize_json(value[key])
    end
    return "{" .. table.concat(parts, ",") .. "}"
end

local output, open_err = io.open(output_path, "w")
if not output then
    io.stderr:write("Failed to open output file: " .. tostring(open_err) .. "\n")
    os.exit(1)
end

output:write(serialize_json(source))
output:write("\n")
output:close()

print("JSON exported to " .. output_path)