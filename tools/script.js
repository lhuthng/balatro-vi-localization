const file_input = document.getElementById('fileInput');
const update_all_button = document.getElementById('updateAllButton');
let buttons = [];

function show(object, container, path) {
    if (typeof object === "string") {
        const textinput = document.createElement('input');
        const update_button = document.createElement('button');
        textinput.type = "text";
        textinput.value = object;
        textinput.addEventListener("input", e => {
            update_all_button.classList.add("wait");
            update_button.classList.add("wait");
        });
        update_button.innerHTML = "update";
        update_button.classList.add("styledButton");
        update_button.addEventListener('click', update_data(update_button, path, textinput));
        buttons.push(update_button);
        container.classList.add("v-box");
        container.appendChild(textinput);
        container.appendChild(update_button);
        container.classList.add("textContainer");
    }
    else if (typeof object === "object") {
        const sub_container = document.createElement("div");
        container.appendChild(sub_container);
        show_object(object, sub_container, path);
    }
}

function show_object(object, container, path="") {
    if (Array.isArray(object)) {
        const sub_container = document.createElement('div');
        container.appendChild(sub_container);
        container.classList.add("objectContainer")
        if (object.every(child => typeof child === "string")) {
            const textarea = document.createElement("textarea");
            const update_button = document.createElement('button');
            textarea.value = object.join("\n");
            textarea.rows = object.length;
            update_button.innerHTML = "update";
            update_button.classList.add("styledButton");
            update_button.addEventListener('click', update_data(update_button, path, textarea, textarea.rows));
            buttons.push(update_button);
            textarea.addEventListener("input", e => {
                update_all_button.classList.add("wait");
                update_button.classList.add("wait");
                const lines = textarea.value.split('\n')
                if (lines.length > textarea.rows) textarea.value = lines.slice(0, textarea.rows).join('\n');
            });
            sub_container.classList.add("v-box-2");
            sub_container.appendChild(textarea);
            sub_container.appendChild(update_button);
        }
        else {
            object.forEach((item, index) => {
                show(item, sub_container, `${path}.${index}`);
            });
        }
    }
    else {
        Object.keys(object).sort().forEach(key => {
            if (object.hasOwnProperty(key)) {
                const sub_container = document.createElement('div');
                container.appendChild(sub_container);
                container.classList.add("objectContainer")
                sub_container.innerHTML = `<p>${key}: </p>`;
                show(object[key], sub_container, `${path}.${key}`);
            }            
        });
    }
}

function update_data(button, path, input, limited) {
    return () => {
        if (data) {
            let current = data;
            const keys = path.split('.');
            for (let i = 1; i < keys.length - 1; i++) current = current[keys[i]];
            if (limited === undefined) {
                current[keys[keys.length - 1]] = input.value;
                button.classList.remove("wait");
            }
            else {
                current = current[keys[keys.length - 1]];
                let lines = input.value.split('\n').slice(0, limited);
                for (let i = 0; i < limited; i++) {
                    if (lines[i] === undefined) current[i] = "";
                    else current[i] = lines[i];
                }
                button.classList.remove("wait");
            }
        }
    };
}

function save() {
    const blob = new Blob([JSON.stringify(data)])
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob, { type: "application/json" });
    a.download = 'lang.json';
    a.click();
}

function saveAsLua() {
    function convertToLua(object, tab_count=0) {
        let result = "";
        if (typeof object === "string") result = `"${object}"`;
        else {
            result = "{\n";
            const tab = "\t";
            tab_count += 1;
            if (Array.isArray(object)) {
                object.forEach(item => {
                    result += tab.repeat(tab_count) + convertToLua(item, tab_count) + ",\n";
                });
            }
            else if (typeof object === "object" && object != null) {
                Object.keys(object).sort().forEach(key => {
                    if (object.hasOwnProperty(key)) {
                        item = object[key];
                        let actual_key = key;
                        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(actual_key)) {
                            actual_key = `["${key}"]`;
                        }
                        result += tab.repeat(tab_count) + `${actual_key}=${convertToLua(item, tab_count)},\n`;
                    }
                });
            }
            tab_count -= 1;
            result += tab.repeat(tab_count) + "}";
        }
        return result;
    }
    const blob = new Blob([`return ${convertToLua(data)}\n`])
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob, { type: "text/plain" });
    a.download = 'lang.lua';
    a.click();
}

function updateAll() {
    buttons.forEach(button => button.click());
    update_all_button.classList.remove("wait");
}

file_input.addEventListener('change', event => {
    const file = event.target.files[0];

    if (file) {
        console.log("Loaded.");

        if (file.type === 'application/json') {
            const reader = new FileReader();
            reader.onload = e => {
                try {
                    buttons = [];
                    const main_container = document.getElementById("mainContainer");
                    main_container.innerHTML = '';
                    data = JSON.parse(e.target.result);
                    console.log("Parsed.");
                    show(data, main_container);
                    document.getElementById("saveButton1").disabled = false;
                    document.getElementById("saveButton2").disabled = false;
                    update_all_button.disabled = false;
                } catch (err) {
                    alert("Parsing error!");
                }
            };
            reader.readAsText(file);
        }
        else {
            alert("Please select a valid JSON file.");
        }
    }
    else {
        alert("No file selected.");
    }
});