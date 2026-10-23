/* =========================================================
   六年級社會・未來公民挑戰營　遊戲引擎（沿用四年級社會引擎）
   關卡內容都在 data.js（window.UNITS），這裡只負責畫面與判斷。
   關卡種類：sort（拖曳分類）、quiz（選擇題）、order（排順序）、map（方格地圖）
   ========================================================= */
'use strict';

/* ---------- A. 小工具 ---------- */
const $ = id => document.getElementById(id);
const shuffle = arr => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const stripTags = html => String(html).replace(/<[^>]*>/g, '');
function restartAnim(el, cls){ el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
let toastTimer;
function toast(html, ms = 3200){ $('toast').innerHTML = html; $('toast').classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').classList.remove('show'), ms); }
function bigCheck(){ const d = document.createElement('div'); d.className = 'big-check'; d.textContent = '✔'; document.body.appendChild(d); setTimeout(() => d.remove(), 1100); }
function confetti(){
  const colors = ['#ff9800', '#ffcf3f', '#5dbb3f', '#3b82f6', '#e8433a', '#8e3bd1'];
  for (let i = 0; i < 60; i++){
    const c = document.createElement('div'); c.className = 'confetti';
    c.style.left = Math.random() * 100 + 'vw'; c.style.background = colors[i % colors.length];
    c.style.animationDelay = Math.random() * .8 + 's'; document.body.appendChild(c); setTimeout(() => c.remove(), 3400);
  }
}

/* ---------- B. 音效（Web Audio 即時合成） ---------- */
const Sound = (() => {
  let ctx = null, muted = false;
  const ensure = () => {
    if (!ctx){ const AC = window.AudioContext || window.webkitAudioContext; if (AC) ctx = new AC(); }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  };
  function tone(freq, start, dur, type = 'square', vol = .12){
    const c = ensure(); if (!c || muted) return;
    const t = c.currentTime + start, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + .02);
  }
  return {
    unlock: ensure,
    toggle(){ muted = !muted; if (muted && window.speechSynthesis) speechSynthesis.cancel(); return muted; },
    get muted(){ return muted; },
    click(){ tone(880, 0, .05, 'square', .08); },
    ding(){ tone(1046, 0, .2, 'triangle', .2); tone(784, .15, .35, 'triangle', .2); },
    bad(){ tone(200, 0, .25, 'sawtooth', .08); tone(150, .12, .3, 'sawtooth', .08); },
    win(){ [523, 659, 784, 1046, 784, 1046].forEach((f, i) => tone(f, i * .11, .2, 'square', .09)); },
    tick(){ tone(1400, 0, .03, 'square', .04); }
  };
})();

/* ---------- C. 朗讀（Web Speech API） ---------- */
function speak(text){
  if (!window.speechSynthesis || Sound.muted) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(stripTags(text));
  u.lang = 'zh-TW'; u.rate = .95;
  const v = speechSynthesis.getVoices().find(v => /zh[-_]TW/i.test(v.lang));
  if (v) u.voice = v;
  speechSynthesis.speak(u);
}

/* ---------- D. 星星紀錄（localStorage，讀不到也能玩） ---------- */
const Store = {
  key: 'social-g6-stars',
  mem: {},
  get(){ try { return JSON.parse(localStorage.getItem(this.key)) || {}; } catch(e){ return this.mem; } },
  set(id, stars){
    const s = this.get(); s[id] = Math.max(s[id] || 0, stars); this.mem = s;
    try { localStorage.setItem(this.key, JSON.stringify(s)); } catch(e){}
  },
  clear(){ this.mem = {}; try { localStorage.removeItem(this.key); } catch(e){} }
};
const starsByMiss = miss => miss === 0 ? 3 : miss <= 2 ? 2 : 1;
const starHTML = n => '<b>' + '★'.repeat(n) + '</b>' + '☆'.repeat(3 - n);
const KIND = { hand: ['🖐️ 動手做', 'k-hand'], idea: ['💡 觀念題', 'k-idea'], boss: ['🔥 挑戰題', 'k-boss'] };

/* ---------- E. 彈窗 ---------- */
function showModal({icon = '', title = '', html = '', center = false, buttons = [{label: '好！', value: true}]}){
  return new Promise(resolve => {
    $('modal').innerHTML = `<div class="m-icon">${icon}</div><h3>${title}</h3><div class="m-body ${center ? 'center' : ''}">${html}</div>
      <div class="m-btns">${buttons.map((b, i) => `<button class="px-btn ${b.cls || ''}" data-i="${i}">${b.label}</button>`).join('')}</div>`;
    $('modal').querySelectorAll('.m-btns button').forEach(btn => btn.addEventListener('click', () => {
      Sound.click(); $('overlay').classList.remove('open'); resolve(buttons[+btn.dataset.i].value);
    }));
    $('overlay').classList.add('open'); $('modal').scrollTop = 0;
  });
}

/* ---------- F. 畫面切換 ---------- */
let curUnit = null, curLevel = null, timerId = null;
function show(id){
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
  $('homeBtn').hidden = id === 'lobby';
  stopTimer(); if (window.speechSynthesis) speechSynthesis.cancel();
  window.scrollTo(0, 0);
}
function unitStars(u){ const s = Store.get(); return u.levels.reduce((n, l) => n + (s[l.id] || 0), 0); }

function renderLobby(){
  const all = UNITS.reduce((n, u) => n + unitStars(u), 0), max = UNITS.reduce((n, u) => n + u.levels.length * 3, 0);
  $('totalStars').innerHTML = `目前收集 <b>★ ${all}</b> / ${max}` + (all === max ? '　🏆 你是未來好公民！' : '');
  $('portals').innerHTML = UNITS.map((u, i) => {
    const st = unitStars(u), mx = u.levels.length * 3;
    return `<button class="portal px" data-u="${i}">
      <span class="p-icon">${u.icon}</span><span class="p-lv">第${'一二三四五六'[i]}單元</span>
      <span class="p-name">${u.name}</span><span class="p-desc">${u.lessons.join('、')}</span>
      <span class="p-stars"><b>${'★'.repeat(Math.min(st, mx))}</b>${'☆'.repeat(mx - st)}</span></button>`;
  }).join('');
  $('portals').querySelectorAll('.portal').forEach(p => p.addEventListener('click', () => { Sound.click(); openUnit(UNITS[+p.dataset.u]); }));
  $('topTitle').textContent = '🧑‍⚖️ 六年級社會・未來公民挑戰營';
  show('lobby');
}

function openUnit(u){
  curUnit = u;
  const s = Store.get();
  $('unitTitle').textContent = `${u.icon} ${u.name}`;
  $('unitChip').textContent = `★ ${unitStars(u)} / ${u.levels.length * 3}`;
  $('unitDesc').innerHTML = u.desc;
  $('levels').innerHTML = u.levels.map((l, i) => `<button class="lv-card px" data-l="${i}">
      <span class="lv-ico">${l.icon}</span><span class="chip ${KIND[l.kind][1]}">${KIND[l.kind][0]}</span>
      <span class="lv-name">第 ${i + 1} 關：${l.name}</span><span class="lv-how">${l.how}</span>
      <span class="lv-st">${starHTML(s[l.id] || 0)}</span></button>`).join('');
  $('levels').querySelectorAll('.lv-card').forEach(c => c.addEventListener('click', () => { Sound.click(); startLevel(u.levels[+c.dataset.l]); }));
  $('topTitle').textContent = `${u.icon} ${u.name}`;
  show('unit');
}

/* ---------- G. 關卡執行 ---------- */
let game = null;   // { level, miss, over }
function startLevel(level){
  curLevel = level;
  show('play');
  game = { level, miss: 0, over: false };
  $('lvTitle').textContent = `${level.icon} ${level.name}`;
  $('lvKind').textContent = KIND[level.kind][0]; $('lvKind').className = 'chip ' + KIND[level.kind][1];
  $('lvProg').textContent = '';
  $('stage').innerHTML = '';
  if (level.time) startTimer(level.time);
  RENDER[level.type](level);
}
function setAsk(html){ $('lvAsk').innerHTML = html; }
function setProg(i, n){ $('lvProg').textContent = `${i} / ${n}`; }
function miss(tip){
  game.miss++; Sound.bad();
  if (tip) toast('🤔 ' + tip, 4200);
}
function good(){ Sound.ding(); }

function startTimer(sec){
  let left = sec;
  const el = $('lvTimer'); el.hidden = false; el.textContent = `⏱ ${left} 秒`;
  timerId = setInterval(() => {
    left--; el.textContent = `⏱ ${left} 秒`;
    if (left <= 10 && left > 0) Sound.tick();
    if (left <= 0){ stopTimer(); timeUp(); }
  }, 1000);
}
function stopTimer(){ clearInterval(timerId); timerId = null; $('lvTimer').hidden = true; }
async function timeUp(){
  if (!game || game.over) return;
  game.over = true;
  const v = await showModal({icon: '⏰', title: '時間到！', center: true,
    html: '差一點點！挑戰題要在時間內完成喔。<br>先複習一下觀念題，再來挑戰吧！',
    buttons: [{label: '🔁 再挑戰', value: 'again', cls: 'orange'}, {label: '📋 回單元', value: 'unit', cls: 'wood'}]});
  v === 'again' ? startLevel(curLevel) : openUnit(curUnit);
}

async function finishLevel(){
  if (game.over) return;
  game.over = true; stopTimer();
  const stars = starsByMiss(game.miss);
  Store.set(curLevel.id, stars);
  Sound.win(); confetti();
  const idx = curUnit.levels.indexOf(curLevel), next = curUnit.levels[idx + 1];
  const btns = [{label: '🔁 再玩一次', value: 'again', cls: 'wood'}];
  if (next) btns.push({label: '▶ 下一關', value: 'next', cls: 'orange'});
  btns.push({label: '📋 回單元', value: 'unit', cls: 'stone'});
  const v = await showModal({icon: '🎉', title: '過關！', center: true,
    html: `<div class="m-stars">${starHTML(stars)}</div>${game.miss === 0 ? '全對！太厲害了！' : `答錯 ${game.miss} 次，${stars === 1 ? '多練習就能拿到 3 顆星！' : '很棒，再細心一點就是滿分！'}`}
      ${curLevel.recap ? `<div class="explain" style="margin-top:10px;text-align:left">📌 ${curLevel.recap}</div>` : ''}`,
    buttons: btns});
  if (v === 'again') startLevel(curLevel);
  else if (v === 'next') startLevel(next);
  else openUnit(curUnit);
}

/* ---------- H. 拖曳＋點選（滑鼠、觸控都可以） ----------
   按住拖曳到目標放開；或先點卡片、再點目標。 */
function makeDraggable(card, {findTarget, onDrop, onTap}){
  let st = null;
  card.addEventListener('pointerdown', e => {
    if (card.classList.contains('ok') || game.over) return;
    e.preventDefault(); Sound.unlock();
    st = {x: e.clientX, y: e.clientY, id: e.pointerId, moved: false, ghost: null, over: null};
    card.setPointerCapture(e.pointerId);
  });
  card.addEventListener('pointermove', e => {
    if (!st || st.id !== e.pointerId) return;
    if (!st.moved && Math.hypot(e.clientX - st.x, e.clientY - st.y) > 8){
      st.moved = true;
      const r = card.getBoundingClientRect();
      st.ghost = card.cloneNode(true); st.ghost.classList.add('dragging'); st.ghost.classList.remove('sel');
      st.ghost.style.width = r.width + 'px'; st.dx = e.clientX - r.left; st.dy = e.clientY - r.top;
      document.body.appendChild(st.ghost); card.classList.add('placeholder');
    }
    if (st.moved){
      st.ghost.style.left = (e.clientX - st.dx) + 'px'; st.ghost.style.top = (e.clientY - st.dy) + 'px';
      const t = findTarget(document.elementFromPoint(e.clientX, e.clientY));
      if (t !== st.over){ st.over && st.over.classList.remove('over'); t && t.classList.add('over'); st.over = t; }
    }
  });
  const end = e => {
    if (!st || st.id !== e.pointerId) return;
    const s = st; st = null;
    if (s.moved){
      s.ghost.remove(); card.classList.remove('placeholder'); s.over && s.over.classList.remove('over');
      if (s.over) onDrop(card, s.over);
    } else if (e.type === 'pointerup') onTap(card);
  };
  card.addEventListener('pointerup', end);
  card.addEventListener('pointercancel', end);
}

/* ---------- I. 各種關卡畫面 ---------- */
const RENDER = {

  /* 拖曳分類：items 拖進正確的 bins */
  sort(lv){
    setAsk(lv.ask);
    const items = shuffle(lv.items);
    let done = 0, selected = null;
    $('stage').innerHTML = `<div class="panel px"><div class="tray" id="tray"></div></div><div class="bins" id="bins"></div>`;
    $('bins').innerHTML = lv.bins.map(b => `<div class="bin px tapme" data-b="${b.id}"><h3>${b.icon} ${b.name}</h3><div class="bin-items"></div></div>`).join('');
    setProg(0, items.length);
    const tray = $('tray');
    const drop = (card, bin) => {
      const it = items[+card.dataset.i];
      if (selected){ selected.classList.remove('sel'); selected = null; }
      if (it.bin === bin.dataset.b){
        good(); card.classList.add('ok'); bin.querySelector('.bin-items').appendChild(card);
        restartAnim(bin, 'flash-ok'); done++; setProg(done, items.length);
        if (it.tip) toast('✅ ' + it.tip, 2600);
        if (done === items.length) setTimeout(finishLevel, 600);
      } else {
        restartAnim(card, 'shake'); miss(it.hint || '再想想看，它應該放在別的地方喔！');
      }
    };
    items.forEach((it, i) => {
      const c = document.createElement('div'); c.className = 'chipcard'; c.dataset.i = i;
      c.innerHTML = `<span class="em">${it.em}</span>${it.t}`;
      makeDraggable(c, {
        findTarget: el => el && el.closest('.bin'),
        onDrop: drop,
        onTap: card => { Sound.click(); if (selected) selected.classList.remove('sel'); selected = selected === card ? null : card; selected && selected.classList.add('sel'); }
      });
      tray.appendChild(c);
    });
    $('bins').querySelectorAll('.bin').forEach(b => b.addEventListener('click', () => { if (selected && !game.over) drop(selected, b); }));
  },

  /* 選擇題：opts[0] 是正確答案，顯示時會打亂；答錯可以再選 */
  quiz(lv){
    const qs = lv.shuffle === false ? lv.questions : shuffle(lv.questions);
    let qi = 0;
    const step = () => {
      if (game.over) return;
      if (qi >= qs.length) return finishLevel();
      const q = qs[qi]; setProg(qi + 1, qs.length); setAsk(q.q);
      const opts = shuffle(q.opts.map((t, i) => ({t, right: i === 0})));
      $('stage').innerHTML = `<div class="panel px">${q.art ? `<div class="q-art">${q.art}</div>` : ''}
        <div class="opts">${opts.map((o, i) => `<button class="px-btn opt" data-i="${i}">${'ABCD'[i]}. ${o.t}</button>`).join('')}</div>
        <div id="why"></div></div>`;
      $('stage').querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => {
        if (game.over) return;
        const o = opts[+b.dataset.i];
        if (o.right){
          good(); bigCheck(); b.classList.add('right');
          $('stage').querySelectorAll('.opt').forEach(x => x.disabled = true);
          $('why').innerHTML = `<div class="explain" style="margin-top:10px">💡 ${q.why || '答對了！'}</div>
            <div class="next-row" style="margin-top:10px"><button class="px-btn orange" id="nextQ">${qi + 1 < qs.length ? '下一題 ▶' : '完成 🏁'}</button></div>`;
          $('nextQ').addEventListener('click', () => { Sound.click(); qi++; step(); });
        } else {
          b.classList.add('wrong'); b.disabled = true; restartAnim(b, 'shake'); miss(q.hint || '不是這個喔，再想一想！');
        }
      }));
    };
    step();
  },

  /* 排順序：依序點卡片（或拖到空格）排出正確順序，可有多回合 */
  order(lv){
    let ri = 0;
    const round = () => {
      if (game.over) return;
      if (ri >= lv.rounds.length) return finishLevel();
      const r = lv.rounds[ri]; setAsk(r.ask);
      let next = 0;
      $('stage').innerHTML = `<div class="panel px"><div class="slots" id="slots">${r.items.map((_, i) =>
          `<div class="slot" data-s="${i}"><span class="n">${r.labels ? r.labels[i] : i + 1}</span></div>`).join('<span class="arrow">➜</span>')}</div></div>
        <div class="panel px"><div class="tray" id="tray"></div></div><div id="why"></div>`;
      setProg(0, r.items.length);
      const tryPlace = card => {
        const i = +card.dataset.i;
        if (i === next){
          good(); const slot = $('slots').children[next * 2];
          slot.classList.add('filled'); slot.innerHTML = `<span class="em">${r.items[i].em}</span>${r.items[i].t}`;
          card.remove(); next++; setProg(next, r.items.length);
          if (next === r.items.length){
            $('why').innerHTML = `<div class="explain">💡 ${r.why || '順序完全正確！'}</div>
              <div class="next-row" style="margin-top:10px"><button class="px-btn orange" id="nextR">${ri + 1 < lv.rounds.length ? '下一回合 ▶' : '完成 🏁'}</button></div>`;
            $('nextR').addEventListener('click', () => { Sound.click(); ri++; round(); });
          }
        } else {
          restartAnim(card, 'shake'); miss(r.items[i].hint || `「${r.items[i].t}」不是第 ${next + 1} 個喔！`);
        }
      };
      shuffle(r.items.map((it, i) => ({...it, i}))).forEach(it => {
        const c = document.createElement('div'); c.className = 'chipcard'; c.dataset.i = it.i;
        c.innerHTML = `<span class="em">${it.em}</span>${it.t}`;
        makeDraggable(c, {findTarget: el => el && el.closest('.slots'), onDrop: tryPlace, onTap: tryPlace});
        $('tray').appendChild(c);
      });
    };
    round();
  },

  /* 方格地圖：點地圖要素（標題、方位、圖例、比例尺）或點格子 */
  map(lv){
    const m = lv.map, rows = m.grid.length, cols = m.grid[0].length;
    const legendKeys = [...new Set(m.grid.join('').split(''))].filter(ch => m.legend[ch] && m.legend[ch].name);
    $('stage').innerHTML = `<div class="mapwrap">
        <div class="map-title" data-part="title">🗺️ ${m.title}</div>
        <div class="map-side">
          <div class="compass" data-part="compass"><svg viewBox="0 0 100 100" aria-label="方位標">
            <polygon points="50,6 60,50 50,44 40,50" fill="#e8433a"/><polygon points="50,94 60,50 50,56 40,50" fill="#232323"/>
</svg>
            <div style="font-size:13px">↑ 北</div></div>
          <div class="legend" data-part="legend"><b>圖例</b><br>${legendKeys.map(ch => `${m.legend[ch].em} ${m.legend[ch].name}`).join('<br>')}</div>
          <div class="scalebar" data-part="scale"><b>比例尺</b><div class="bar"></div>1 格 = ${m.scale}</div>
        </div>
        <div class="grid" id="grid" style="grid-template-columns:repeat(${cols},1fr)"></div>
      </div>`;
    const grid = $('grid');
    m.grid.forEach((row, r) => [...row].forEach((ch, c) => {
      const L = m.legend[ch] || {};
      const b = document.createElement('button'); b.className = 'cell ' + (L.cls || ''); b.dataset.r = r; b.dataset.c = c;
      b.innerHTML = L.em || ''; b.setAttribute('aria-label', L.name || '空地');
      grid.appendChild(b);
    }));
    let ti = 0;
    const step = () => {
      if (game.over) return;
      if (ti >= lv.tasks.length) return setTimeout(finishLevel, 400);
      const t = lv.tasks[ti]; setAsk(t.q); setProg(ti + 1, lv.tasks.length);
    };
    const judge = (ok, el) => {
      if (game.over || ti >= lv.tasks.length) return;
      const t = lv.tasks[ti];
      if (ok){
        good(); restartAnim(el, 'flash-ok'); if (t.tip) toast('✅ ' + t.tip, 3000);
        ti++; step();
      } else { restartAnim(el, 'shake'); miss(t.hint); }
    };
    $('stage').querySelectorAll('[data-part]').forEach(el => el.addEventListener('click', () => {
      const t = lv.tasks[ti]; if (!t) return;
      judge(t.part === el.dataset.part, el);
    }));
    grid.addEventListener('click', e => {
      const cell = e.target.closest('.cell'); if (!cell) return;
      const t = lv.tasks[ti]; if (!t) return;
      const r = +cell.dataset.r, c = +cell.dataset.c;
      const ok = t.at ? (t.at[0] === r && t.at[1] === c) : t.ch ? m.grid[r][c] === t.ch : false;
      judge(ok, cell);
    });
    step();
  }
};

/* ---------- J. 啟動 ---------- */
$('homeBtn').addEventListener('click', () => { Sound.click(); $('play').classList.contains('active') && curUnit ? openUnit(curUnit) : renderLobby(); });
$('muteBtn').addEventListener('click', () => { const m = Sound.toggle(); $('muteBtn').textContent = m ? '🔇' : '🔊'; });
$('sayBtn').addEventListener('click', () => speak($('lvAsk').innerHTML));
$('resetBtn').addEventListener('click', async () => {
  const ok = await showModal({icon: '🧹', title: '清除星星？', center: true, html: '所有關卡的星星紀錄都會歸零喔！',
    buttons: [{label: '確定清除', value: true, cls: 'red'}, {label: '取消', value: false, cls: 'stone'}]});
  if (ok){ Store.clear(); renderLobby(); }
});
if (window.speechSynthesis) speechSynthesis.getVoices();
renderLobby();
