/* 四年級下學期社會・熱氣球家鄉巡航 — 遊戲引擎
   關卡類型：sort（拖曳或點選分類）、order（依序點選排列）、quiz（選擇題，可附統計圖；boss 關計時） */
(function () {
  "use strict";
  var DATA = window.G42_DATA;
  var KEY = "social-g4-2-stars";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var KIND = { hand: "動手操作", idea: "觀念題", boss: "挑戰題" };

  // ---------- 進度 ----------
  var stars = {};
  try { stars = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { stars = {}; }
  function saveStars() { try { localStorage.setItem(KEY, JSON.stringify(stars)); } catch (e) {} }
  function getStar(id) { return stars[id] || 0; }
  function totalStars() { var t = 0; for (var k in stars) t += stars[k]; return t; }
  function maxStars() { var t = 0; DATA.forEach(function (u) { t += u.levels.length * 3; }); return t; }
  function starText(n) { return "⭐".repeat(n) + "☆".repeat(3 - n); }

  // ---------- 小工具 ----------
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function flash(node, cls) { node.classList.remove(cls); void node.offsetWidth; node.classList.add(cls); }
  var toastTimer;
  function toast(msg) {
    var t = $("#toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, 1900);
  }
  function starsByMistakes(m, total) {
    if (m === 0) return 3;
    return m <= Math.max(1, Math.round(total * 0.25)) ? 2 : 1;
  }

  // ---------- 音效 ----------
  var actx = null;
  function beep(ok) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      var o = actx.createOscillator(), g = actx.createGain();
      o.type = ok ? "sine" : "sawtooth";
      o.frequency.setValueAtTime(ok ? 660 : 220, actx.currentTime);
      if (ok) o.frequency.exponentialRampToValueAtTime(990, actx.currentTime + 0.15);
      g.gain.setValueAtTime(0.07, actx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.3);
      o.connect(g); g.connect(actx.destination); o.start(); o.stop(actx.currentTime + 0.32);
    } catch (e) {}
  }

  // ---------- 朗讀 ----------
  var speakText = "";
  function speak(text) {
    if (!("speechSynthesis" in window)) { toast("這個瀏覽器不支援朗讀"); return; }
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text.replace(/[\u{1F300}-\u{1FAFF}☀-➿]/gu, ""));
    u.lang = "zh-TW"; u.rate = 0.9;
    speechSynthesis.speak(u);
  }
  $("#speakBtn").addEventListener("click", function () { if (speakText) speak(speakText); });
  function setAsk(t) { $("#ask").textContent = t; speakText = t; }
  function setProg(done, total) {
    var p = total ? Math.round(done / total * 100) : 0;
    $("#progBar").style.width = p + "%";
    $("#progBalloon").style.left = p + "%";
  }

  // ---------- 畫面切換 ----------
  var curUnit = 0, curLevel = 0;
  function show(id) {
    ["home", "unit", "play"].forEach(function (s) { $("#" + s).hidden = s !== id; });
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    window.scrollTo(0, 0);
  }
  document.addEventListener("click", function (e) {
    var g = e.target.closest("[data-go]");
    if (g) { if (g.dataset.go === "home") renderHome(); show(g.dataset.go); }
  });

  function updateStarBar() {
    $("#totalStars").textContent = totalStars();
    $("#maxStars").textContent = "/" + maxStars();
  }

  function renderHome() {
    updateStarBar();
    var box = $("#route"); box.innerHTML = "";
    DATA.forEach(function (u, i) {
      var got = 0; u.levels.forEach(function (lv) { got += getStar(lv.id); });
      var b = el("button", "station");
      b.type = "button";
      b.style.borderColor = u.color;
      b.innerHTML = '<span class="s-no" style="background:' + u.color + '">第' + (i + 1) + '站</span>' +
        '<span class="s-ico">' + u.icon + '</span>' +
        '<span class="s-name">' + esc(u.name) + '</span>' +
        '<span class="s-st">' + esc(u.station) + '</span>' +
        '<span class="s-stars">⭐ ' + got + ' / ' + u.levels.length * 3 + '</span>';
      b.addEventListener("click", function () { openUnit(i); });
      box.appendChild(b);
    });
  }

  function openUnit(i) {
    curUnit = i;
    var u = DATA[i];
    $("#unitHead").innerHTML = '<div class="u-ico">' + u.icon + '</div><div>' +
      '<h2 class="unit-title" id="unitTitle">第' + (i + 1) + '站・' + esc(u.name) + '</h2>' +
      '<p>' + esc(u.desc) + '</p></div>';
    $("#unitHead").style.borderColor = u.color;
    var list = $("#taskList"); list.innerHTML = "";
    u.levels.forEach(function (lv, j) {
      var t = el("button", "task");
      t.type = "button";
      t.innerHTML = '<span class="t-kind ' + lv.kind + '">' + KIND[lv.kind] + '</span>' +
        '<span class="t-name">任務 ' + (j + 1) + '：' + esc(lv.title) + '</span>' +
        '<span>' + starText(getStar(lv.id)) + (lv.time ? '　⏱️ ' + lv.time + ' 秒' : '') + '</span>';
      t.addEventListener("click", function () { startLevel(i, j); });
      list.appendChild(t);
    });
    show("unit");
  }

  // ---------- 計時 ----------
  var timerId = null, timeLeft = 0, overTime = false;
  function stopTimer() { if (timerId) clearInterval(timerId); timerId = null; $("#timer").hidden = true; }
  function startTimer(sec) {
    stopTimer(); timeLeft = sec; overTime = false;
    var t = $("#timer"); t.hidden = false; t.classList.remove("low");
    function draw() { t.textContent = "⏱️ " + Math.max(0, timeLeft) + " 秒"; t.classList.toggle("low", timeLeft <= 15); }
    draw();
    timerId = setInterval(function () {
      timeLeft--; draw();
      if (timeLeft <= 0) { clearInterval(timerId); timerId = null; overTime = true; toast("時間到了！繼續完成，最多可得 2 顆星"); }
    }, 1000);
  }

  $("#quitBtn").addEventListener("click", function () { stopTimer(); openUnit(curUnit); });

  // ---------- 關卡 ----------
  function startLevel(i, j) {
    curUnit = i; curLevel = j;
    var lv = DATA[i].levels[j];
    $("#playTitle").textContent = "第" + (i + 1) + "站・任務 " + (j + 1) + "：" + lv.title;
    setAsk(lv.ask);
    setProg(0, 1);
    var stage = $("#stage"); stage.innerHTML = "";
    stopTimer();
    if (lv.time) startTimer(lv.time);
    show("play");
    ({ sort: playSort, order: playOrder, quiz: playQuiz })[lv.type](lv, stage);
  }

  function finish(lv, mistakes, total) {
    stopTimer();
    var s = starsByMistakes(mistakes, total);
    if (overTime && s > 2) s = 2;
    if (s > getStar(lv.id)) { stars[lv.id] = s; saveStars(); }
    updateStarBar();
    $("#mStars").textContent = starText(s);
    $("#mTitle").textContent = s === 3 ? "完美航行！" : s === 2 ? "順利抵達！" : "完成任務！";
    $("#mText").textContent = (lv.done ? lv.done + " " : "") + "（答錯 " + mistakes + " 次）";
    var u = DATA[curUnit];
    var hasNext = curLevel + 1 < u.levels.length || curUnit + 1 < DATA.length;
    $("#mNext").textContent = curLevel + 1 < u.levels.length ? "下一個任務 →" : (hasNext ? "飛往下一站 →" : "回航線圖");
    $("#modal").hidden = false;
    beep(true);
  }
  $("#mAgain").addEventListener("click", function () { $("#modal").hidden = true; startLevel(curUnit, curLevel); });
  $("#mNext").addEventListener("click", function () {
    $("#modal").hidden = true;
    var u = DATA[curUnit];
    if (curLevel + 1 < u.levels.length) startLevel(curUnit, curLevel + 1);
    else if (curUnit + 1 < DATA.length) openUnit(curUnit + 1);
    else { renderHome(); show("home"); }
  });

  // ---- 分類：拖曳或點選 ----
  function playSort(lv, stage) {
    var mistakes = 0, placed = 0, total = lv.items.length, selected = null;
    var pool = el("div", "pool");
    var bins = el("div", "bins");
    var binEls = {};
    lv.bins.forEach(function (b) {
      var d = el("div", "bin");
      d.dataset.k = b.k;
      d.innerHTML = "<h3>" + esc(b.label) + "</h3>";
      var inner = el("div", "in"); d.appendChild(inner);
      d.addEventListener("click", function () { if (selected) tryPlace(selected, b.k); });
      binEls[b.k] = d; bins.appendChild(d);
    });
    shuffle(lv.items).forEach(function (it) {
      var c = el("div", "chip", esc(it.t));
      c.dataset.b = it.b;
      c.setAttribute("role", "button");
      c.tabIndex = 0;
      attachDrag(c);
      pool.appendChild(c);
    });
    stage.appendChild(pool); stage.appendChild(bins);

    function select(c) {
      if (selected) selected.classList.remove("sel");
      selected = selected === c ? null : c;
      if (selected) selected.classList.add("sel");
    }
    function tryPlace(c, k) {
      if (c.dataset.b === k) {
        c.classList.remove("sel", "dragging"); c.classList.add("ok");
        binEls[k].querySelector(".in").appendChild(c);
        flash(c, "pop"); beep(true);
        selected = null; placed++;
        setProg(placed, total);
        if (placed === total) setTimeout(function () { finish(lv, mistakes, total); }, 450);
      } else {
        mistakes++; beep(false);
        flash(binEls[k], "shake");
        toast("再想想看，這張卡不屬於這裡喔！");
        c.classList.remove("dragging");
      }
    }
    function attachDrag(c) {
      var sx, sy, ghost = null, moved = false, hoverBin = null;
      c.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(c); } });
      c.addEventListener("pointerdown", function (e) {
        if (c.classList.contains("ok")) return;
        sx = e.clientX; sy = e.clientY; moved = false;
        c.setPointerCapture(e.pointerId);
      });
      c.addEventListener("pointermove", function (e) {
        if (sx == null || c.classList.contains("ok")) return;
        if (!moved && Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) > 8) {
          moved = true;
          ghost = c.cloneNode(true); ghost.classList.add("ghost"); ghost.classList.remove("sel");
          ghost.style.width = c.offsetWidth + "px";
          document.body.appendChild(ghost);
          c.classList.add("dragging");
        }
        if (moved) {
          ghost.style.left = (e.clientX - ghost.offsetWidth / 2) + "px";
          ghost.style.top = (e.clientY - ghost.offsetHeight / 2) + "px";
          var under = document.elementFromPoint(e.clientX, e.clientY);
          var b = under && under.closest(".bin");
          if (hoverBin && hoverBin !== b) hoverBin.classList.remove("hover");
          hoverBin = b; if (b) b.classList.add("hover");
        }
      });
      function end(e) {
        if (sx == null) return;
        sx = null;
        if (ghost) { ghost.remove(); ghost = null; }
        if (hoverBin) hoverBin.classList.remove("hover");
        if (moved) {
          var under = document.elementFromPoint(e.clientX, e.clientY);
          var b = under && under.closest(".bin");
          if (b) tryPlace(c, b.dataset.k); else c.classList.remove("dragging");
        } else if (!c.classList.contains("ok")) {
          select(c);
        }
        hoverBin = null;
      }
      c.addEventListener("pointerup", end);
      c.addEventListener("pointercancel", function () {
        sx = null; if (ghost) { ghost.remove(); ghost = null; } c.classList.remove("dragging");
        if (hoverBin) hoverBin.classList.remove("hover"); hoverBin = null;
      });
    }
  }

  // ---- 排序：依序點選 ----
  function playOrder(lv, stage) {
    var mistakes = 0, next = 0, total = lv.items.length;
    var slots = el("div", "order-slots");
    var slotEls = lv.items.map(function (_, i) {
      var s = el("div", "slot", "<b>" + (i + 1) + "</b><span></span>");
      slots.appendChild(s); return s;
    });
    var pool = el("div", "order-pool");
    shuffle(lv.items.map(function (t, i) { return { t: t, i: i }; })).forEach(function (it) {
      var c = el("button", "chip", esc(it.t));
      c.type = "button";
      c.addEventListener("click", function () {
        if (it.i === next) {
          slotEls[next].classList.add("filled");
          slotEls[next].querySelector("span").textContent = it.t;
          flash(slotEls[next], "pop");
          c.remove(); beep(true); next++;
          setProg(next, total);
          if (next === total) setTimeout(function () { finish(lv, mistakes, total); }, 450);
        } else {
          mistakes++; beep(false); flash(c, "shake");
          toast("順序不對喔！想想第 " + (next + 1) + " 步應該先做什麼？");
        }
      });
      pool.appendChild(c);
    });
    stage.appendChild(slots); stage.appendChild(pool);
  }

  // ---- 統計圖（SVG） ----
  function drawChart(ch) {
    var W = 620, H = 300, L = 54, R = ch.line ? 54 : 20, T = 40, B = 46;
    var n = ch.labels.length, pw = W - L - R, ph = H - T - B, step = pw / n;
    var s = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(ch.title) + '">';
    s += '<text x="' + W / 2 + '" y="22" text-anchor="middle" font-size="15" font-weight="700">' + esc(ch.title) + '</text>';
    var bm = ch.bars.max;
    for (var g = 0; g <= 4; g++) {
      var gy = T + ph - ph * g / 4;
      s += '<line x1="' + L + '" y1="' + gy + '" x2="' + (W - R) + '" y2="' + gy + '" stroke="#e0d8ff"/>';
      s += '<text x="' + (L - 6) + '" y="' + (gy + 5) + '" text-anchor="end" font-size="12" style="fill:#3a7bd5">' + Math.round(bm * g / 4) + '</text>';
      if (ch.line) {
        var lv = ch.line.min + (ch.line.max - ch.line.min) * g / 4;
        s += '<text x="' + (W - R + 6) + '" y="' + (gy + 5) + '" font-size="12" style="fill:#e8663d">' + Math.round(lv) + '</text>';
      }
    }
    ch.bars.values.forEach(function (v, i) {
      var bh = ph * v / bm, bw = step * 0.6, x = L + step * i + (step - bw) / 2;
      s += '<rect x="' + x + '" y="' + (T + ph - bh) + '" width="' + bw + '" height="' + bh + '" rx="4" fill="#6fa8f5"/>';
      if (!ch.line) s += '<text x="' + (x + bw / 2) + '" y="' + (T + ph - bh - 6) + '" text-anchor="middle" font-size="14" font-weight="700">' + v + '</text>';
      s += '<text x="' + (L + step * i + step / 2) + '" y="' + (H - B + 20) + '" text-anchor="middle" font-size="14">' + esc(ch.labels[i]) + '</text>';
    });
    if (ch.unit) s += '<text x="' + (W - R) + '" y="' + (H - 8) + '" text-anchor="end" font-size="12">（' + esc(ch.unit) + '）</text>';
    if (ch.line) {
      var pts = ch.line.values.map(function (v, i) {
        var x = L + step * i + step / 2, y = T + ph - ph * (v - ch.line.min) / (ch.line.max - ch.line.min);
        return [x, y];
      });
      s += '<polyline fill="none" stroke="#ff7a45" stroke-width="3" points="' + pts.map(function (p) { return p.join(","); }).join(" ") + '"/>';
      pts.forEach(function (p) { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="4" fill="#ff7a45"/>'; });
    }
    // 圖例
    var lx = L, ly = H - 8;
    s += '<rect x="' + lx + '" y="' + (ly - 11) + '" width="14" height="12" fill="#6fa8f5"/><text x="' + (lx + 18) + '" y="' + ly + '" font-size="12">' + esc(ch.bars.name) + '</text>';
    if (ch.line) s += '<line x1="' + (lx + 130) + '" y1="' + (ly - 5) + '" x2="' + (lx + 150) + '" y2="' + (ly - 5) + '" stroke="#ff7a45" stroke-width="3"/><text x="' + (lx + 155) + '" y="' + ly + '" font-size="12">' + esc(ch.line.name) + '</text>';
    return s + "</svg>";
  }

  // ---- 選擇題 ----
  function playQuiz(lv, stage) {
    var qs = lv.time ? shuffle(lv.qs) : lv.qs.slice();
    var idx = 0, mistakes = 0, total = qs.length;
    function render() {
      stage.innerHTML = "";
      if (lv.chart) stage.insertAdjacentHTML("beforeend", drawChart(lv.chart));
      var q = qs[idx];
      stage.appendChild(el("div", "qno", "第 " + (idx + 1) + " / " + total + " 題"));
      stage.appendChild(el("p", "q", esc(q.q)));
      speakText = q.q;
      var opts = el("div", "opts");
      var order = shuffle(q.opts.map(function (t, i) { return i; }));
      var wrongOnce = false, solved = false;
      order.forEach(function (oi) {
        var b = el("button", "opt", esc(q.opts[oi]));
        b.type = "button";
        b.addEventListener("click", function () {
          if (solved || b.classList.contains("wrong")) return;
          if (oi === q.a) {
            solved = true; b.classList.add("right"); beep(true);
            stage.appendChild(el("div", "why", "💡 " + esc(q.why)));
            var row = el("div", "next-row");
            var nb = el("button", "btn primary", idx + 1 < total ? "下一題 →" : "完成任務 🎈");
            nb.type = "button";
            nb.addEventListener("click", function () {
              idx++; setProg(idx, total);
              if (idx < total) render(); else finish(lv, mistakes, total);
            });
            row.appendChild(nb); stage.appendChild(row);
            nb.focus();
          } else {
            if (!wrongOnce) { mistakes++; wrongOnce = true; }
            b.classList.add("wrong"); flash(b, "shake"); beep(false);
          }
        });
        opts.appendChild(b);
      });
      stage.appendChild(opts);
    }
    render();
  }

  // ---------- 啟動 ----------
  $("#resetBtn").addEventListener("click", function () {
    if (confirm("確定要清除四年級下學期的全部星星嗎？")) { stars = {}; saveStars(); renderHome(); toast("已清除下學期進度"); }
  });
  renderHome();
  show("home");
})();
