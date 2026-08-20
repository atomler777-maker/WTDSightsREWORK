// exportfix.js — чистый экспорт .blk: шапка-шаблон + drawLines/drawQuads из объектов
(function () {
    var HEADER = [
        "crosshairHorVertSize:p2=3, 2",
        "rangeFinderProgressBarColor1:c=0, 255, 0, 64",
        "rangeFinderProgressBarColor2:c=255, 255, 255, 64",
        "rangeFinderTextScale:r=0.7",
        "rangeFinderUseThousandth:b=no",
        "rangeFinderVerticalOffset:r=0.1",
        "rangeFinderHorizontalOffset:r=5",
        "detectAllyTextScale:r=0.7",
        "detectAllyOffset:p2=4, 0.05",
        "fontSizeMult:r=1",
        "lineSizeMult:r=1",
        "drawCentralLineVert:b=yes",
        "drawCentralLineHorz:b=yes",
        "drawSightMask:b=yes",
        "useSmoothEdge:b=no",
        "crosshairColor:c=0, 0, 0, 0",
        "crosshairLightColor:c=0, 0, 0, 0",
        "crosshairDistHorSizeMain:p2=0.03, 0.02",
        "crosshairDistHorSizeAdditional:p2=0.005, 0.003",
        "distanceCorrectionPos:p2=-0.26, -0.05",
        "drawDistanceCorrection:b=yes",
        "",
        "crosshair_distances{",
        "distance:p3=200, 0, 0",
        "distance:p3=400, 4, 0",
        "distance:p3=600, 0, 0",
        "distance:p3=800, 8, 0",
        "distance:p3=1000, 0, 0",
        "distance:p3=1200, 12, 0",
        "distance:p3=1400, 0, 0",
        "distance:p3=1600, 16, 0",
        "distance:p3=1800, 0, 0",
        "distance:p3=2000, 20, 0",
        "}",
        "",
        "crosshair_hor_ranges{",
        "}",
        "",
        "matchExpClass{",
        "exp_tank:b = yes",
        "exp_heavy_tank:b = yes",
        "exp_tank_destroyer:b = yes",
        "exp_SPAA:b = yes",
        "}"
    ];

    function fmt(n) { return String(Math.round(n * 1000000) / 1000000); }

    function buildBlk() {
        var L = HEADER.slice();
        L.push("drawLines{");
        for (var entry of objects) {
            var o = entry[1];
            if (o.type === "line") {
                L.push("line {line:p4=" + fmt(o.start.x) + "," + fmt(o.start.y) + "," + fmt(o.end.x) + "," + fmt(o.end.y) + ";move:b=false;}");
            }
        }
        L.push("}");
        L.push("drawQuads{");
        for (var entry2 of objects) {
            var q = entry2[1];
            if (q.type === "quad") {
                L.push("quad {tl:p2 = " + fmt(q.pos1.x) + "," + fmt(q.pos1.y) + ";tr:p2 = " + fmt(q.pos2.x) + "," + fmt(q.pos2.y) + ";br:p2 = " + fmt(q.pos3.x) + "," + fmt(q.pos3.y) + ";bl:p2 = " + fmt(q.pos4.x) + "," + fmt(q.pos4.y) + ";}");
            }
        }
        L.push("}");
        return L.join("\n");
    }

    function getFileName() {
        var name = "sight";
        var lab = Array.from(document.querySelectorAll("div, label, span")).find(function (n) {
            return n.children.length <= 3 && /Название файла/.test(n.textContent) && n.textContent.length < 60;
        });
        if (lab) {
            var inp = lab.querySelector("input") || (lab.parentElement && lab.parentElement.querySelector("input"));
            if (inp && inp.value && inp.value.trim()) name = inp.value.trim();
        }
        return name;
    }

    function downloadBlk() {
        var blob = new Blob([buildBlk()], { type: "text/plain;charset=utf-8" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = getFileName() + ".blk";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    }

    document.addEventListener("DOMContentLoaded", function () {
        var btn = Array.from(document.querySelectorAll("button")).find(function (b) {
            return (b.textContent || "").indexOf("Экспортировать прицел как .blk") !== -1;
        });
        if (!btn) return;
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            downloadBlk();
        }, true);
    });
})();
