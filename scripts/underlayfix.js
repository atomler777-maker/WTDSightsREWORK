// underlayfix.js — подложка неактивного слоя серым, применяется сразу
window.drawOtherLayer = function () {
    if (typeof showOtherLayer !== "undefined" && !showOtherLayer) return;
    if (typeof layers === "undefined") return;
    const cur = (typeof currentLayer !== "undefined") ? currentLayer : 0;
    const other = layers[1 - cur];
    if (!other || other.size === 0) return;

    ctx.save();
    ctx.lineWidth = Math.max(1, (typeof getLineWidth === "function") ? getLineWidth(1.2) : 1.2);
    ctx.strokeStyle = "rgba(128, 128, 128, 0.9)";
    ctx.fillStyle = "rgba(128, 128, 128, 0.5)";

    for (const [id, object] of other) {
        if (object.type === "line") {
            const a = v2disposSight2v2canvas(object.start);
            const b = v2disposSight2v2canvas(object.end);
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        } else if (object.type === "quad") {
            const p1 = v2disposSight2v2canvas(object.pos1);
            const p2 = v2disposSight2v2canvas(object.pos2);
            const p3 = v2disposSight2v2canvas(object.pos3);
            const p4 = v2disposSight2v2canvas(object.pos4);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
            ctx.lineTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y);
            ctx.closePath(); ctx.fill(); ctx.stroke();
        }
    }
    ctx.restore();
};
console.log("underlayfix active");
