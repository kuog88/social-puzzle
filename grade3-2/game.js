/* 三年級下學期社會・小鎮郵差送信記 — 遊戲引擎
   關卡類型：sort（分類）、quiz（選擇題）、order（排順序）、match（配對）、piggy（存錢計算）、spot（街景搜查） */
(function () {
  "use strict";
  var DATA = window.G32_DATA;
  var KEY = "social-g3-2-stars";
  var $ = function (s, r) { return (r || document).querySelector(s); };

  // ---------- 進度 ----------
  var stars = {};
  try { stars = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { stars = {}; }
  function saveStars() { try { localStorage.setItem(KEY, JSON.stringify(stars)); } catch (e) {} }
  function getStar(ui, li) { return stars[DATA[ui].id + "-" + li] || 0; }
  function totalStars() { var t = 0; for (var k in stars) t += stars[k]; return t; }
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
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, 1800);
  }
  // 延遲事件集中管理：所有延遲都經過 later()，換畫面時 clearLater() 全部取消，避免記到別的信件
  var laterIds = [];
  function later(fn, ms) {
    var id = setTimeout(function () { laterIds = laterIds.filter(function (x) { return x !== id; }); fn(); }, ms);
    laterIds.push(id); return id;
  }
  function clearLater() {
    laterIds.forEach(clearTimeout); laterIds = [];
    clearTimeout(toastTimer); $("#toast").hidden = true;
  }
  // 星星規則（社會各年級統一，詳見 README）：全對 3 顆；答錯 ≤ 題數 1/4（至少容許 1 次）2 顆；
  // 答錯 ≤ 題數一半 1 顆；再多就 0 顆，鼓勵再試
  function starsFor(m, total) {
    total = Math.max(1, total);
    if (m === 0) return 3;
    if (m <= Math.max(1, Math.round(total / 4))) return 2;
    return m <= total / 2 ? 1 : 0;
  }
  function starVerdict(n, m) {
    return n === 3 ? "全對！太厲害了！"
      : n === 2 ? "答錯 " + m + " 次，很棒！再細心一點就能拿到 3 顆星。"
      : n === 1 ? "答錯 " + m + " 次，過關了！再複習一下，可以拿到更多星星。"
      : "答錯 " + m + " 次，這次還沒拿到星星。先看看說明，再挑戰一次吧！💪";
  }
  // 依答錯次數與題數結算：done(星數, 評語＋補充說明)
  function doneBy(done, m, total, text) { var n = starsFor(m, total); done(n, starVerdict(n, m) + (text ? " " + text : "")); }

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

  // ---------- 畫面切換 ----------
  var curUnit = 0, curLevel = 0;
  function show(id) {
    ["home", "unit", "play"].forEach(function (s) { $("#" + s).hidden = s !== id; });
    clearLater(); $("#modal").hidden = true;
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    window.scrollTo(0, 0);
  }
  document.addEventListener("click", function (e) {
    var g = e.target.closest("[data-go]");
    if (g) { if (g.dataset.go === "home") renderHome(); show(g.dataset.go); }
  });

  function renderHome() {
    $("#totalStars").textContent = totalStars();
    var town = $("#town"); town.innerHTML = "";
    DATA.forEach(function (u, ui) {
      var got = 0; u.levels.forEach(function (_, li) { got += getStar(ui, li); });
      var b = el("button", "house");
      b.type = "button";
      b.style.setProperty("--c", u.color);
      b.innerHTML = '<span class="inner"><span class="no">第' + u.no + '街區</span><span class="em">' + u.house +
        '</span><span class="nm">' + esc(u.name) + '</span><span class="stars">郵戳 ' + got + ' / 9</span></span>';
      b.addEventListener("click", function () { openUnit(ui); });
      town.appendChild(b);
    });
  }

  function openUnit(ui) {
    curUnit = ui;
    var u = DATA[ui];
    $("#unitHead").innerHTML = '<h2>' + u.house + ' 第' + u.no + '單元　' + esc(u.name) + '</h2><p>' + esc(u.lessons) + '</p>';
    var list = $("#levelList"); list.innerHTML = "";
    u.levels.forEach(function (lv, li) {
      var c = el("button", "level-card");
      c.type = "button";
      c.innerHTML = '<span class="kind k' + (li + 1) + '">第 ' + (li + 1) + ' 封信・' + lv.kind + '</span><h3>' + esc(lv.title) +
        '</h3><span class="got">' + starText(getStar(ui, li)) + '</span>';
      c.addEventListener("click", function () { startLevel(ui, li); });
      list.appendChild(c);
    });
    show("unit");
  }

  // ---------- 關卡 ----------
  // ---------- 家長報表 ----------
  var repTally = null;
  function rep(ok, q, a, c) { window.KGReport && KGReport.answer(ok, { q: q, a: a, c: c }); }

  function setProg(f) { $("#progBar").style.width = Math.round(Math.min(1, f) * 100) + "%"; }
  function startLevel(ui, li) {
    curUnit = ui; curLevel = li;
    var lv = DATA[ui].levels[li];
    $("#playTitle").textContent = "第" + DATA[ui].no + "單元・" + lv.kind + "：" + lv.title;
    setProg(0);
    repTally = null;
    window.KGReport && KGReport.level(DATA[ui].no + "-" + (li + 1) + " " + lv.kind + "：" + lv.title, "第" + DATA[ui].no + "單元 " + DATA[ui].name);
    var stage = $("#stage"); stage.innerHTML = "";
    show("play");
    RENDER[lv.type](stage, lv, finish);
  }
  $("#quitBtn").addEventListener("click", function () { openUnit(curUnit); });

  function finish(n, text) {
    var key = DATA[curUnit].id + "-" + curLevel;
    if (n > (stars[key] || 0)) { stars[key] = n; saveStars(); }
    var rd = { stars: n };
    if (repTally) { rd.right = repTally.right; rd.total = repTally.total; }
    window.KGReport && KGReport.done(rd);
    setProg(1);
    $("#mStamp").textContent = starText(n);
    $("#mTitle").textContent = n === 3 ? "完美送達！" : n === 2 ? "順利送達！" : n === 1 ? "送到了，再接再厲！" : "再試一次！";
    $("#mText").textContent = text || "";
    var last = curUnit === DATA.length - 1 && curLevel === DATA[curUnit].levels.length - 1;
    $("#mNext").textContent = last ? "回小鎮地圖" : "下一封信 →";
    $("#modal").hidden = false;
  }
  $("#mAgain").addEventListener("click", function () { $("#modal").hidden = true; startLevel(curUnit, curLevel); });
  $("#mNext").addEventListener("click", function () {
    $("#modal").hidden = true;
    var u = curUnit, l = curLevel + 1;
    if (l >= DATA[u].levels.length) { u++; l = 0; }
    if (u >= DATA.length) { renderHome(); show("home"); return; }
    startLevel(u, l);
  });

  // ---------- 拖曳（滑鼠＋觸控），沒拖動就當作點一下 ----------
  function makeDraggable(card, onDrop, onTap) {
    card.addEventListener("pointerdown", function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      var sx = e.clientX, sy = e.clientY, dragging = false, rect = card.getBoundingClientRect();
      var ox = sx - rect.left, oy = sy - rect.top, overBin = null;
      try { card.setPointerCapture(e.pointerId); } catch (err) {}
      function move(ev) {
        if (!dragging && Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) > 8) {
          dragging = true; card.classList.add("dragging"); card.style.width = rect.width + "px";
        }
        if (!dragging) return;
        card.style.left = (ev.clientX - ox) + "px"; card.style.top = (ev.clientY - oy) + "px";
        var t = document.elementFromPoint(ev.clientX, ev.clientY);
        var b = t && t.closest(".bin");
        if (b !== overBin) { if (overBin) overBin.classList.remove("over"); overBin = b; if (b) b.classList.add("over"); }
      }
      function up(ev) {
        card.removeEventListener("pointermove", move);
        card.removeEventListener("pointerup", up);
        card.removeEventListener("pointercancel", up);
        if (overBin) overBin.classList.remove("over");
        if (dragging) {
          card.classList.remove("dragging"); card.style.left = card.style.top = card.style.width = "";
          if (overBin) onDrop(overBin);
        } else if (ev.type === "pointerup") onTap();
      }
      card.addEventListener("pointermove", move);
      card.addEventListener("pointerup", up);
      card.addEventListener("pointercancel", up);
    });
  }

  var RENDER = {};

  // 分類：把信件放進信箱
  RENDER.sort = function (stage, lv, done) {
    var items = shuffle(lv.items), mistakes = 0, placed = 0, selected = null;
    speakText = lv.prompt;
    stage.innerHTML = '<h3 class="prompt">✉️ ' + esc(lv.prompt) + '</h3><p class="hint">拖曳卡片到信箱，或先點卡片、再點信箱。</p>';
    var pool = el("div", "pool"), bins = el("div", "bins");
    stage.appendChild(pool); stage.appendChild(bins);
    var binEls = {};
    lv.bins.forEach(function (b) {
      var d = el("div", "bin", '<div class="bh"><span class="e">' + b.emoji + '</span>' + esc(b.label) + '</div>');
      d.dataset.id = b.id;
      d.addEventListener("click", function () { if (selected) tryPlace(selected, d); });
      bins.appendChild(d); binEls[b.id] = d;
    });
    items.forEach(function (it) {
      var c = el("div", "card", '<span class="e">' + it.e + '</span><span>' + esc(it.t) + '</span>');
      c._item = it;
      makeDraggable(c, function (bin) { tryPlace(c, bin); }, function () {
        if (selected) selected.classList.remove("sel");
        selected = selected === c ? null : c;
        if (selected) { c.classList.add("sel"); speak(it.t); }
      });
      pool.appendChild(c);
    });
    function tryPlace(c, bin) {
      if (c.parentNode !== pool) return;
      c.classList.remove("sel"); selected = null;
      var binLabel = function (id) { for (var k = 0; k < lv.bins.length; k++) if (lv.bins[k].id === id) return lv.bins[k].label; return id; };
      rep(c._item.bin === bin.dataset.id, "「" + c._item.t + "」要放進哪個信箱？（" + lv.prompt + "）",
        "放到「" + binLabel(bin.dataset.id) + "」", "放到「" + binLabel(c._item.bin) + "」");
      if (c._item.bin === bin.dataset.id) {
        bin.appendChild(c); flash(c, "pop"); placed++;
        setProg(placed / items.length);
        if (placed === items.length) later(function () {
          doneBy(done, mistakes, items.length, lv.tip || "");
        }, 500);
      } else {
        mistakes++; flash(c, "shake"); toast("再想一想喔！");
      }
    }
  };

  // 選擇題
  RENDER.quiz = function (stage, lv, done) {
    var qs = shuffle(lv.qs), i = 0, right = 0;
    function next() {
      if (i >= qs.length) { repTally = { right: right, total: qs.length }; doneBy(done, qs.length - right, qs.length, "（答對 " + right + " / " + qs.length + " 題）"); return; }
      var q = qs[i], ans = q.o[0], opts = shuffle(q.o);
      speakText = q.q + "。" + opts.map(function (o, k) { return "選項" + (k + 1) + "，" + o; }).join("。");
      stage.innerHTML = '<div class="q-num">第 ' + (i + 1) + ' / ' + qs.length + ' 題</div><h3 class="prompt">' + esc(q.q) + '</h3>';
      var box = el("div", "opts"); stage.appendChild(box);
      opts.forEach(function (o) {
        var b = el("button", "opt", esc(o)); b.type = "button";
        b.addEventListener("click", function () {
          if (box.dataset.done) return; box.dataset.done = 1;
          var ok = o === ans;
          if (ok) right++;
          rep(ok, q.q, o, ans);
          b.classList.add(ok ? "right" : "wrong");
          if (!ok) Array.prototype.forEach.call(box.children, function (x) { if (x.textContent === ans) x.classList.add("right"); });
          stage.appendChild(el("div", "why", (ok ? "✅ 答對了！" : "❌ 正確答案是：" + esc(ans) + "。") + " " + esc(q.why || "")));
          var row = el("div", "next-row"), nb = el("button", "btn primary", i + 1 < qs.length ? "下一題 →" : "看結果");
          nb.type = "button"; nb.addEventListener("click", function () { i++; setProg(i / qs.length); next(); });
          row.appendChild(nb); stage.appendChild(row); nb.focus();
        });
        box.appendChild(b);
      });
    }
    next();
  };

  // 排順序：依序點選
  RENDER.order = function (stage, lv, done) {
    var r = 0, mistakes = 0, total = 0;
    lv.rounds.forEach(function (x) { total += x.steps.length; });
    var filledAll = 0;
    function round() {
      if (r >= lv.rounds.length) { doneBy(done, mistakes, total, "全部排對了！"); return; }
      var rd = lv.rounds[r], k = 0, choices = shuffle(rd.steps);
      if (choices.join() === rd.steps.join()) choices.reverse();
      speakText = rd.prompt;
      stage.innerHTML = '<div class="q-num">第 ' + (r + 1) + ' / ' + lv.rounds.length + ' 回</div><h3 class="prompt">📦 ' + esc(rd.prompt) +
        '</h3><p class="hint">從下面依照順序點選，第 1 個先點。</p>';
      var slots = el("div", "slots"), box = el("div", "choices");
      rd.steps.forEach(function () { slots.appendChild(el("div", "slot")); });
      stage.appendChild(slots); stage.appendChild(box);
      choices.forEach(function (s) {
        var c = el("button", "card", esc(s)); c.type = "button";
        c.addEventListener("click", function () {
          rep(s === rd.steps[k], rd.prompt + "（第 " + (k + 1) + " 步）", "第 " + (k + 1) + " 步選「" + s + "」", "第 " + (k + 1) + " 步是「" + rd.steps[k] + "」");
          if (s === rd.steps[k]) {
            var sl = slots.children[k]; sl.textContent = s; sl.classList.add("filled"); flash(sl, "pop");
            c.remove(); k++; filledAll++; setProg(filledAll / total);
            if (k === rd.steps.length) { r++; later(round, 700); }
          } else { mistakes++; flash(c, "shake"); toast("順序不對，再想想！"); }
        });
        box.appendChild(c);
      });
    }
    round();
  };

  // 配對：先點左邊，再點右邊（反過來也可以）
  RENDER.match = function (stage, lv, done) {
    var r = 0, mistakes = 0, total = 0, doneAll = 0;
    lv.rounds.forEach(function (x) { total += x.pairs.length; });
    function round() {
      if (r >= lv.rounds.length) { doneBy(done, mistakes, total, "全部配對成功！"); return; }
      var rd = lv.rounds[r], left = shuffle(rd.pairs), right = shuffle(rd.pairs), sel = null, got = 0;
      speakText = rd.prompt;
      stage.innerHTML = '<div class="q-num">第 ' + (r + 1) + ' / ' + lv.rounds.length + ' 回</div><h3 class="prompt">🔗 ' + esc(rd.prompt) +
        '</h3><p class="hint">點左邊一張，再點右邊對應的一張。</p>';
      var m = el("div", "match"), L = el("div", "col"), R = el("div", "col");
      m.appendChild(L); m.appendChild(R); stage.appendChild(m);
      function mk(col, p, side) {
        var c = el("button", "card", esc(p[side])); c.type = "button"; c._p = p; c._side = side;
        c.addEventListener("click", function () {
          if (c.classList.contains("done")) return;
          if (!sel || sel._side === side) {
            if (sel) sel.classList.remove("sel");
            sel = sel === c ? null : c; if (sel) c.classList.add("sel");
            return;
          }
          var lp = side === 1 ? sel._p : p;
          rep(sel._p === p, rd.prompt + "（「" + lp[0] + "」配哪一個？）",
            "「" + (side === 1 ? sel._p[0] : p[0]) + "」配「" + (side === 1 ? p[1] : sel._p[1]) + "」", "「" + lp[0] + "」配「" + lp[1] + "」");
          if (sel._p === p) {
            sel.classList.remove("sel"); sel.classList.add("done"); c.classList.add("done"); flash(c, "pop");
            sel = null; got++; doneAll++; setProg(doneAll / total);
            if (got === rd.pairs.length) { r++; later(round, 700); }
          } else {
            mistakes++; flash(c, "shake"); toast("配錯了，再試一次！");
            sel.classList.remove("sel"); sel = null;
          }
        });
        col.appendChild(c);
      }
      left.forEach(function (p) { mk(L, p, 0); });
      right.forEach(function (p) { mk(R, p, 1); });
    }
    round();
  };

  // 存錢筒計算
  RENDER.piggy = function (stage, lv, done) {
    var i = 0, right = 0, rs = lv.rounds;
    function opts(ans) {
      var c = [ans + 1, ans - 1, ans + 5, ans - 5, ans * 2, Math.round(ans / 2), ans + 10, ans - 10, ans + 2];
      var out = [ans];
      shuffle(c).forEach(function (v) { if (v > 0 && out.indexOf(v) < 0 && out.length < 4) out.push(v); });
      return shuffle(out);
    }
    function next() {
      if (i >= rs.length) { repTally = { right: right, total: rs.length }; doneBy(done, rs.length - right, rs.length, "（答對 " + right + " / " + rs.length + " 題）" + (lv.tip || "")); return; }
      var q = rs[i];
      speakText = lv.intro + q.q;
      stage.innerHTML = '<div class="q-num">第 ' + (i + 1) + ' / ' + rs.length + ' 題</div><p class="hint">' + esc(lv.intro) + '</p>';
      var wrap = el("div", "piggy-wrap", '<div class="piggy">🐷</div><div class="jar"><div class="bar"><span></span></div><div class="lbl">存錢筒：0 元</div></div>');
      stage.appendChild(wrap);
      stage.appendChild(el("h3", "prompt", esc(q.q)));
      var box = el("div", "num-opts"); stage.appendChild(box);
      opts(q.ans).forEach(function (v) {
        var b = el("button", "opt", v + " " + q.unit); b.type = "button";
        b.addEventListener("click", function () {
          if (box.dataset.done) return; box.dataset.done = 1;
          var ok = v === q.ans; if (ok) right++;
          rep(ok, q.q, v + " " + q.unit, q.ans + " " + q.unit);
          b.classList.add(ok ? "right" : "wrong");
          if (!ok) Array.prototype.forEach.call(box.children, function (x) { if (x.textContent === q.ans + " " + q.unit) x.classList.add("right"); });
          $(".bar span", wrap).style.width = "100%";
          $(".lbl", wrap).textContent = q.goal ? "存滿了！目標 " + q.goal + " 元 🎉" : "每週存 " + q.save + " 元";
          flash($(".piggy", wrap), "pop");
          stage.appendChild(el("div", "why", (ok ? "✅ 答對了！" : "❌ 正確答案是 " + q.ans + " " + q.unit + "。") + " " + esc(q.why)));
          var row = el("div", "next-row"), nb = el("button", "btn primary", i + 1 < rs.length ? "下一題 →" : "看結果");
          nb.type = "button"; nb.addEventListener("click", function () { i++; setProg(i / rs.length); next(); });
          row.appendChild(nb); stage.appendChild(row); nb.focus();
        });
        box.appendChild(b);
      });
    }
    next();
  };

  // 街景搜查
  RENDER.spot = function (stage, lv, done) {
    var r = 0, mistakes = 0, total = lv.items.length, foundAll = 0;
    stage.innerHTML = '<h3 class="prompt">🔍 ' + esc(lv.prompt) + '</h3><p class="spot-ask" id="spotAsk"></p>';
    var street = el("div", "street"); stage.appendChild(street);
    var nodes = lv.items.map(function (it) {
      var b = el("button", "spot", it.e + "<small>" + esc(it.t) + "</small>");
      b.type = "button"; b.style.left = it.x + "%"; b.style.top = it.y + "%"; b._it = it;
      b.addEventListener("click", function () { hit(b); });
      street.appendChild(b); return b;
    });
    function need() { return nodes.filter(function (n) { return n._it.cat === lv.rounds[r].cat && !n.classList.contains("found"); }).length; }
    function ask() {
      var rd = lv.rounds[r];
      speakText = rd.ask;
      $("#spotAsk").textContent = "第 " + (r + 1) + " / " + lv.rounds.length + " 回：" + rd.ask + "（還差 " + need() + " 個）";
    }
    function hit(b) {
      if (b.classList.contains("found")) return;
      var rest = nodes.filter(function (n) { return n._it.cat === lv.rounds[r].cat && !n.classList.contains("found"); })
        .map(function (n) { return n._it.t; }).join("、");
      rep(b._it.cat === lv.rounds[r].cat, lv.rounds[r].ask, "點了「" + b._it.t + "」", b._it.cat === lv.rounds[r].cat ? "「" + b._it.t + "」" : "這一類還有：" + rest);
      if (b._it.cat === lv.rounds[r].cat) {
        b.classList.add("found"); flash(b, "pop"); foundAll++; setProg(foundAll / total);
        if (need() === 0) {
          r++;
          if (r >= lv.rounds.length) { later(function () { doneBy(done, mistakes, total, lv.tip || ""); }, 500); return; }
          toast("找齊了！下一回");
        }
        ask();
      } else { mistakes++; flash(b, "shake"); toast(b._it.t + " 不是這一類喔！"); }
    }
    ask();
  };

  // ---------- 啟動 ----------
  $("#resetBtn").addEventListener("click", function () {
    if (confirm("確定要清除三年級下學期的郵戳進度嗎？（不影響上學期）")) { stars = {}; saveStars(); renderHome(); }
  });
  renderHome();
})();
