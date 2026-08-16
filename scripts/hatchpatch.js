// hatchpatch.js — синхронизация штриховки с сеткой, hatch.js не трогаем

// 1) +90 к углу: шкала углов как у нашей сетки (140 = 140 параллельно)
(function () {
    const orig = window.generateHatchData;
    if (typeof orig === "function") {
        window.generateHatchData = function (regions, angleDeg, spacing, phase, mode, thickness) {
            return orig(regions, angleDeg + 90, spacing, phase, mode, thickness);
        };
    }
})();

// 2) плотность в единицах сетки: 1 = 0.06
function setHatchDensityUnits(v) {
    let n = parseFloat(v);
    if (isNaN(n) || n <= 0) return;
    if (n < 0.01) n = 0.01;
    if (n > 8) n = 8;
    hatchDensity = n * 0.06;
    const inp = document.getElementById('hatchDensityInput');
    if (inp) inp.step = n / 10;
    const midLine = document.getElementById('middleLineForHatch');
    if (midLine) midLine.innerHTML = '50% = ' + Number((hatchDensity * 2.5).toFixed(6)) + ' ↑';
    if (typeof updateHatchPreview === 'function') updateHatchPreview();
}

document.addEventListener('DOMContentLoaded', function () {
    const inp = document.getElementById('hatchDensityInput');
    if (!inp) return;
    inp.min = 0.01; inp.max = 8; inp.step = 0.05; inp.value = 0.5;
    setHatchDensityUnits(0.5);

    // наш живой ввод вместо их перезаписывающего
    inp.oninput = function () { setHatchDensityUnits(inp.value); };
    inp.onchange = function () {
        inp.value = Number((hatchDensity / 0.06).toFixed(3));
        inp.step = (hatchDensity / 0.06) / 10;
    };

    // пипетка пишет сырое значение — переводим поле в единицы
    setInterval(function () {
        if (document.activeElement === inp) return;
        const v = parseFloat(inp.value);
        if (isNaN(v)) return;
        if (Math.abs(v - hatchDensity) < 1e-9 && Math.abs(v * 0.06 - hatchDensity) > 1e-9) {
            inp.value = Number((hatchDensity / 0.06).toFixed(3));
            inp.step = (hatchDensity / 0.06) / 10;
        }
    }, 500);
});