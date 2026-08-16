// ourpanel.js — наша выдвижная панель: сетка в игровой границе + цвет линий
var ourGridH = true;
var ourGridV = true;
var ourGridDiag = false;
var ourGridDiagAngle = 45;
var ourGridSizeUnits = 1;
var ourGridSize = 0.06;
var lineColorRGB = "0, 0, 0";

(function loadSaved() {
    try {
        const h = localStorage.getItem("wtds-og-h"); if (h != null) ourGridH = h === "true";
        const v = localStorage.getItem("wtds-og-v"); if (v != null) ourGridV = v === "true";
        const d = localStorage.getItem("wtds-og-d"); if (d != null) ourGridDiag = d === "true";
        const a = parseFloat(localStorage.getItem("wtds-og-a")); if (!isNaN(a)) ourGridDiagAngle = a;
        const s = parseFloat(localStorage.getItem("wtds-og-s")); if (!isNaN(s) && s > 0) ourGridSizeUnits = s;
        const c = localStorage.getItem("wtds-linecolor"); if (c) lineColorRGB = c;
    } catch (e) {}
    ourGridSize = ourGridSizeUnits * 0.06;
})();

function opSave(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
function setOurGridH(v) { ourGridH = v; opSave("wtds-og-h", String(v)); }
function setOurGridV(v) { ourGridV = v; opSave("wtds-og-v", String(v)); }
function setOurGridDiag(v) { ourGridDiag = v; opSave("wtds-og-d", String(v)); }
function setOurGridDiagAngle(v) { const a = parseFloat(v); if (!isNaN(a)) { ourGridDiagAngle = a; opSave("wtds-og-a", String(a)); } }
function setOurGridSize(v) {
    const n = parseFloat(v);
    if (isNaN(n) || n <= 0) return;
    ourGridSizeUnits = n;
    ourGridSize = n * 0.06;
    opSave("wtds-og-s", String(n));
    const inp = document.getElementById("opGridSize");
    if (inp) inp.step = n / 10;
}
function setLineColorHex(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex);
    if (!m) return;
    const n = parseInt(m[1], 16);
    lineColorRGB = ((n >> 16) & 255) + ", " + ((n >> 8) & 255) + ", " + (n & 255);
    opSave("wtds-linecolor", lineColorRGB);
}
function rgbStrToHex(str) {
    const p = String(str).split(",").map(s => parseInt(s));
    if (p.length < 3 || p.some(isNaN)) return "#000000";
    return "#" + p.slice(0, 3).map(x => x.toString(16).padStart(2, "0")).join("");
}
function gridRGBA(alpha) {
    const c = (typeof ctxBgColor === "string") ? ctxBgColor : "#000000";
    let r = 0, g = 0, b = 0;
    let m = c.match(/#([0-9a-f]{6})/i);
    if (m) { const v = parseInt(m[1], 16); r = (v >> 16) & 255; g = (v >> 8) & 255; b = v & 255; }
    else { m = c.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i); if (m) { r = +m[1]; g = +m[2]; b = +m[3]; } }
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return lum > 128 ? "rgba(0, 0, 0, " + alpha + ")" : "rgba(255, 255, 255, " + alpha + ")";
}

// ===== наша сетка вместо их drawGrid =====
function drawGrid() {
    const BX = 1, BY = 0.5;
    ctx.lineWidth = 1;
    ctx.save();
    const c1 = v2disposSight2v2canvas({x: -BX, y: -BY});
    const c2 = v2disposSight2v2canvas({x: BX, y: BY});
    ctx.beginPath();
    ctx.rect(Math.min(c1.x, c2.x), Math.min(c1.y, c2.y), Math.abs(c2.x - c1.x), Math.abs(c2.y - c1.y));
    ctx.clip();
    const step = ourGridSize;
    ctx.strokeStyle = gridRGBA(0.25);
    ctx.beginPath();
    if (ourGridH) {
        for (let i = 0; i <= BY + 1e-9; i += step) {
            const ys = i === 0 ? [0] : [i, -i];
            for (const y of ys) {
                const f = v2disposSight2v2canvas({x: -BX, y: y}), t = v2disposSight2v2canvas({x: BX, y: y});
                ctx.moveTo(f.x, f.y); ctx.lineTo(t.x, t.y);
            }
        }
    }
    if (ourGridV) {
        for (let j = 0; j <= BX + 1e-9; j += step) {
            const xs = j === 0 ? [0] : [j, -j];
            for (const x of xs) {
                const f = v2disposSight2v2canvas({x: x, y: -BY}), t = v2disposSight2v2canvas({x: x, y: BY});
                ctx.moveTo(f.x, f.y); ctx.lineTo(t.x, t.y);
            }
        }
    }
    if (ourGridDiag) {
        const a = ourGridDiagAngle * Math.PI / 180;
        const dx = Math.cos(a), dy = Math.sin(a), nx = -dy, ny = dx;
        const corners = [{x:-BX,y:-BY},{x:BX,y:-BY},{x:BX,y:BY},{x:-BX,y:BY}];
        let maxProj = 0, maxDir = 0;
        for (const c of corners) {
            maxProj = Math.max(maxProj, Math.abs(c.x*nx + c.y*ny));
            maxDir = Math.max(maxDir, Math.abs(c.x*dx + c.y*dy));
        }
        for (let o = 0; o <= maxProj + 1e-9; o += step) {
            const offs = o === 0 ? [0] : [o, -o];
            for (const off of offs) {
                const cx = nx*off, cy = ny*off;
                const f = v2disposSight2v2canvas({x: cx - dx*maxDir*1.5, y: cy - dy*maxDir*1.5});
                const t = v2disposSight2v2canvas({x: cx + dx*maxDir*1.5, y: cy + dy*maxDir*1.5});
                ctx.moveTo(f.x, f.y); ctx.lineTo(t.x, t.y);
            }
        }
    }
    ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = gridRGBA(0.6);
    ctx.beginPath();
    const b1 = v2disposSight2v2canvas({x:-BX,y:-BY}), b2 = v2disposSight2v2canvas({x:BX,y:-BY});
    const b3 = v2disposSight2v2canvas({x:BX,y:BY}), b4 = v2disposSight2v2canvas({x:-BX,y:BY});
    ctx.moveTo(b1.x, b1.y); ctx.lineTo(b2.x, b2.y); ctx.lineTo(b3.x, b3.y); ctx.lineTo(b4.x, b4.y);
    ctx.closePath();
    ctx.stroke();
}

// ===== панель =====
document.addEventListener("DOMContentLoaded", function () {
    const panel = document.createElement("div");
    panel.style.cssText = "position:fixed;top:44px;left:50%;width:240px;z-index:9990;background:#2b2b2b;border:1px solid #4a4a4a;border-radius:8px;padding:10px;font:12px system-ui,sans-serif;color:#eee;transform:translate(-50%,-130%);transition:transform .25s;max-height:85vh;overflow-y:auto;";
    panel.innerHTML =
        '<div style="font-weight:600;margin-bottom:6px;">Панель инструментов</div>' +
        '<div style="margin-bottom:4px;opacity:.75;">Сетка (игровая граница)</div>' +
        '<label style="display:flex;gap:6px;align-items:center;margin:2px 0;"><input type="checkbox" id="opH"> Horizontal</label>' +
        '<label style="display:flex;gap:6px;align-items:center;margin:2px 0;"><input type="checkbox" id="opV"> Vertical</label>' +
        '<label style="display:flex;gap:6px;align-items:center;margin:2px 0;"><input type="checkbox" id="opD"> Diagonal ' +
        '<input type="number" id="opDA" step="5" style="width:4em;">°</label>' +
        '<label style="display:flex;gap:6px;align-items:center;margin:2px 0;">Size <input type="number" id="opGridSize" style="width:5em;"></label>' +
        '<div style="margin:8px 0 4px;opacity:.75;">Цвет линий</div>' +
        '<input type="color" id="opColor" style="width:100%;height:26px;border:none;background:none;cursor:pointer;">';
    document.body.appendChild(panel);

    const btn = document.createElement("button");
    btn.textContent = "⚙";
    btn.style.cssText = "position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:9991;width:30px;height:30px;border-radius:6px;border:1px solid #4a4a4a;background:#2b2b2b;color:#eee;cursor:pointer;";
    document.body.appendChild(btn);

    let open = false;
    function layout() {
        panel.style.transform = open ? "translate(-50%, 0)" : "translate(-50%, -130%)";
    }
    btn.onclick = () => { open = !open; layout(); };
    layout();

    const h = panel.querySelector("#opH"); h.checked = ourGridH; h.onchange = () => setOurGridH(h.checked);
    const v = panel.querySelector("#opV"); v.checked = ourGridV; v.onchange = () => setOurGridV(v.checked);
    const d = panel.querySelector("#opD"); d.checked = ourGridDiag; d.onchange = () => setOurGridDiag(d.checked);
    const da = panel.querySelector("#opDA"); da.value = ourGridDiagAngle; da.onchange = () => setOurGridDiagAngle(da.value);
    const s = panel.querySelector("#opGridSize"); s.value = ourGridSizeUnits; s.step = ourGridSizeUnits / 10; s.onchange = () => setOurGridSize(s.value);
    const col = panel.querySelector("#opColor"); col.value = rgbStrToHex(lineColorRGB); col.oninput = () => setLineColorHex(col.value);
});