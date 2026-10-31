/* 五年級下學期社會・時空新聞台 — 遊戲引擎
   關卡類型：quiz（選擇題）、fact（新聞查證對錯）、order（排順序）、sort（分類歸檔）、match（配對）、pinmap（地圖連線） */
(function () {
  "use strict";
  var DATA = window.G52_DATA;
  var KEY = "social-g5-2-stars";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var KIND = { hand: "現場連線", idea: "新聞解析", boss: "查證快報" };

  // ---------- 進度 ----------
  var stars = {};
  try { stars = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { stars = {}; }
  function saveStars() { try { localStorage.setItem(KEY, JSON.stringify(stars)); } catch (e) {} }
  function getStar(lv) { return stars[lv.id] || 0; }
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
      o.type = ok ? "triangle" : "square";
      o.frequency.value = ok ? 880 : 200;
      g.gain.setValueAtTime(0.08, actx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + (ok ? 0.25 : 0.3));
      o.connect(g); g.connect(actx.destination); o.start(); o.stop(actx.currentTime + 0.3);
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
  function setProg(done, total) { $("#progBar").style.width = (total ? Math.round(done / total * 100) : 0) + "%"; }

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

  // 跑馬燈
  $("#ticker").textContent = DATA.map(function (u) { return u.ch + "｜" + u.name + "：" + u.desc; }).join("　　★　　");

  function renderHome() {
    $("#totalStars").textContent = totalStars();
    $("#maxStars").textContent = "/" + maxStars();
    var box = $("#channels"); box.innerHTML = "";
    DATA.forEach(function (u, ui) {
      var got = 0; u.levels.forEach(function (lv) { got += getStar(lv); });
      var b = el("button", "ch-card");
      b.type = "button";
      b.style.setProperty("--c", u.color);
      b.innerHTML = '<div class="ch-screen"><span class="ch-num">' + u.ch + '</span>' + u.em + '</div>' +
        '<div class="ch-body"><h3>' + esc(u.name) + '</h3><div class="lessons">' +
        u.lessons.map(function (l, i) { return (u.lessons.length > 1 ? (i + 1) + ". " : "") + esc(l); }).join("<br>") +
        '</div><div class="ch-stars">⭐ ' + got + ' / ' + (u.levels.length * 3) + '</div></div>';
      b.addEventListener("click", function () { openUnit(ui); });
      box.appendChild(b);
    });
  }

  function openUnit(ui) {
    curUnit = ui;
    var u = DATA[ui];
    var head = $("#unitHead");
    head.style.setProperty("--c", u.color);
    head.innerHTML = '<span class="ch-num">' + u.ch + ' 頻道</span><h1 class="unit-title" id="unitTitle">' + u.em + " " + esc(u.name) + '</h1>' +
      (u.lessons.length > 1 ? '<ol>' + u.lessons.map(function (l) { return "<li>" + esc(l) + "</li>"; }).join("") + '</ol>' : "") +
      '<p>' + esc(u.desc) + '</p>';
    var list = $("#taskList"); list.innerHTML = "";
    u.levels.forEach(function (lv, li) {
      var b = el("button", "task " + lv.kind);
      b.type = "button";
      b.innerHTML = '<span class="ico">' + lv.icon + '</span><span><span class="tag ' + lv.kind + '">' + KIND[lv.kind] + '</span>' +
        (lv.time ? '<small>⏱ ' + lv.time + ' 秒</small>' : "") + '<b>' + esc(lv.name) + '</b><span class="st">' + starText(getStar(lv)) + '</span></span>';
      b.addEventListener("click", function () { startLevel(ui, li); });
      list.appendChild(b);
    });
    show("unit");
  }

  // ---------- 關卡共用 ----------
  var game = null;
  function startLevel(ui, li) {
    curUnit = ui; curLevel = li;
    var lv = DATA[ui].levels[li];
    stopTimer();
    game = { lv: lv, mistakes: 0, total: 0, over: false };
    $("#playTitle").textContent = DATA[ui].ch + "｜" + lv.icon + " " + lv.name;
    $("#stage").innerHTML = "";
    setProg(0, 1);
    show("play");
    toast(lv.how);
    RUN[lv.type](lv);
    if (lv.time) startTimer(lv.time);
  }
  $("#quitBtn").addEventListener("click", function () { stopTimer(); if (game) game.over = true; openUnit(curUnit); });

  var timerId = null, timeLeft = 0;
  function startTimer(sec) {
    timeLeft = sec;
    var t = $("#timer"); t.hidden = false;
    var tick = function () {
      t.textContent = "⏱ " + timeLeft + " 秒";
      t.classList.toggle("warn", timeLeft <= 10);
      if (timeLeft <= 0) { stopTimer(); timeUp(); return; }
      timeLeft--;
    };
    tick();
    timerId = setInterval(tick, 1000);
  }
  function stopTimer() { clearInterval(timerId); timerId = null; $("#timer").hidden = true; }
  function timeUp() {
    if (!game || game.over) return;
    game.over = true;
    showResult(0, "時間到！", "新聞截稿時間到了，再挑戰一次吧！");
  }

  function finishLevel(extra) {
    if (!game || game.over) return;
    game.over = true;
    stopTimer();
    var n = starsByMistakes(game.mistakes, game.total || 1);
    var lv = game.lv;
    if (n > getStar(lv)) { stars[lv.id] = n; saveStars(); }
    $("#totalStars").textContent = totalStars();
    var msg = game.mistakes === 0 ? "零失誤，完美播報！" : "失誤 " + game.mistakes + " 次。";
    showResult(n, n === 3 ? "頭條新聞！" : "播報完成！", msg + (extra ? "<br>" + extra : ""));
  }

  function showResult(n, title, text) {
    $("#mStars").textContent = n ? starText(n) : "📺";
    $("#mTitle").textContent = title;
    $("#mText").innerHTML = text;
    var u = DATA[curUnit];
    var hasNext = curLevel + 1 < u.levels.length || curUnit + 1 < DATA.length;
    $("#mNext").hidden = !hasNext || n === 0;
    $("#mNext").textContent = curLevel + 1 < u.levels.length ? "下一則 →" : "下一個頻道 →";
    $("#modal").hidden = false;
    if (n) beep(true);
  }
  $("#mAgain").addEventListener("click", function () { $("#modal").hidden = true; startLevel(curUnit, curLevel); });
  $("#mNext").addEventListener("click", function () {
    $("#modal").hidden = true;
    if (curLevel + 1 < DATA[curUnit].levels.length) startLevel(curUnit, curLevel + 1);
    else if (curUnit + 1 < DATA.length) openUnit(curUnit + 1);
  });

  function whyBox(text, bad) { var w = el("div", "why" + (bad ? " bad" : ""), "📝 記者小筆記：" + esc(text)); return w; }
  function nextBtn(label, fn) {
    var r = el("div", "next-row"); var b = el("button", "btn primary", label); b.type = "button";
    b.addEventListener("click", fn); r.appendChild(b); return r;
  }

  // ---------- 拖曳（滑鼠、觸控）＋ 點選 ----------
  // 卡片可以拖到目標，也可以先點卡片再點目標。onDrop(card, target) 回傳 true 表示放對。
  function makeDraggable(card, getTargets, onDrop, selectState) {
    var ghost = null, startX = 0, startY = 0, moved = false, hot = null;
    card.addEventListener("pointerdown", function (e) {
      if (card.dataset.locked) return;
      startX = e.clientX; startY = e.clientY; moved = false; card._dragged = false;
      try { card.setPointerCapture(e.pointerId); } catch (er) {}
    });
    card.addEventListener("pointermove", function (e) {
      if (!card.hasPointerCapture || !card.hasPointerCapture(e.pointerId)) return;
      if (!moved && Math.abs(e.clientX - startX) + Math.abs(e.clientY - startY) < 8) return;
      if (!moved) {
        moved = true;
        ghost = card.cloneNode(true); ghost.classList.add("ghost-card"); document.body.appendChild(ghost);
        card.classList.add("dragging");
      }
      ghost.style.left = e.clientX + "px"; ghost.style.top = e.clientY + "px";
      var t = hit(e.clientX, e.clientY);
      if (hot && hot !== t) hot.classList.remove("hot");
      hot = t; if (hot) hot.classList.add("hot");
    });
    function hit(x, y) {
      var ts = getTargets(), best = null, bd = Infinity;
      for (var i = 0; i < ts.length; i++) {
        var r = ts[i].getBoundingClientRect();
        if (ts[i].classList.contains("pin")) {
          // 地圖釘：離最近的那一個在地圖寬度 13% 以內就算放到（手機手指比較粗）
          var map = ts[i].closest(".pinmap"), reach = map ? Math.max(40, map.getBoundingClientRect().width * 0.13) : 30;
          var d = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2));
          if (d < reach && d < bd) { bd = d; best = ts[i]; }
        } else if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return ts[i];
      }
      return best;
    }
    function end(e) {
      if (!moved) return;
      moved = false;
      if (ghost) ghost.remove(); ghost = null;
      card.classList.remove("dragging");
      if (hot) hot.classList.remove("hot");
      var t = hit(e.clientX, e.clientY); hot = null;
      if (t) onDrop(card, t);
      card._dragged = true;
    }
    card.addEventListener("pointerup", end);
    card.addEventListener("pointercancel", function () {
      if (ghost) ghost.remove(); ghost = null; moved = false; card.classList.remove("dragging");
      if (hot) hot.classList.remove("hot"); hot = null;
    });
    card.addEventListener("click", function () {
      if (card._dragged) { card._dragged = false; return; }
      if (card.dataset.locked) return;
      if (selectState.card) selectState.card.classList.remove("sel");
      if (selectState.card === card) { selectState.card = null; return; }
      selectState.card = card; card.classList.add("sel");
    });
  }

  var RUN = {};

  // ---------- 選擇題 ----------
  RUN.quiz = function (lv) {
    var qs = shuffle(lv.qs), i = 0;
    game.total = qs.length;
    function one() {
      if (game.over) return;
      if (i >= qs.length) return finishLevel();
      var q = qs[i]; setProg(i, qs.length);
      setAsk("第 " + (i + 1) + "/" + qs.length + " 題：" + q.q);
      var st = $("#stage"); st.innerHTML = "";
      var box = el("div", "opts"), tried = false;
      shuffle([q.a].concat(q.o)).forEach(function (o) {
        var b = el("button", "opt", esc(o)); b.type = "button";
        b.addEventListener("click", function () {
          if (o === q.a) {
            b.classList.add("ok"); beep(true);
            box.querySelectorAll(".opt").forEach(function (x) { x.disabled = true; });
            st.appendChild(whyBox(q.why));
            st.appendChild(nextBtn(i + 1 < qs.length ? "下一題 →" : "完成播報 ✔", function () { i++; one(); }));
          } else {
            b.classList.add("no"); b.disabled = true; beep(false); flash(b, "shake");
            if (!tried) { game.mistakes++; tried = true; }
          }
        });
        box.appendChild(b);
      });
      st.appendChild(box);
    }
    one();
  };

  // ---------- 新聞查證（對／錯） ----------
  RUN.fact = function (lv) {
    var qs = shuffle(lv.qs), i = 0;
    game.total = qs.length;
    function one() {
      if (game.over) return;
      if (i >= qs.length) return finishLevel();
      var q = qs[i]; setProg(i, qs.length);
      setAsk("第 " + (i + 1) + "/" + qs.length + " 則：這則新聞正確嗎？" + q.s);
      var st = $("#stage"); st.innerHTML = "";
      st.appendChild(el("div", "headline", esc(q.s)));
      var row = el("div", "tf");
      [[true, "✅ 正確"], [false, "❌ 錯誤"]].forEach(function (p) {
        var b = el("button", "opt", p[1]); b.type = "button";
        b.addEventListener("click", function () {
          row.querySelectorAll(".opt").forEach(function (x) { x.disabled = true; });
          var ok = p[0] === q.a;
          b.classList.add(ok ? "ok" : "no"); beep(ok);
          if (!ok) game.mistakes++;
          st.appendChild(whyBox((ok ? "答對了！" : "這則要再查證：") + q.why, !ok));
          st.appendChild(nextBtn(i + 1 < qs.length ? "下一則 →" : "完成播報 ✔", function () { i++; one(); }));
        });
        row.appendChild(b);
      });
      st.appendChild(row);
    }
    one();
  };

  // ---------- 排順序 ----------
  RUN.order = function (lv) {
    var ri = 0;
    game.total = 0;
    lv.rounds.forEach(function (r) { game.total += r.items.length; });
    function round() {
      if (game.over) return;
      if (ri >= lv.rounds.length) return finishLevel();
      var r = lv.rounds[ri], next = 0;
      setAsk(r.ask);
      var st = $("#stage"); st.innerHTML = "";
      var slots = el("div", "slots");
      r.items.forEach(function (_, k) { var s = el("div", "slot", '<span class="n">' + (k + 1) + '</span><span class="t"></span>'); slots.appendChild(s); });
      var tray = el("div", "tray order-tray");
      shuffle(r.items).forEach(function (t) {
        var c = el("button", "card", esc(t)); c.type = "button";
        c.addEventListener("click", function () {
          if (game.over) return;
          if (t === r.items[next]) {
            beep(true);
            var s = slots.children[next]; s.classList.add("filled"); s.querySelector(".t").textContent = t;
            c.remove(); next++; setProg(next, r.items.length);
            if (next === r.items.length) {
              st.appendChild(whyBox(r.why));
              st.appendChild(nextBtn(ri + 1 < lv.rounds.length ? "下一回合 →" : "完成播報 ✔", function () { ri++; round(); }));
            }
          } else {
            beep(false); game.mistakes++; flash(c, "shake");
            toast("還不是這一則喔！想想看第 " + (next + 1) + " 個發生的是哪件事？");
          }
        });
        tray.appendChild(c);
      });
      st.appendChild(slots); st.appendChild(tray);
      setProg(0, r.items.length);
    }
    round();
  };

  // ---------- 分類歸檔 ----------
  RUN.sort = function (lv) {
    setAsk(lv.how);
    var st = $("#stage"); st.innerHTML = "";
    var tray = el("div", "tray"), bins = el("div", "bins");
    var sel = { card: null }, done = 0;
    game.total = lv.items.length;
    lv.bins.forEach(function (b) {
      var d = el("div", "bin", "<h4>" + b.em + " " + esc(b.t) + "</h4>");
      d.dataset.bin = b.id;
      d.addEventListener("click", function () { if (sel.card) { tryDrop(sel.card, d); } });
      bins.appendChild(d);
    });
    function tryDrop(card, bin) {
      if (game.over) return;
      if (sel.card) { sel.card.classList.remove("sel"); sel.card = null; }
      if (card.dataset.bin === bin.dataset.bin) {
        beep(true); card.remove();
        var c = el("span", "card", esc(card.dataset.t)); bin.appendChild(c);
        done++; setProg(done, lv.items.length);
        if (done === lv.items.length) {
          st.appendChild(whyBox(lv.why));
          st.appendChild(nextBtn("完成播報 ✔", function () { finishLevel(); }));
        }
      } else {
        beep(false); game.mistakes++; flash(card, "shake");
        toast("放錯資料夾囉，再想想看！");
      }
    }
    shuffle(lv.items).forEach(function (it) {
      var c = el("div", "card", esc(it.t));
      c.dataset.bin = it.bin; c.dataset.t = it.t;
      makeDraggable(c, function () { return Array.prototype.slice.call(bins.children); }, tryDrop, sel);
      tray.appendChild(c);
    });
    st.appendChild(tray); st.appendChild(bins);
  };

  // ---------- 配對 ----------
  RUN.match = function (lv) {
    setAsk(lv.how);
    var st = $("#stage"); st.innerHTML = "";
    var wrap = el("div", "match"), L = el("div", "col"), R = el("div", "col");
    var pickL = null, done = 0;
    game.total = lv.pairs.length;
    shuffle(lv.pairs).forEach(function (p) {
      var b = el("button", "m-item", esc(p[0])); b.type = "button"; b.dataset.k = p[0];
      b.addEventListener("click", function () {
        if (b.classList.contains("done") || game.over) return;
        if (pickL) pickL.classList.remove("sel");
        pickL = b; b.classList.add("sel");
      });
      L.appendChild(b);
    });
    shuffle(lv.pairs).forEach(function (p) {
      var b = el("button", "m-item", esc(p[1])); b.type = "button"; b.dataset.k = p[0];
      b.addEventListener("click", function () {
        if (b.classList.contains("done") || game.over) return;
        if (!pickL) { toast("先點左邊的一項，再點右邊！"); return; }
        if (pickL.dataset.k === b.dataset.k) {
          beep(true);
          pickL.classList.remove("sel"); pickL.classList.add("done"); b.classList.add("done");
          pickL = null; done++; setProg(done, lv.pairs.length);
          if (done === lv.pairs.length) {
            st.appendChild(whyBox(lv.why));
            st.appendChild(nextBtn("完成播報 ✔", function () { finishLevel(); }));
          }
        } else {
          beep(false); game.mistakes++; flash(b, "shake");
        }
      });
      R.appendChild(b);
    });
    wrap.appendChild(L); wrap.appendChild(R); st.appendChild(wrap);
  };

  // ---------- 地圖連線 ----------
  RUN.pinmap = function (lv) {
    var ri = 0;
    game.total = 0;
    lv.rounds.forEach(function (r) { game.total += r.items.length; });
    function round() {
      if (game.over) return;
      if (ri >= lv.rounds.length) return finishLevel();
      var r = lv.rounds[ri], done = 0, sel = { card: null };
      setAsk(r.ask);
      var st = $("#stage"); st.innerHTML = "";
      var wrap = el("div", "pinmap-wrap");
      var map = el("div", "pinmap");
      var img = el("img"); img.src = "../assets/taiwan_map.jpg"; img.alt = "臺灣地圖"; img.draggable = false;
      img.onerror = function () { map.classList.add("noimg"); img.remove(); };
      map.appendChild(img);
      map.appendChild(el("div", "compass", "↑北"));
      var pins = [];
      r.pins.forEach(function (p, k) {
        var b = el("button", "pin", "<span>" + (k + 1) + "</span>"); b.type = "button";
        b.dataset.p = p.id; b.style.left = p.x + "%"; b.style.top = p.y + "%";
        b.setAttribute("aria-label", "位置 " + (k + 1));
        b.addEventListener("click", function () { if (sel.card) drop(sel.card, b); });
        map.appendChild(b); pins.push(b);
      });
      var side = el("div");
      var tray = el("div", "tray");
      side.appendChild(tray);
      function drop(card, pin) {
        if (game.over || pin.classList.contains("done")) return;
        if (sel.card) { sel.card.classList.remove("sel"); sel.card = null; }
        if (card.dataset.pin === pin.dataset.p) {
          beep(true);
          pin.classList.add("done");
          var lab = el("div", "pin-label", esc(card.dataset.t));
          lab.style.left = pin.style.left; lab.style.top = pin.style.top;
          map.appendChild(lab);
          card.remove(); done++; setProg(done, r.items.length);
          if (card.dataset.tip) toast(card.dataset.tip);
          if (done === r.items.length) {
            side.appendChild(whyBox(r.why));
            side.appendChild(nextBtn(ri + 1 < lv.rounds.length ? "下一回合 →" : "完成播報 ✔", function () { ri++; round(); }));
          }
        } else {
          beep(false); game.mistakes++; flash(card, "shake");
          toast("這個位置不對喔！看看地圖上的北、中、南。");
        }
      }
      shuffle(r.items).forEach(function (it) {
        var c = el("div", "card", it.em + " " + esc(it.t));
        c.dataset.pin = it.pin; c.dataset.t = it.t; if (it.tip) c.dataset.tip = it.tip;
        makeDraggable(c, function () { return pins.filter(function (p) { return !p.classList.contains("done"); }); }, drop, sel);
        tray.appendChild(c);
      });
      wrap.appendChild(map); wrap.appendChild(side); st.appendChild(wrap);
      setProg(0, r.items.length);
    }
    round();
  };

  $("#resetBtn").addEventListener("click", function () {
    if (confirm("確定要清除五年級下學期的星星紀錄嗎？")) { stars = {}; saveStars(); renderHome(); }
  });

  renderHome();
})();
