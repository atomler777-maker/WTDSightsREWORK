// crosshairfix.js v2 — цвет перекрестия, пикер ВНУТРИ выдвижной панели
var crossRGB = "255, 255, 255";
try {
    const savedCross = localStorage.getItem("wtds-cross-color");
    if (savedCross) crossRGB = savedCross;
} catch (e) {}

function drawCrosshair() {
    const crossPixelPos = v2sight2v2pixel(v2disposSight2v2sight({ x: 0, y: 0 }));
    const crossCanvasPos = v2pixel2v2canvas(crossPixelPos);
    ctx.strokeStyle = "rgba(" + crossRGB + ", 0.6)";
    ctx.lineWidth = Math.max(1, (typeof getLineWidth === "function") ? getLineWidth(1) : 1);
    ctx.beginPath();
    const infinity = 10000;
    ctx.moveTo(crossCanvasPos.x - infinity, crossCanvasPos.y);
    ctx.lineTo(crossCanvasPos.x + infinity, crossCanvasPos.y);
    ctx.moveTo(crossCanvasPos.x, crossCanvasPos.y - infinity);
    ctx.lineTo(crossCanvasPos.x, crossCanvasPos.y + infinity);
    ctx.stroke();
}

function crossHexToRgb(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex);
    if (!m) return null;
    const n = parseInt(m[1], 16);
    return ((n >> 16) & 255) + ", " + ((n >> 8) & 255) + ", " + (n & 255);
}
function crossRgbToHex(str) {
    const p = String(str).split(",").map(function (s) { return parseInt(s); });
    if (p.length < 3 || p.some(isNaN)) return "#ffffff";
    return "#" + p.slice(0, 3).map(function (n) { return n.toString(16).padStart(2, "0"); }).join("");
}

document.addEventListener("DOMContentLoaded", function () {
    // ищем выдвижную панель по заголовку
    const panel = Array.from(document.querySelectorAll("div")).find(function (d) {
        return d.style && d.style.position === "fixed" && d.textContent.indexOf("Панель инструментов") !== -1;
    });

    // строка: уже созданная нами, или leftover от v1, или новая
    let row = document.getElementById("crossColorRow");
    if (!row) {
        const oldInput = document.getElementById("opCross");
        if (oldInput) row = oldInput.closest("div");
    }
    if (!row) {
        row = document.createElement("div");
        row.innerHTML =
            '<div style="opacity:.75;margin-bottom:4px;">Цвет перекрестия</div>' +
            '<input type="color" id="opCross" style="width:100%;height:26px;border:none;background:none;cursor:pointer;">';
    }
    row.id = "crossColorRow";

    if (panel) {
        row.style.cssText = "margin-top:8px;";
        panel.appendChild(row);
    } else if (!row.parentElement) {
        row.style.cssText = "position:fixed;top:44px;left:50%;transform:translateX(-50%);z-index:9990;background:#2b2b2b;border:1px solid #4a4a4a;border-radius:8px;padding:8px;width:240px;";
        document.body.appendChild(row);
    }

    const cr = row.querySelector("#opCross");
    cr.value = crossRgbToHex(crossRGB);
    cr.oninput = function () {
        const s = crossHexToRgb(cr.value);
        if (s) {
            crossRGB = s;
            try { localStorage.setItem("wtds-cross-color", s); } catch (e) {}
        }
    };
});
