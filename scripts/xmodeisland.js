// xmodeisland.js — X-режим (клик-клик) полностью автономно + плавающий островок
var clickDrawMode = false;

(function () {
    function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
    function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

    function updateStateUI() {
        const st = document.getElementById("xmodeState");
        if (st) {
            st.textContent = clickDrawMode ? "ON" : "OFF";
            st.style.color = clickDrawMode ? "#7CFC7C" : "#eee";
        }
    }

    window.toggleXMode = function () {
        clickDrawMode = !clickDrawMode;
        if (typeof startPos !== "undefined") startPos = null;
        updateStateUI();
    };

    function build() {
        // убираем старый индикатор из панели «Линии», если он остался в HTML
        const old = document.getElementById("clickDrawState");
        if (old) {
            const parent = old.parentElement;
            old.remove();
            if (parent) {
                [...parent.childNodes].forEach(ch => {
                    if (ch.nodeType === 3 && /X-mode/.test(ch.textContent)) ch.remove();
                });
            }
        }

        const isl = document.createElement("div");
        isl.id = "xmodeIsland";
        isl.style.cssText = "position:fixed;z-index:9995;background:#2b2b2b;border:1px solid #4a4a4a;border-radius:6px;padding:4px 8px;font:11px system-ui,sans-serif;color:#eee;cursor:grab;user-select:none;touch-action:none;";
        isl.innerHTML = 'X-mode: <span id="xmodeState" style="font-weight:700;color:#eee;">OFF</span>';

        let x = parseFloat(lsGet("xmode-island-x"));
        let y = parseFloat(lsGet("xmode-island-y"));
        if (isNaN(x)) x = window.innerWidth - 100;
        if (isNaN(y)) y = 10;
        isl.style.left = x + "px";
        isl.style.top = y + "px";
        document.body.appendChild(isl);
        updateStateUI();

        let dragging = false, moved = false, sx = 0, sy = 0, ox = 0, oy = 0;
        isl.onpointerdown = (e) => {
            dragging = true; moved = false;
            sx = e.clientX; sy = e.clientY;
            ox = parseFloat(isl.style.left); oy = parseFloat(isl.style.top);
            isl.setPointerCapture(e.pointerId);
            isl.style.cursor = "grabbing";
        };
        isl.onpointermove = (e) => {
            if (!dragging) return;
            const dx = e.clientX - sx, dy = e.clientY - sy;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
            if (moved) { isl.style.left = (ox + dx) + "px"; isl.style.top = (oy + dy) + "px"; }
        };
        isl.onpointerup = () => {
            dragging = false;
            isl.style.cursor = "grab";
            if (moved) { lsSet("xmode-island-x", isl.style.left); lsSet("xmode-island-y", isl.style.top); }
            else window.toggleXMode();
        };

        // ===== логика клик-клик поверх чистого drawing.js =====
        const canvas = document.getElementById("mainCanvas");
        if (canvas) {
            canvas.addEventListener("pointerdown", (e) => {
                if (e.button !== 0 || !clickDrawMode) return;
                if (typeof tool === "undefined" || tool !== "lines") return;
                e.stopImmediatePropagation();
                e.preventDefault();
                let pos = v2canvas2v2disposSight(getMousePos(e.offsetX, e.offsetY));
                if (typeof snapping !== "undefined" && (snapping || (typeof mobileSnappingActive !== "undefined" && mobileSnappingActive))) {
                    const sp = snappingPos(pos, 40);
                    if (sp != null) pos = sp;
                }
                const p = { x: Math.round(pos.x * 1e6) / 1e6, y: Math.round(pos.y * 1e6) / 1e6 };
                if (startPos == null) {
                    startPos = p;
                } else {
                    const objIdStr = nextId().toString();
                    const object = {
                        name: lang.line + " " + objIdStr,
                        type: "line",
                        start: startPos,
                        end: p,
                        selected: false
                    };
                    objects.set(objIdStr, object);
                    pushEvent("add", { id: objIdStr, object: object });
                    startPos = p;
                    refreshObjectsList(true);
                }
            }, true);

            // не даём их endDrawing создать нулевую линию на каждом клике
            canvas.addEventListener("pointerup", (e) => {
                if (e.button !== 0 || !clickDrawMode) return;
                if (typeof tool === "undefined" || tool !== "lines") return;
                const keep = startPos;
                startPos = null;
                setTimeout(() => { if (clickDrawMode && startPos == null) startPos = keep; }, 0);
            }, true);
        }

        window.addEventListener("keydown", (e) => {
            const typing = document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement;
            if (e.code === "KeyX" && !typing) window.toggleXMode();
            if (e.code === "Escape" && clickDrawMode) startPos = null;
        });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
    else build();
})();