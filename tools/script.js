const fileInput = document.getElementById("fileInput");
const updateAllButton = document.getElementById("updateAllButton");
const quickNavigator = document.getElementById("quickNavigator");
const mainContainer = document.getElementById("mainContainer");
const statusText = document.getElementById("statusText");

const navLocation = {
    ".descriptions.Joker": "Joker",
    ".descriptions.Tarot": "Tarot",
    ".descriptions.Planet": "Planet",
    ".descriptions.Spectral": "Spectral",
    ".descriptions.Enhanced": "Enhanced",
    ".descriptions.Edition": "Edition",
    ".descriptions.Blind": "Blind",
    ".descriptions.Tag": "Tag",
    ".descriptions.Stake": "Stake",
    ".descriptions.Voucher": "Voucher",
    ".descriptions.Back": "Deck",
    ".descriptions.Other": "Other",
    ".misc": "Misc"
};

const state = {
    data: null,
    buttons: [],
    textInputs: [],
    currentTarget: null,
    changedCount: 0,
    wordCount: 0
};

function init() {
    state.buttons = [];
    state.textInputs = [];
    state.currentTarget = null;
    state.changedCount = 0;
    state.wordCount = 0;

    mainContainer.innerHTML = "";
    quickNavigator.innerHTML = "";

    document.getElementById("saveButton1").disabled = false;
    document.getElementById("saveButton2").disabled = false;
    updateAllButton.disabled = false;
    updateAllButton.classList.remove("wait");
}

function updateStatus(extraMessage) {
    const words = `Words: ${state.wordCount.toLocaleString()}`;
    const changed = `Pending updates: ${state.changedCount}`;
    const tail = extraMessage ? ` | ${extraMessage}` : "";
    statusText.textContent = `${words} | ${changed}${tail}`;
}

fileInput.addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) {
        alert("No file selected.");
        return;
    }

    if (!file.name.toLowerCase().endsWith(".json")) {
        alert("Please select a valid JSON file.");
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            state.data = JSON.parse(e.target.result);
            init();
            renderNode(state.data, mainContainer, []);
            bindNavigatorLinks();
            updateStatus(`Loaded: ${file.name}`);
        } catch (error) {
            alert(`Invalid JSON: ${error.message}`);
        }
    };
    reader.readAsText(file);
});

function pathToString(pathArray) {
    return `.${pathArray.join(".")}`;
}

function registerSection(pathArray, container) {
    const sectionKey = pathToString(pathArray);
    const sectionTitle = navLocation[sectionKey];
    if (!sectionTitle) {
        return;
    }

    const sectionId = `section-${sectionTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    container.id = sectionId;

    const link = document.createElement("a");
    link.href = `#${sectionId}`;
    link.textContent = sectionTitle;
    link.dataset.targetId = sectionId;
    quickNavigator.appendChild(link);
}

function markPending(button) {
    if (!button.classList.contains("wait")) {
        state.changedCount += 1;
    }
    button.classList.add("wait");
    updateAllButton.classList.add("wait");
    updateStatus();
}

function createValueEditor(value, pathArray, container) {
    if (typeof value === "string") {
        const input = document.createElement("input");
        input.type = "text";
        input.value = value;

        const button = document.createElement("button");
        button.textContent = "Update";
        button.className = "styledButton";

        input.addEventListener("input", () => markPending(button));
        button.addEventListener("click", applySingleUpdate(pathArray, input, button));

        state.textInputs.push(input);
        state.buttons.push(button);

        container.classList.add("v-box", "textContainer");
        container.appendChild(input);
        container.appendChild(button);

        const words = value.match(/[\p{L}\p{N}_]+/gu);
        state.wordCount += words ? words.length : 0;
        return 1;
    }

    if (value && typeof value === "object") {
        const subContainer = document.createElement("div");
        container.appendChild(subContainer);
        registerSection(pathArray, subContainer);
        return renderObject(value, subContainer, pathArray);
    }

    return 0;
}

function renderObject(object, container, pathArray) {
    let total = 0;

    if (Array.isArray(object)) {
        container.classList.add("objectContainer");
        const subContainer = document.createElement("div");
        container.appendChild(subContainer);

        if (object.every((child) => typeof child === "string")) {
            const textarea = document.createElement("textarea");
            textarea.value = object.join("\n");
            textarea.rows = Math.max(2, object.length);

            const button = document.createElement("button");
            button.textContent = "Update";
            button.className = "styledButton";

            textarea.addEventListener("input", () => {
                const lines = textarea.value.split("\n");
                if (lines.length > object.length) {
                    textarea.value = lines.slice(0, object.length).join("\n");
                }
                markPending(button);
            });
            button.addEventListener("click", applySingleUpdate(pathArray, textarea, button, object.length));

            state.textInputs.push(textarea);
            state.buttons.push(button);

            subContainer.classList.add("v-box-2");
            subContainer.appendChild(textarea);
            subContainer.appendChild(button);

            return object.length;
        }

        object.forEach((item, index) => {
            total += createValueEditor(item, [...pathArray, String(index)], subContainer);
        });
        return total;
    }

    Object.keys(object)
        .sort()
        .forEach((key) => {
            if (!Object.prototype.hasOwnProperty.call(object, key)) {
                return;
            }

            const subContainer = document.createElement("div");
            subContainer.classList.add("objectContainer");
            container.appendChild(subContainer);

            const label = document.createElement("span");
            label.className = "sectionLabel";

            const value = object[key];
            if (value && typeof value === "object") {
                label.textContent = `${key} (${Object.keys(value).length}): `;
            } else {
                label.textContent = `${key}: `;
            }
            subContainer.appendChild(label);

            total += createValueEditor(value, [...pathArray, key], subContainer);
        });

    return total;
}

function renderNode(rootObject, container, pathArray) {
    return createValueEditor(rootObject, pathArray, container);
}

function getRefByPath(pathArray) {
    let current = state.data;
    for (let i = 0; i < pathArray.length - 1; i++) {
        current = current[pathArray[i]];
    }
    return {
        parent: current,
        key: pathArray[pathArray.length - 1]
    };
}

function applySingleUpdate(pathArray, input, button, lineLimit) {
    return () => {
        if (!state.data) {
            return;
        }

        const { parent, key } = getRefByPath(pathArray);
        if (lineLimit === undefined) {
            parent[key] = input.value;
        } else {
            const lines = input.value.split("\n").slice(0, lineLimit);
            for (let i = 0; i < lineLimit; i++) {
                parent[key][i] = lines[i] ?? "";
            }
            input.value = parent[key].join("\n");
        }

        if (button.classList.contains("wait")) {
            state.changedCount = Math.max(0, state.changedCount - 1);
        }
        button.classList.remove("wait");
        if (state.changedCount === 0) {
            updateAllButton.classList.remove("wait");
        }
        updateStatus();
    };
}

function bindNavigatorLinks() {
    quickNavigator.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            const target = document.getElementById(link.dataset.targetId);
            if (!target) {
                return;
            }
            target.scrollIntoView({ behavior: "smooth", block: "start" });
            if (state.currentTarget) {
                state.currentTarget.classList.remove("focus");
            }
            state.currentTarget = target;
            target.classList.add("focus");
        });
    });
}

function downloadText(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(href);
}

function save() {
    if (!state.data) {
        return;
    }
    downloadText(`${JSON.stringify(state.data, null, 2)}\n`, "lang.json", "application/json");
}

function escapeLuaString(value) {
    return value
        .replace(/\\/g, "\\\\")
        .replace(/"/g, "\\\"")
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/\t/g, "\\t");
}

function isLuaIdentifier(key) {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key);
}

function convertToLua(object, depth = 0) {
    const tab = "\t";

    if (typeof object === "string") {
        return `"${escapeLuaString(object)}"`;
    }
    if (typeof object === "number" || typeof object === "boolean") {
        return String(object);
    }
    if (object === null) {
        return "nil";
    }
    if (!object || typeof object !== "object") {
        return "nil";
    }

    const indent = tab.repeat(depth + 1);
    const closeIndent = tab.repeat(depth);
    const lines = [];

    if (Array.isArray(object)) {
        object.forEach((item) => {
            lines.push(`${indent}${convertToLua(item, depth + 1)},`);
        });
    } else {
        Object.keys(object)
            .sort()
            .forEach((key) => {
                const luaKey = isLuaIdentifier(key) ? key : `["${escapeLuaString(key)}"]`;
                lines.push(`${indent}${luaKey} = ${convertToLua(object[key], depth + 1)},`);
            });
    }

    return `{\n${lines.join("\n")}\n${closeIndent}}`;
}

function saveAsLua() {
    if (!state.data) {
        return;
    }
    downloadText(`return ${convertToLua(state.data)}\n`, "lang.lua", "text/plain");
}

function updateAll() {
    state.buttons.forEach((button) => button.click());
    updateAllButton.classList.remove("wait");
    updateStatus("All visible fields synchronized.");
}

function replace() {
    if (!state.data) {
        return;
    }

    const findText = document.getElementById("findText").value;
    const replaceText = document.getElementById("replaceText").value;
    const useRegExp = document.getElementById("useRegExp").checked;

    if (!findText) {
        alert("Find field is empty.");
        return;
    }

    let replacements = 0;
    for (const input of state.textInputs) {
        const before = input.value;
        let after = before;

        if (!useRegExp) {
            after = before.split(findText).join(replaceText);
        } else {
            try {
                const regex = new RegExp(findText, "g");
                after = before.replace(regex, replaceText);
            } catch (error) {
                alert(`Invalid RegExp: ${error.message}`);
                return;
            }
        }

        if (after !== before) {
            input.value = after;
            input.dispatchEvent(new Event("input"));
            replacements += 1;
        }
    }

    if (replacements === 0) {
        updateStatus("No matches.");
        return;
    }

    updateAll();
    updateStatus(`Replaced ${replacements} field(s).`);
}