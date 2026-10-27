/* 六年級下學期社會・環球永續列車 — 遊戲程式（不需要建置，直接開 index.html） */
(function () {
  'use strict';

  var DATA = window.G62_DATA;
  var FIG = window.G62_FIG;
  var KEY = 'social-g6-2-stars';
  var KIND = {
    hand: '🖐️ 動手做', idea: '💡 觀念題', boss: '🏆 挑戰題', extra: '🎯 進階挑戰'
  };

  var $ = function (id) { return document.getElementById(id); };
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ---------- 進度 ---------- */
  var stars = {};
  try { stars = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { stars = {}; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(stars)); } catch (e) { /* 無法存檔時仍可遊玩 */ } }
  function allLevels() {
    var out = [];
    DATA.forEach(function (u) { u.levels.forEach(function (l) { out.push(l); }); });
    return out;
  }
  function unitStars(u) { return u.levels.reduce(function (s, l) { return s + (stars[l.id] || 0); }, 0); }
  function updateTotal() {
    var all = allLevels();
    $('totalStars').textContent = all.reduce(function (s, l) { return s + (stars[l.id] || 0); }, 0);
    $('maxStars').textContent = '/' + all.length * 3;
  }

  /* ---------- 畫面切換 ---------- */
  var cur = { unit: null, level: null, r: 0, miss: 0 };
  function show(id) {
    ['home', 'unit', 'play'].forEach(function (s) { $(s).hidden = s !== id; });
    window.scrollTo(0, 0);
    if (window.speechSynthesis) speechSynthesis.cancel();
  }
  function toast(msg) {
    var t = $('toast');
    t.textContent = msg; t.hidden = false;
    clearTimeout(toast.tm);
    toast.tm = setTimeout(function () { t.hidden = true; }, 2200);
  }

  /* ---------- 首頁：路線圖 ---------- */
  function renderHome() {
    var box = $('route');
    box.innerHTML = '';
    DATA.forEach(function (u) {
      var got = unitStars(u), max = u.levels.length * 3;
      var b = el('button', 'station');
      b.type = 'button';
      b.style.setProperty('--c', u.color);
      b.innerHTML = '<div class="dot">' + u.em + '</div>' +
        '<div class="no">' + u.no + '・' + u.station + '</div>' +
        '<div class="nm">' + u.name + '</div>' +
        '<div class="st">' + u.levels.length + ' 關（含 🎯 進階挑戰）</div>' +
        '<div class="bar"><i style="width:' + Math.round(got / max * 100) + '%"></i></div>' +
        '<div class="sc">⭐ ' + got + ' / ' + max + '</div>';
      b.addEventListener('click', function () { openUnit(u); });
      box.appendChild(b);
    });
    updateTotal();
    show('home');
  }

  /* ---------- 車站頁 ---------- */
  function openUnit(u) {
    cur.unit = u;
    var head = $('unitHead');
    head.style.setProperty('--c', u.color);
    head.innerHTML = '<h2 class="unit-title" id="unitTitle">' + u.em + ' ' + u.no + '・' + u.name + '</h2>' +
      '<ol class="lessons">' + u.lessons.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>' +
      '<p>' + u.desc + '</p>';
    var list = $('ticketList');
    list.innerHTML = '';
    u.levels.forEach(function (l) {
      var s = stars[l.id] || 0;
      var b = el('button', 'ticket ' + l.kind);
      b.type = 'button';
      b.innerHTML = '<span class="kind">' + KIND[l.kind] + '</span>' +
        '<span class="tn">' + l.icon + ' ' + l.name + '</span>' +
        '<span class="ts">' + '⭐'.repeat(s) + '☆'.repeat(3 - s) + '</span>' +
        '<span class="note">' + l.rounds.length + ' 題</span>';
      b.addEventListener('click', function () { startLevel(l); });
      list.appendChild(b);
    });
    show('unit');
  }

  /* ---------- 關卡 ---------- */
  function startLevel(l) {
    cur.level = l; cur.r = 0; cur.miss = 0;
    $('playTitle').textContent = l.icon + ' ' + l.name;
    show('play');
    renderRound();
  }
  function renderRound() {
    var l = cur.level, rd = l.rounds[cur.r];
    $('progBar').style.width = (cur.r / l.rounds.length * 100) + '%';
    var stage = $('stage');
    stage.innerHTML = '';
    var ask = rd.type === 'quiz' ? rd.q : rd.ask;
    $('ask').textContent = '第 ' + (cur.r + 1) + '／' + l.rounds.length + ' 題　' + ask;
    if (rd.fig) {
      var f = FIG[rd.fig];
      stage.appendChild(el('div', 'fig', typeof f === 'function' ? f() : f));
    }
    ({ quiz: doQuiz, sort: doSort, match: doMatch, order: doOrder })[rd.type](rd, stage);
  }
  function miss(chip, msg) {
    cur.miss++;
    if (chip) { chip.classList.remove('shake'); void chip.offsetWidth; chip.classList.add('shake'); }
    toast(msg || '再想想看！');
  }
  function explain(stage, rd, ok, extraHtml) {
    var box = el('div', 'explain' + (ok ? '' : ' no'));
    box.innerHTML = (ok ? '✅ <b>答對了！</b> ' : '❌ <b>不對喔。</b> ') + (extraHtml || '') +
      '<div>📘 ' + rd.why + '</div>' +
      (rd.trap ? '<div class="trap">⚠️ 小心陷阱：' + rd.trap + '</div>' : '');
    stage.appendChild(box);
    var row = el('div', 'next-row');
    var last = cur.r === cur.level.rounds.length - 1;
    var nb = el('button', 'btn primary', last ? '完成本關 🚉' : '下一題 →');
    nb.type = 'button';
    nb.addEventListener('click', function () {
      if (last) finish(); else { cur.r++; renderRound(); }
    });
    row.appendChild(nb);
    stage.appendChild(row);
    nb.focus({ preventScroll: true });
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* 選擇題：每題只能作答一次，答完看詳解 */
  function doQuiz(rd, stage) {
    var order = rd.opts.map(function (_, i) { return i; });
    if (!rd.keep) order = shuffle(order);
    var wrap = el('div', 'opts');
    var btns = [];
    order.forEach(function (i, n) {
      var b = el('button', 'opt', (rd.keep ? '' : '(' + (n + 1) + ') ') + rd.opts[i]);
      b.type = 'button';
      b.dataset.i = i;
      b.addEventListener('click', function () {
        var ok = i === rd.a;
        btns.forEach(function (x) {
          x.disabled = true;
          if (+x.dataset.i === rd.a) x.classList.add('right');
        });
        if (!ok) { b.classList.add('wrong'); cur.miss++; }
        explain(stage, rd, ok, ok ? '' : '正確答案是「' + rd.opts[rd.a] + '」。');
      });
      btns.push(b);
      wrap.appendChild(b);
    });
    stage.appendChild(wrap);
  }

  /* 拖曳＋點選共用：拖到 [data-drop] 上放開就呼叫 onDrop；只是點一下就呼叫 onTap */
  function dragTap(chip, onTap, onDrop) {
    var sx, sy, ghost = null, hot = null, pid = null;
    chip.addEventListener('pointerdown', function (e) {
      if (chip.classList.contains('done')) return;
      pid = e.pointerId; sx = e.clientX; sy = e.clientY;
      try { chip.setPointerCapture(pid); } catch (err) { /* 舊瀏覽器 */ }
    });
    chip.addEventListener('pointermove', function (e) {
      if (pid !== e.pointerId) return;
      if (!ghost && Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) > 10) {
        ghost = chip.cloneNode(true);
        ghost.classList.add('ghost-chip');
        document.body.appendChild(ghost);
      }
      if (ghost) {
        ghost.style.left = e.clientX + 'px'; ghost.style.top = e.clientY + 'px';
        var t = document.elementFromPoint(e.clientX, e.clientY);
        var d = t && t.closest('[data-drop]');
        if (hot && hot !== d) hot.classList.remove('hot');
        hot = d; if (hot) hot.classList.add('hot');
      }
    });
    function end(e, cancel) {
      if (pid !== e.pointerId) return;
      pid = null;
      if (hot) hot.classList.remove('hot');
      if (ghost) {
        ghost.remove(); ghost = null;
        if (!cancel && hot) onDrop(hot);
      } else if (!cancel) onTap();
      hot = null;
    }
    chip.addEventListener('pointerup', function (e) { end(e, false); });
    chip.addEventListener('pointercancel', function (e) { end(e, true); });
  }

  /* 分類 */
  function doSort(rd, stage) {
    var sel = null, left = rd.items.length;
    var pool = el('div', 'chips');
    var bins = el('div', 'bins');
    var binEls = {};
    rd.bins.forEach(function (bn) {
      var b = el('div', 'bin');
      b.dataset.drop = bn[0];
      b.innerHTML = '<h4>' + bn[1] + '</h4>';
      var c = el('div', 'chips');
      b.appendChild(c);
      b.addEventListener('click', function () { if (sel) place(sel, bn[0]); });
      binEls[bn[0]] = c;
      bins.appendChild(b);
    });
    function place(chip, bin) {
      if (chip.dataset.bin !== bin) { miss(chip, '這張卡不屬於這個車廂，再想想！'); return; }
      chip.classList.remove('sel'); chip.classList.add('done');
      binEls[bin].appendChild(chip);
      sel = null; left--;
      if (left === 0) explain(stage, rd, true);
    }
    shuffle(rd.items).forEach(function (it) {
      var c = el('div', 'chip', it[0]);
      c.dataset.bin = it[1];
      c.setAttribute('role', 'button');
      dragTap(c, function () {
        if (sel) sel.classList.remove('sel');
        sel = sel === c ? null : c;
        if (sel) sel.classList.add('sel');
      }, function (drop) { place(c, drop.dataset.drop); });
      pool.appendChild(c);
    });
    stage.appendChild(el('p', 'note', '把卡片拖到下面的車廂，或先點卡片、再點車廂。'));
    stage.appendChild(pool);
    stage.appendChild(bins);
  }

  /* 配對：先點左邊，再點右邊（也可以把左邊卡片拖到右邊） */
  function doMatch(rd, stage) {
    var sel = null, left = rd.pairs.length;
    var box = el('div', 'match');
    var colL = el('div', 'col'), colR = el('div', 'col');
    function tryPair(l, r) {
      if (l.dataset.k !== r.dataset.k) { miss(r, '配錯了，再試一次！'); return; }
      l.classList.remove('sel'); l.classList.add('done'); r.classList.add('done');
      r.textContent = l.textContent + ' → ' + r.textContent;
      l.style.visibility = 'hidden';
      sel = null; left--;
      if (left === 0) explain(stage, rd, true);
    }
    shuffle(rd.pairs.map(function (p, i) { return [p[0], i]; })).forEach(function (p) {
      var c = el('div', 'chip', p[0]);
      c.dataset.k = p[1];
      c.setAttribute('role', 'button');
      dragTap(c, function () {
        if (sel) sel.classList.remove('sel');
        sel = sel === c ? null : c;
        if (sel) sel.classList.add('sel');
      }, function (drop) { if (!drop.classList.contains('done')) tryPair(c, drop); });
      colL.appendChild(c);
    });
    shuffle(rd.pairs.map(function (p, i) { return [p[1], i]; })).forEach(function (p) {
      var c = el('div', 'chip', p[0]);
      c.dataset.k = p[1];
      c.dataset.drop = 'r';
      c.setAttribute('role', 'button');
      c.addEventListener('click', function () {
        if (c.classList.contains('done')) return;
        if (!sel) { toast('先點左邊的卡片，再點右邊的說明。'); return; }
        tryPair(sel, c);
      });
      colR.appendChild(c);
    });
    box.appendChild(colL); box.appendChild(colR);
    stage.appendChild(el('p', 'note', '先點左邊的卡片，再點右邊對應的說明（也可以直接拖過去）。'));
    stage.appendChild(box);
  }

  /* 排順序：依先後點選（或拖到下一個空格） */
  function doOrder(rd, stage) {
    var next = 0;
    var slots = el('div', 'order-slots');
    var slotEls = rd.items.map(function (_, i) {
      var s = el('div', 'slot', '<b>' + (i + 1) + '</b><span></span>');
      s.dataset.drop = String(i);
      slots.appendChild(s);
      return s;
    });
    var pool = el('div', 'chips');
    function pick(c) {
      if (+c.dataset.i !== next) { miss(c, '順序不對，想想哪一件先發生？'); return; }
      var s = slotEls[next];
      s.classList.add('filled');
      s.querySelector('span').textContent = c.textContent;
      c.remove();
      next++;
      if (next === rd.items.length) explain(stage, rd, true);
    }
    shuffle(rd.items.map(function (t, i) { return [t, i]; })).forEach(function (p) {
      var c = el('div', 'chip', p[0]);
      c.dataset.i = p[1];
      c.setAttribute('role', 'button');
      dragTap(c, function () { pick(c); }, function () { pick(c); });
      pool.appendChild(c);
    });
    stage.appendChild(slots);
    stage.appendChild(el('p', 'note', '從第 1 步開始，依序點選下面的卡片。'));
    stage.appendChild(pool);
  }

  /* ---------- 結算 ---------- */
  function finish() {
    var l = cur.level;
    var s = cur.miss === 0 ? 3 : cur.miss <= 2 ? 2 : 1;
    if (s > (stars[l.id] || 0)) { stars[l.id] = s; save(); }
    updateTotal();
    $('progBar').style.width = '100%';
    $('mStars').textContent = '⭐'.repeat(s) + '☆'.repeat(3 - s);
    $('mTitle').textContent = s === 3 ? '全對抵達！' : s === 2 ? '順利抵達！' : '抵達車站！';
    var all = allLevels(), done = all.every(function (x) { return stars[x.id]; });
    $('mText').textContent = '答錯 ' + cur.miss + ' 次。' +
      (s < 3 ? '全對可以拿到 3 顆星，再挑戰一次吧！' : '太厲害了！') +
      (done ? ' 🎉 所有車站都跑完了，你是合格的世界公民！' : '');
    var idx = cur.unit.levels.indexOf(l);
    var nextL = cur.unit.levels[idx + 1];
    $('mNext').textContent = nextL ? '下一關 →' : '回車站 🚉';
    $('mNext').onclick = function () { $('modal').hidden = true; if (nextL) startLevel(nextL); else openUnit(cur.unit); };
    $('mAgain').onclick = function () { $('modal').hidden = true; startLevel(l); };
    $('modal').hidden = false;
  }

  /* ---------- 朗讀 ---------- */
  $('speakBtn').addEventListener('click', function () {
    if (!window.speechSynthesis) { toast('這個瀏覽器不支援朗讀。'); return; }
    speechSynthesis.cancel();
    var txt = $('ask').textContent;
    var opts = Array.prototype.map.call(document.querySelectorAll('#stage .opt'), function (b) { return b.textContent; });
    if (opts.length) txt += '。選項：' + opts.join('；');
    var u = new SpeechSynthesisUtterance(txt);
    u.lang = 'zh-TW'; u.rate = 0.95;
    speechSynthesis.speak(u);
  });

  /* ---------- 其他按鈕 ---------- */
  document.querySelectorAll('[data-go="home"]').forEach(function (b) { b.addEventListener('click', renderHome); });
  $('quitBtn').addEventListener('click', function () { openUnit(cur.unit); });
  $('resetBtn').addEventListener('click', function () {
    if (confirm('確定要清除六年級下學期的所有星星嗎？')) { stars = {}; save(); renderHome(); }
  });

  renderHome();
})();
