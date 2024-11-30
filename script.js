const file_input = document.getElementById('fileInput');

function show(object, container, path) {
    if (typeof object === "string") {
        const sub_container = document.createElement('div');
        const textarea = document.createElement('textarea');
        const update_button = document.createElement('button');
        textarea.value = object;
        update_button.innerHTML = "update";
        update_button.classList.add("styledButton");
        update_button.addEventListener('click', update_data(path, textarea));
        sub_container.classList.add("v-box");
        sub_container.appendChild(textarea);
        sub_container.appendChild(update_button);
        sub_container.classList.add("textContainer")
        container.appendChild(sub_container);
    }
    else if (typeof object === "object") {
        const sub_container = document.createElement("div");
        container.appendChild(sub_container);
        show_object(object, sub_container, path);
    }
}

function show_object(object, container, path) {
    if (Array.isArray(object)) {
        object.forEach((item, index) => {
            const sub_container = document.createElement('div');
            container.appendChild(sub_container);
            container.classList.add("objectContainer")
            show(item, sub_container, `${path}.${index}`);
        });
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

function update_data(path, textarea) {
    return () => {
        console.log(path);
        if (data) {
            let current = data;
            const keys = path.split('.');
            for (let i = 1; i < keys.length - 1; i++) current = current[keys[i]];
            console.log(current[keys[keys.length - 1]]);
            current[keys[keys.length - 1]] = textarea.value;
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

file_input.addEventListener('change', event => {
    const file = event.target.files[0];

    if (file) {
        console.log("Loaded.");

        if (file.type === 'application/json') {
            const reader = new FileReader();
            reader.onload = e => {
                try {
                    data = JSON.parse(e.target.result);
                    console.log("Parsed.");
                    show(data, document.getElementById("mainContainer"));
                    document.getElementById("saveButton1").disabled = false;
                    document.getElementById("saveButton2").disabled = false;
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