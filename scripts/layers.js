// layers.js — финальный: слои A/B, слияние, персист, остров UI
let layers = [null, null];
let currentLayer = 0;
let showOtherLayer = true;

function setShowOtherLayer(v) { showOtherLayer = v; }

function updateLayerButtons() {
    const a = document.getElementById("lyrA");
    const b = document.getElementById("lyrB");
    if (a) a.style.outline = currentLayer === 0 ? "2px solid #4a90d9" : "none";
    if (b) b.style.outline = currentLayer === 1 ? "2px solid #4a90d9" : "none";
}

function deepCopyMap(m) {
    const out = new Map();
    for (const [id, o] of m) out.set(id, JSON.parse(JSON.stringify(o)));
    return out;
}

function switchLayer(target) {
    if (target === currentLayer) return;
    const backup = deepCopyMap(objects);
    try {
        layers[currentLayer] = backup;
        objects.clear();
        const src = layers[target];
        if (src != null) {
            for (const [id, obj] of src) objects.set(id, JSON.parse(JSON.stringify(obj)));
        }
        currentLayer = target;
    } catch (e) {
        console.error("switchLayer failed:", e);
        objects.clear();
        for (const [id, o] of backup) objects.set(id, JSON.parse(JSON.stringify(o)));
    }
    console.log("switch ->", target, "objects:", objects.size);
    if (typeof unselectAnyObjects === "function") unselectAnyObjects();
    if (typeof clearEvents === "function") clearEvents();
    if (typeof refreshObjectsList === "function") refreshObjectsList(true);
    updateLayerButtons();
    persistLayers();
}

function mergeLayers() {
    const other = layers[1 - currentLayer];
    if (other == null || other.size === 0) return;
    for (const [id, obj] of other) {
        const newId = nextId().toString();
        const copy = JSON.parse(JSON.stringify(obj));
        copy.selected = false;
        objects.set(newId, copy);
        if (typeof pushEvent === "function") pushEvent("add", { id: newId, object: copy });
    }
    if (typeof refreshObjectsList === "function") refreshObjectsList(true);
    persistLayers();
}

function serializeMap(m) { return JSON.stringify([...m]); }
function deserializeMap(raw) { try { return raw ? new Map(JSON.parse(raw)) : null; } catch (e) { return null; } }
function persistLayers() {
    try {
        const l0 = currentLayer === 0 ? objects : layers[0];
        const l1 = currentLayer === 1 ? objects : layers[1];
        if (l0 != null) localStorage.setItem("wtdsight-layer-0", serializeMap(l0));
        if (l1 != null) localStorage.setItem("wtdsight-layer-1", serializeMap(l1));
        localStorage.setItem("wtdsight-cur", String(currentLayer));
    } catch (e) {}
}
function initLayersFromStorage() {
    try {
        const cur = parseInt(localStorage.getItem("wtdsight-cur"));
        if (cur === 0 || cur === 1) currentLayer = cur;
        const saved0 = deserializeMap(localStorage.getItem("wtdsight-layer-0"));
        const saved1 = deserializeMap(localStorage.getItem("wtdsight-layer-1"));
        layers[0] = currentLayer === 0 ? new Map(objects) : (saved0 || layers[0]);
        layers[1] = currentLayer === 1 ? new Map(objects) : (saved1 || layers[1]);
    } catch (e) {}
    updateLayerButtons();
}
window.addEventListener("load", function () { setTimeout(initLayersFromStorage, 300); });
window.addEventListener("beforeunload", persistLayers);
setInterval(persistLayers, 10000);

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('[onclick^="switchLayer"], [onclick*="mergeLayers("], [onchange*="setShowOtherLayer"]').forEach(n => n.remove());
    ["layerABtn", "layerBBtn", "mergeLayersBtn", "layersIsland"].forEach(id => {
        const n = document.getElementById(id);
        if (n) n.remove();
    });
    document.querySelectorAll("span, label").forEach(n => {
        if (n.children.length === 0 && /Layers:/.test(n.textContent)) n.remove();
    });

    const exportBtn = Array.from(document.querySelectorAll("button")).find(b => (b.textContent || "").includes("Экспортировать прицел как .blk"));
    if (!exportBtn) return;
    let anchor = exportBtn;
    while (anchor.parentElement && !anchor.classList.contains("menuIsland")) anchor = anchor.parentElement;
    if (!anchor.classList.contains("menuIsland")) anchor = exportBtn;

    const block = document.createElement("div");
    block.id = "layersIsland";
    block.style.cssText = "margin: 8px 0; padding: 10px; display: flex; flex-direction: column; gap: 6px; background: var(--menu-bg, #262626); border: 1px solid var(--border-col, #3a3a3a); border-radius: 8px;";
    block.innerHTML =
        '<div style="font-weight:600;">Слои</div>' +
        '<div style="display:flex;align-items:center;gap:6px;"><span>Layers:</span>' +
        '<button id="lyrA" style="flex:1;">A</button><button id="lyrB" style="flex:1;">B</button></div>' +
        '<label style="display:flex;align-items:center;gap:6px;"><input type="checkbox" id="lyrShow" checked> show other layer</label>' +
        '<button id="lyrMerge" style="width:100%;">Merge other into active</button>';
    anchor.insertAdjacentElement("beforebegin", block);

    block.querySelector("#lyrA").onclick = function () { switchLayer(0); };
    block.querySelector("#lyrB").onclick = function () { switchLayer(1); };
    block.querySelector("#lyrShow").onchange = function (e) { setShowOtherLayer(e.target.checked); };
    block.querySelector("#lyrMerge").onclick = function () { mergeLayers(); };
    updateLayerButtons();
});
