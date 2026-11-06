
const $ = id => document.getElementById(id);

let characters = [
    {
        name: "Adrian",
        dynamic: "Alfa",
        hair: "Negro",
        eyes: "Grises",
        role: "Frío, reservado y protector"
    },
    {
        name: "Noah",
        dynamic: "Omega",
        hair: "Plateado",
        eyes: "Azules",
        role: "Amable, orgulloso y valiente"
    }
];

let generatedStory = "";

function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[char]));
}

// PERSONAJES

function renderCharacters() {

    $("charactersList").innerHTML = characters.map((c, i) => `
        <div class="character-card" data-index="${i}">

            <h3>Personaje ${i + 1}</h3>

            <button class="remove-char" data-remove="${i}">
                Eliminar personaje ✕
            </button>

            <div class="form-grid">

                <label>
                    Nombre
                    <input data-key="name" value="${escapeHTML(c.name)}">
                </label>

                <label>
                    Tipo
                    <select data-key="dynamic">
                        ${["Alfa","Omega","Beta","Enigma","Humano","Otro"]
                            .map(type => `<option ${c.dynamic === type ? "selected" : ""}>${type}</option>`).join("")}
                    </select>
                </label>

                <label>
                    Cabello
                    <input data-key="hair" value="${escapeHTML(c.hair)}">
                </label>

                <label>
                    Ojos
                    <input data-key="eyes" value="${escapeHTML(c.eyes)}">
                </label>

                <label>
                    Personalidad
                    <input data-key="role" value="${escapeHTML(c.role)}">
                </label>

            </div>
        </div>
    `).join("");

    document.querySelectorAll("[data-key]").forEach(input => {
        input.addEventListener("input", event => {
            const card = event.target.closest(".character-card");
            characters[Number(card.dataset.index)][event.target.dataset.key] = event.target.value;
            saveProject();
        });
    });

    document.querySelectorAll("[data-remove]").forEach(button => {
        button.addEventListener("click", () => {
            if (characters.length <= 1) {
                alert("Necesitas al menos un personaje.");
                return;
            }

            characters.splice(Number(button.dataset.remove), 1);
            renderCharacters();
            saveProject();
        });
    });
}

// GUARDAR PROYECTO

function getData() {
    return {
        title: $("title").value,
        genre: $("genre").value,
        dynamic: $("dynamic").value,
        setting: $("setting").value,
        rules: $("rules").value,
        plot: $("plot").value,
        dialogues: $("dialogues").value,
        count: Number($("panelCount").value),
        characters
    };
}

function saveProject() {
    localStorage.setItem(
        "manhwaStudio",
        JSON.stringify(getData())
    );

    $("saveState").textContent = "● Guardado";
}

function loadProject() {
    const saved = localStorage.getItem("manhwaStudio");

    if (!saved) return;

    try {
        const data = JSON.parse(saved);

        Object.keys(data).forEach(key => {
            if ($(key) && key !== "characters") {
                $(key).value = data[key];
            }
        });

        if (data.characters) {
            characters = data.characters;
        }

    } catch (error) {
        console.error("Error al cargar proyecto", error);
    }
}

// CREAR HISTORIA

function generateScenes(data) {

    const first = data.characters[0];
    const second = data.characters[1] || first;

    const story = data.plot.trim();

    const sentences = story
        .split(/(?<=[.!?])\s+|\n+/)
        .filter(Boolean);

    const scenes = [
        `En ${data.setting || "este mundo"}, conocemos a ${first.name}, un ${first.dynamic}.`,

        sentences[0] || `${first.name} comienza un nuevo capítulo de su vida.`,

        `${second.name}, un ${second.dynamic}, aparece inesperadamente.`,

        sentences[1] || `Sus miradas se cruzan por primera vez.`,

        `${first.name} piensa: "No debería involucrarme con esta persona...".`,

        sentences.slice(2).join(" ") || `${second.name} rompe el silencio.`,

        `${first.name}: "¿Qué es lo que realmente quieres?"`,

        `${second.name}: "Eso es algo que todavía no puedo contarte."`
    ];

    return Array.from(
        { length: data.count },
        (_, i) => scenes[i % scenes.length]
    );
}

// CREAR VIÑETAS

function generateManhwa() {

    const data = getData();

    if (!data.plot.trim()) {
        alert("Escribe primero la historia del capítulo.");
        $("plot").focus();
        return;
    }

    const scenes = generateScenes(data);

    generatedStory = `
${data.title}

CAPÍTULO 1

Género: ${data.genre}

Universo: ${data.dynamic}

Ambientación: ${data.setting}

${data.rules}

PERSONAJES:

${data.characters.map(c =>
    `${c.name} — ${c.dynamic}
Cabello: ${c.hair}
Ojos: ${c.eyes}
Personalidad: ${c.role}`
).join("\n\n")}

HISTORIA:

${scenes.map((scene, i) =>
    `VIÑETA ${i + 1}\n${scene}`
).join("\n\n")}

DIÁLOGOS:

${data.dialogues}
`;

    $("comicPages").innerHTML = `
        <div class="comic-page">

            <h3>${escapeHTML(data.title)} — CAPÍTULO 1</h3>

            <div class="comic-grid">

                ${scenes.map((scene, i) => `
                    <div class="comic-panel">

                        <div class="panel-caption"
                            contenteditable="true">
                            ${escapeHTML(scene)}
                        </div>

                    </div>
                `).join("")}

            </div>
        </div>
    `;

    $("downloadBtn").disabled = false;

    saveProject();
}

// VER HISTORIA COMPLETA

$("storyBtn").addEventListener("click", () => {

    if (!generatedStory) {
        alert("Primero crea tu capítulo.");
        return;
    }

    $("dialogTitle").textContent = $("title").value;

    $("storyText").textContent = generatedStory;

    $("storyDialog").showModal();
});

$("closeDialog").addEventListener("click", () => {
    $("storyDialog").close();
});

$("copyStory").addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(generatedStory);
        alert("¡Historia copiada!");
    } catch {
        alert("No se pudo copiar automáticamente.");
    }
});

// DESCARGAR VISTA PREVIA

$("downloadBtn").addEventListener("click", () => {

    const panels = [...document.querySelectorAll(".panel-caption")];

    const content = panels.map((panel, i) =>
        `<section><h3>VIÑETA ${i + 1}</h3>
        <p>${escapeHTML(panel.innerText)}</p></section>`
    ).join("");

    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>${escapeHTML($("title").value)}</title>
        <style>
            body { font-family: Arial; background: #eee; padding: 20px; }
            main { max-width: 700px; margin: auto; background: white; padding: 25px; }
            section { border: 2px solid #332c48; padding: 20px; margin: 12px 0; background: #eee4f1; }
        </style>
    </head>
    <body>
        <main>
            <h1>${escapeHTML($("title").value)}</h1>
            ${content}
        </main>
    </body>
    </html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "mi-manhwa.html";
    link.click();

    URL.revokeObjectURL(url);
});

// AÑADIR PERSONAJE

$("addCharacter").addEventListener("click", () => {

    characters.push({
        name: "Nuevo personaje",
        dynamic: "Beta",
        hair: "Castaño",
        eyes: "Miel",
        role: "Por definir"
    });

    renderCharacters();
    saveProject();
});

// NUEVO PROYECTO

$("clearBtn").addEventListener("click", () => {

    if (!confirm("¿Deseas comenzar un proyecto nuevo?")) return;

    localStorage.removeItem("manhwaStudio");
    location.reload();
});

// CREAR

$("generateBtn").addEventListener("click", generateManhwa);

$("exportBtn").addEventListener("click", () => {
    $("downloadBtn").click();
});

// GUARDADO AUTOMÁTICO

document.querySelectorAll("input, textarea, select").forEach(element => {
    element.addEventListener("input", saveProject);
});

// INICIAR

loadProject();
renderCharacters();
