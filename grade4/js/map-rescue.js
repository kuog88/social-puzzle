/* =========================================================
   🎮 闖關任務：地圖王國・迷航救援隊（原創）
   放在「地圖」單元（南一第 2 單元、翰林第 1 單元、康軒第 1 單元第 1 課），關卡 id u2l5。
   五個任務 × 3 位迷路者 = 15 次救援：
     1 挑對地圖（地圖種類）  2 八方位導航（含方位標轉向、相對方位）
     3 圖例搜救（相近符號）  4 比例尺測距（公尺／公里換算）  5 補齊地圖要素
   題目多數由程式即時產生，答案也由程式計算（見 scratchpad 的檢查腳本）。
   畫面與判斷用 game.js 的共用函式（setAsk、good、miss、report、finishLevel…），在 RENDER.rescue 呼叫 MapRescue.run。
   ========================================================= */
(function () {
  'use strict';
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const mix = arr => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const INK = '#232323';

  /* ---------- 任務 1：挑對地圖 ---------- */
  const TH = {
    '地形圖': '<rect width="80" height="54" fill="#cdeeb5"/><path d="M4 50 Q8 14 40 10 Q74 8 76 50Z" fill="#9bd27a"/><path d="M16 50 Q20 22 42 20 Q64 20 64 50Z" fill="#e8c56a"/><path d="M28 50 Q32 30 44 30 Q54 32 54 50Z" fill="#b8763a"/>',
    '行政區域圖': '<rect width="80" height="54" fill="#fff"/><path d="M2 2H44L38 30L2 26Z" fill="#ffd6a5"/><path d="M44 2H78V24L38 30Z" fill="#cde7ff"/><path d="M2 26L38 30L78 24V52H2Z" fill="#d7f5c8"/><path d="M44 2L38 30L2 26M38 30L78 24" fill="none" stroke="#c0392b" stroke-width="2" stroke-dasharray="4 3"/><g fill="#333"><circle cx="20" cy="15" r="2.5"/><circle cx="60" cy="13" r="2.5"/><circle cx="40" cy="42" r="2.5"/></g>',
    '交通路線圖': '<rect width="80" height="54" fill="#fff"/><path d="M6 27H74" stroke="#ff8f00" stroke-width="5"/><path d="M40 4V50" stroke="#e53935" stroke-width="5"/><g fill="#fff" stroke="#333" stroke-width="2"><circle cx="14" cy="27" r="4"/><circle cx="64" cy="27" r="4"/><circle cx="40" cy="12" r="4"/><circle cx="40" cy="42" r="4"/><circle cx="40" cy="27" r="6"/></g>',
    '觀光導覽圖': '<rect width="80" height="54" fill="#d9f2c4"/><path d="M8 46 Q24 20 40 30 T72 10" fill="none" stroke="#8b5a2b" stroke-width="3" stroke-dasharray="4 3"/><g font-size="14"><text x="4" y="22">ℹ️</text><text x="50" y="48">🚻</text><text x="58" y="22">🎡</text></g>',
    '平面圖': '<rect width="80" height="54" fill="#eee"/><rect x="4" y="4" width="30" height="16" fill="#fff" stroke="#333" stroke-width="1.5"/><rect x="4" y="24" width="14" height="26" fill="#fff" stroke="#333" stroke-width="1.5"/><rect x="40" y="4" width="36" height="46" fill="#a5d6a7" stroke="#333" stroke-width="1.5"/><rect x="22" y="24" width="14" height="26" fill="#fff" stroke="#333" stroke-width="1.5"/><text x="58" y="31" font-size="10" text-anchor="middle" fill="#1b5e20" font-weight="700">操場</text>',
    '電子地圖': '<rect width="80" height="54" fill="#fff"/><rect x="24" y="2" width="32" height="50" rx="5" fill="#333"/><rect x="27" y="7" width="26" height="38" fill="#cfe8ff"/><path d="M27 30H53M40 7V45" stroke="#fff" stroke-width="3"/><text x="40" y="28" font-size="14" text-anchor="middle">📍</text>'
  };
  const thumb = name => `<svg viewBox="0 0 80 54" class="mr-thumb" aria-hidden="true">${TH[name]}</svg>`;
  const SCN = [
    { need: '山區有登山客迷路了！救援隊要先看出哪裡是高山、哪裡是平原，才能規劃上山的路線。', ans: '地形圖',
      why: '地形圖用不同的顏色表示地勢高低，看得出山地、丘陵、平原在哪裡。', hint: '要看「地勢高低」，想想哪一種地圖用顏色表示高山和平原？' },
    { need: '迷路的人說他在「河濱區」，救援隊要先找出河濱區和隔壁山腳區的界線在哪裡。', ans: '行政區域圖',
      why: '行政區域圖畫出縣市、鄉鎮市區的範圍和界線。', trap: '地形圖也塗了好幾種顏色，但它的顏色表示地勢高低，不是區和區的界線。',
      hint: '要找「區和區的界線」，想想哪一種地圖會用虛線畫出各區的範圍。' },
    { need: '有旅客在捷運站搭錯車，救援隊要告訴他在哪一站轉乘，才能回到救援中心。', ans: '交通路線圖',
      why: '交通路線圖（像捷運路線圖）畫出每條路線和車站，找轉乘站最方便。', hint: '要找「哪一站轉車」，地圖上要畫出路線和車站。' },
    { need: '遊客在遊樂區和家人走散了，救援隊要找出遊客中心、廁所和步道在哪裡。', ans: '觀光導覽圖',
      why: '觀光導覽圖會標出景點、遊客中心、廁所和步道，是專門給遊客看的地圖。', hint: '這是給「遊客」看的地圖，上面有遊客中心和廁所。' },
    { need: '一年級小朋友在校園裡迷路，救援隊要找出健康中心在哪一棟大樓。', ans: '平面圖',
      why: '平面圖是從正上方往下看畫出來的圖，校園平面圖看得出每棟大樓、教室和操場的位置。', hint: '要看「校園裡」大樓的位置，想想從正上方往下看畫成的圖。' },
    { need: '救援隊要在路上隨時看到自己現在的位置，還要知道哪一條路最快到達。', ans: '電子地圖',
      why: '電子地圖可以定位、放大縮小，還能規劃路線。', trap: '紙本的交通路線圖不會顯示「你現在在哪裡」，能定位、隨時更新的是電子地圖。',
      hint: '要「隨時看到自己的位置」，紙本地圖做不到喔。' }
  ];
  function genType() {
    return mix(SCN).slice(0, 3).map(s => {
      const opts = mix([s.ans, ...mix(SCN.filter(x => x !== s)).slice(0, 3).map(x => x.ans)]);
      return { mode: 'cards', ask: `📻 求救訊號：${s.need}<br><b>要帶哪一種地圖出發？</b>`, rq: `求救訊號：${s.need}要帶哪一種地圖？`,
        opts: opts.map(t => ({ t, html: thumb(t) + `<span>${t}</span>` })), answer: s.ans, why: s.why, trap: s.trap, hint: s.hint };
    });
  }

  /* ---------- 任務 2：八方位導航 ---------- */
  const ROSE = [['西北', '北', '東北'], ['西', '', '東'], ['西南', '南', '東南']];
  const SCREEN = { 0: '上方', 90: '右邊', 180: '下方', 270: '左邊' };
  // 畫面向量 (dx 向右為正, dy 向下為正)，方位標北方箭頭順時針轉 rot 度 → 方位名稱
  function dirOf(dx, dy, rot) {
    const r = rot * Math.PI / 180;
    const n = Math.round(dx * Math.sin(r) - dy * Math.cos(r));   // 對「北」向量 (sin r, -cos r) 的內積
    const e = Math.round(dx * Math.cos(r) + dy * Math.sin(r));   // 對「東」向量 (cos r, sin r) 的內積
    const ns = n > 0 ? '北' : n < 0 ? '南' : '', ew = e > 0 ? '東' : e < 0 ? '西' : '';
    return (ew + ns) || '?';
  }
  function compass(cx, cy, rot, size) {
    const r = rot * Math.PI / 180, L = size + 12;
    const tx = cx + L * Math.sin(r), ty = cy - L * Math.cos(r);
    return `<g><circle cx="${cx}" cy="${cy}" r="${size + 22}" fill="#fff" stroke="${INK}" stroke-width="3"/>
      <g transform="rotate(${rot} ${cx} ${cy})"><polygon points="${cx},${cy - size} ${cx + 9},${cy} ${cx},${cy - 5} ${cx - 9},${cy}" fill="#e8433a"/>
      <polygon points="${cx},${cy + size} ${cx + 9},${cy} ${cx},${cy + 5} ${cx - 9},${cy}" fill="${INK}"/></g>
      <text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-size="15" font-weight="900" fill="#e8433a">北</text></g>`;
  }
  function dirArt(dx, dy, rot) {
    const C = 56, O = 10, cell = (c, r) => [O + c * C + C / 2, O + r * C + C / 2];
    let s = `<svg viewBox="0 0 400 300" class="mr-svg" role="img" aria-label="救援方格地圖">
      <rect x="${O - 4}" y="${O - 4}" width="${C * 5 + 8}" height="${C * 5 + 8}" rx="6" fill="#5e3a19"/>`;
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) s += `<rect x="${O + c * C + 2}" y="${O + r * C + 2}" width="${C - 4}" height="${C - 4}" rx="4" fill="${(r + c) % 2 ? '#9be07a' : '#a9e88a'}"/>`;
    const used = new Set(['2,2', `${2 + dx},${2 + dy}`]), deco = ['🌳', '🏠', '🌲', '🌳', '🏡'];
    let k = 0;
    while (k < 5) { const c = Math.floor(Math.random() * 5), r = Math.floor(Math.random() * 5); if (used.has(c + ',' + r)) continue; used.add(c + ',' + r); const [x, y] = cell(c, r); s += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="24" opacity=".75">${deco[k++]}</text>`; }
    const [ax, ay] = cell(2, 2), [bx, by] = cell(2 + dx, 2 + dy);
    s += `<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" stroke="#e8433a" stroke-width="3" stroke-dasharray="6 5"/>
      <circle cx="${ax}" cy="${ay}" r="22" fill="#fff8e6" stroke="${INK}" stroke-width="2"/><text x="${ax}" y="${ay}" text-anchor="middle" dominant-baseline="central" font-size="26">🚁</text>
      <circle cx="${bx}" cy="${by}" r="22" fill="#ffe3a8" stroke="#e8433a" stroke-width="3"/><text x="${bx}" y="${by}" text-anchor="middle" dominant-baseline="central" font-size="26">🧒</text>
      ${compass(347, 72, rot, 30)}
      <text x="347" y="152" text-anchor="middle" font-size="13" font-weight="700">方位標</text>
      <rect x="302" y="172" width="90" height="92" rx="6" fill="#fff" stroke="${INK}" stroke-width="2"/>
      <g text-anchor="middle" font-weight="700">${at(330, 196, 20, INK, '🚁')}<text x="368" y="196" dominant-baseline="central" font-size="12">救援隊</text>
      ${at(330, 238, 20, INK, '🧒')}<text x="368" y="238" dominant-baseline="central" font-size="12">迷路者</text></g></svg>`;
    return s;
  }
  function genDir() {
    const pos = () => { for (;;) { const dx = Math.floor(Math.random() * 5) - 2, dy = Math.floor(Math.random() * 5) - 2; if ((dx || dy) && (dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy))) return [dx, dy]; } };
    return [{ rot: 0, rev: false }, { rot: 0, rev: true }, { rot: pick([90, 180, 270]), rev: false }].map(o => {
      const [dx, dy] = pos(), fwd = dirOf(dx, dy, o.rot) + '方', ans = o.rev ? dirOf(-dx, -dy, o.rot) + '方' : fwd;
      const t = { mode: 'rose', art: dirArt(dx, dy, o.rot), answer: ans };
      if (o.rev) {
        t.ask = '迷路者 🧒 用無線電問：「救援隊 🚁 在<b>我</b>的哪一個方位？」';
        t.why = `迷路者在救援隊的${fwd}；反過來看，救援隊就在迷路者的<b>${ans}</b>。`;
        t.trap = '方位是相對的！問的是「救援隊在迷路者的哪一方」，要從迷路者的位置看過去。';
        t.hint = '這次要站在迷路者 🧒 的位置，看救援隊 🚁 在哪一邊。';
      } else if (o.rot) {
        t.ask = '這張地圖的方位標轉了方向！迷路者 🧒 在救援隊 🚁 的哪一個方位？';
        t.why = `方位標的北方箭頭指向地圖的${SCREEN[o.rot]}，所以地圖的${SCREEN[o.rot]}才是北方。這樣看，迷路者在救援隊的<b>${ans}</b>。`;
        t.trap = '有方位標時要看方位標，不能直接用「上北下南、左西右東」。';
        t.hint = '先找方位標上寫「北」的紅色箭頭，箭頭指的那一邊才是北方喔！';
      } else {
        t.ask = '迷路者 🧒 在救援隊 🚁 的哪一個方位？選出直升機要飛的方向！';
        t.why = `方位標的箭頭朝上，地圖上方是北方、右方是東方。迷路者在救援隊的<b>${ans}</b>。`;
        t.hint = '上北、下南、左西、右東；斜斜的方向要把兩個方位合起來，例如「東北」。';
      }
      t.rq = t.ask.replace(/<[^>]*>/g, '') + `（地圖方位標的北方指向${SCREEN[o.rot]}）`;
      return t;
    });
  }

  /* ---------- 任務 3：圖例搜救 ---------- */
  const at = (x, y, fs, fill, ch) => `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="${fs}" font-weight="900" fill="${fill}">${ch}</text>`;
  const SYM = {
    temple: (x, y) => at(x, y, 22, '#c62828', '卍'),
    hospital: (x, y) => at(x, y, 24, '#c62828', '✚'),
    school: (x, y) => at(x, y, 22, INK, '文'),
    peak: (x, y) => `<polygon points="${x},${y - 11} ${x + 12},${y + 9} ${x - 12},${y + 9}" fill="#8b5a2b"/>`,
    camp: (x, y) => `<polygon points="${x},${y - 11} ${x + 12},${y + 9} ${x - 12},${y + 9}" fill="#2e7d32"/><polygon points="${x},${y - 1} ${x + 4},${y + 9} ${x - 4},${y + 9}" fill="#fff"/>`,
    station: (x, y) => `<rect x="${x - 8}" y="${y - 8}" width="16" height="16" fill="${INK}"/><rect x="${x - 3}" y="${y - 3}" width="6" height="6" fill="#fff"/>`
  };
  const LINE = {
    river: (d, w) => `<path d="${d}" fill="none" stroke="#3b8fe0" stroke-width="${w || 6}" stroke-linecap="round"/>`,
    road: (d, w) => `<path d="${d}" fill="none" stroke="#9e9e9e" stroke-width="${w || 8}"/>`,
    rail: (d, w) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w || 7}"/><path d="${d}" fill="none" stroke="#fff" stroke-width="${(w || 7) - 4}" stroke-dasharray="9 9"/>`
  };
  const NAME = { temple: '廟宇', hospital: '醫院', school: '學校', peak: '山峰', camp: '露營區', station: '火車站', river: '河流', road: '道路', rail: '鐵路' };
  const POS = { peak: [96, 70], camp: [186, 66], temple: [116, 132], hospital: [226, 128], school: [206, 214], station: [160, 262] };
  const PATH = { river: 'M34 40 C70 90 14 130 46 180 S30 250 52 292', road: 'M70 170 H272', rail: 'M70 262 H272' };
  const LEG_ORDER = ['temple', 'hospital', 'school', 'peak', 'camp', 'station', 'river', 'road', 'rail'];
  function legendArt() {
    let s = `<svg viewBox="0 0 400 300" class="mr-svg" role="img" aria-label="救援區域圖">
      <rect x="2" y="2" width="276" height="296" rx="6" fill="#f3f8e8" stroke="${INK}" stroke-width="3"/>`;
    for (const k of ['river', 'road', 'rail']) s += `<g class="mr-hit" data-k="${k}">${LINE[k](PATH[k])}<path d="${PATH[k]}" fill="none" stroke="transparent" stroke-width="22"/></g>`;
    for (const k of Object.keys(POS)) { const [x, y] = POS[k]; s += `<g class="mr-hit" data-k="${k}"><circle cx="${x}" cy="${y}" r="20" fill="transparent"/>${SYM[k](x, y)}</g>`; }
    s += `<rect x="284" y="2" width="114" height="296" rx="6" fill="#fff" stroke="${INK}" stroke-width="3"/>
      <text x="341" y="24" text-anchor="middle" font-size="15" font-weight="900">圖例</text>`;
    LEG_ORDER.forEach((k, i) => {
      const y = 50 + i * 28;
      s += SYM[k] ? SYM[k](304, y) : LINE[k](`M292 ${y} H318`, k === 'rail' ? 7 : 6);
      s += `<text x="326" y="${y}" dominant-baseline="central" font-size="14" font-weight="700">${NAME[k]}</text>`;
    });
    return s + '</svg>';
  }
  const LEG_TASK = {
    temple: { say: '我在一座廟的旁邊，聽得到拜拜的鐘聲！', trap: '卍（廟宇）和 ✚（醫院）都是紅色、長得有點像，要對照圖例看清楚。', hint: '對照圖例：廟宇的符號是「卍」，不是「✚」喔！' },
    hospital: { say: '我的腳受傷了，現在走到醫院門口！', trap: '✚（醫院）和 卍（廟宇）都是紅色，看清楚筆畫再點。', hint: '對照圖例：醫院的符號是「✚」，「卍」是廟宇。' },
    peak: { say: '我爬到最高的山頂上了，四周都是雲！', trap: '咖啡色實心三角形是山峰；綠色、中間有白色門的三角形是露營區的帳篷。', hint: '對照圖例：山峰是「咖啡色」的三角形。' },
    camp: { say: '我躲在露營區的帳篷裡等救援！', trap: '綠色帳篷（露營區）和咖啡色三角形（山峰）很像，帳篷中間有白色的門。', hint: '對照圖例：露營區是「綠色」、中間有白色門的三角形。' },
    rail: { say: '我沿著鐵軌一直走，看到黑白相間的線！', trap: '黑白相間的線是鐵路，灰色的粗線是道路，藍色彎彎的線是河流。', hint: '對照圖例：鐵路是「黑白相間」的線，不是灰色那一條。' },
    road: { say: '我站在一條灰色的大馬路上！', trap: '灰色的粗線是道路；黑白相間的那一條是鐵路，不能走喔。', hint: '對照圖例：道路是「灰色」的粗線。' },
    river: { say: '我在彎彎曲曲的河邊，聽得到水聲！', trap: '藍色彎彎曲曲的線是河流；道路、鐵路都是直直的線。', hint: '對照圖例：河流是「藍色」彎曲的線。' },
    school: { say: '我躲進學校的教室裡避雨了！', hint: '對照圖例：學校的符號是「文」。' },
    station: { say: '我在火車站的月臺上等救援！', trap: '火車站是畫在鐵路上的黑色方塊。', hint: '對照圖例：火車站是黑色的方塊，在鐵路上面。' }
  };
  function genLegend() {
    return [pick(['temple', 'hospital']), pick(['peak', 'camp']), pick(['rail', 'road', 'river', 'school', 'station'])].map(k => {
      const L = LEG_TASK[k];
      return { mode: 'tap', ask: `📻「${L.say}」<br>看圖例，點出地圖上的<b>「${NAME[k]}」</b>！`, rq: `「${L.say}」看圖例，點出地圖上的「${NAME[k]}」`,
        art: legendArt(), answer: k, why: `圖例告訴我們每個符號的意思，找到「${NAME[k]}」，迷路者救到了！`, trap: L.trap, hint: L.hint };
    });
  }

  /* ---------- 任務 4：比例尺測距 ---------- */
  const fm = (m, km) => km ? `${m / 1000} 公里` : `${m} 公尺`;
  const useKm = m => m >= 1000 && m % 1000 === 0;
  // 由候選值（公尺）組出 4 個不重複的選項；第一個是正解
  function distOpts(right, cands) {
    const out = [{ t: fm(right, useKm(right)), v: right }];
    for (const c of cands) {
      if (out.length >= 4) break;
      const o = typeof c === 'object' ? c : { t: fm(c, useKm(c)), v: c };
      if (!(o.v > 0) || !Number.isInteger(o.v) || out.some(x => x.v === o.v || x.t === o.t)) continue;
      out.push(o);
    }
    return out;
  }
  function rulerArt(d, S) {
    const P = 40, x0 = 60, x1 = x0 + d * P;
    let s = `<svg viewBox="0 0 400 190" class="mr-svg" role="img" aria-label="用尺量地圖上的距離">
      <rect x="2" y="2" width="396" height="186" rx="6" fill="#f3f8e8" stroke="${INK}" stroke-width="3"/>
      <line x1="${x0}" y1="62" x2="${x1}" y2="62" stroke="#e8433a" stroke-width="3" stroke-dasharray="6 5"/>
      ${at(x0, 40, 26, INK, '🚁')}${at(x1, 40, 26, INK, '🧒')}
      <rect x="${x0 - 10}" y="76" width="${d * P + 20}" height="34" fill="#ffe082" stroke="${INK}" stroke-width="2"/>`;
    for (let i = 0; i <= d; i++) s += `<line x1="${x0 + i * P}" y1="76" x2="${x0 + i * P}" y2="92" stroke="${INK}" stroke-width="2"/>${at(x0 + i * P, 101, 12, INK, i)}`;
    return s + `<text x="${x0 + d * P + 14}" y="98" font-size="12" font-weight="700">公分</text>
      <rect x="40" y="128" width="320" height="44" rx="6" fill="#fff" stroke="${INK}" stroke-width="2"/>
      <text x="200" y="151" text-anchor="middle" dominant-baseline="central" font-size="17" font-weight="900">比例尺：1 公分代表 ${S} 公尺</text></svg>`;
  }
  function barArt(k, seg) {
    const P = 50, x0 = 60, km = seg >= 1000, lab = v => km ? v / 1000 : v;
    let s = `<svg viewBox="0 0 400 200" class="mr-svg" role="img" aria-label="用線段比例尺量距離">
      <rect x="2" y="2" width="396" height="196" rx="6" fill="#f3f8e8" stroke="${INK}" stroke-width="3"/>
      <line x1="${x0}" y1="66" x2="${x0 + k * P}" y2="66" stroke="#9e9e9e" stroke-width="8"/>`;
    for (let i = 0; i <= k; i++) s += `<line x1="${x0 + i * P}" y1="56" x2="${x0 + i * P}" y2="76" stroke="${INK}" stroke-width="2"/>`;
    s += `${at(x0, 34, 26, INK, '🚁')}${at(x0 + k * P, 34, 26, INK, '🧒')}
      <text x="200" y="100" text-anchor="middle" font-size="13" font-weight="700" fill="#555">道路上每一小段，都和比例尺的一段一樣長</text>
      <rect x="40" y="114" width="320" height="76" rx="6" fill="#fff" stroke="${INK}" stroke-width="2"/>
      <text x="56" y="136" font-size="14" font-weight="900">比例尺</text>
      <rect x="${x0 + 40}" y="146" width="${P}" height="10" fill="${INK}"/><rect x="${x0 + 40 + P}" y="146" width="${P}" height="10" fill="#fff" stroke="${INK}" stroke-width="2"/>`;
    [0, 1, 2].forEach(i => { s += at(x0 + 40 + i * P, 172, 13, INK, lab(i * seg)); });
    return s + `<text x="${x0 + 40 + 2 * P + 16}" y="172" dominant-baseline="central" font-size="13" font-weight="700">${km ? '公里' : '公尺'}</text></svg>`;
  }
  function genScale() {
    // (1) 文字比例尺：地圖上 d 公分 → 實際距離
    const [S, d] = pick([[100, 3], [100, 6], [200, 4], [200, 5], [250, 4], [500, 2], [500, 3], [500, 4], [500, 6], [250, 8]]);
    const C = S * d, km1 = useKm(C);
    const t1 = { mode: 'opts', art: rulerArt(d, S), answer: fm(C, km1),
      ask: `救援隊和迷路者在地圖上量起來是 <b>${d} 公分</b>，比例尺是「1 公分代表 ${S} 公尺」。實際距離是多少？`,
      opts: distOpts(C, [km1 ? { t: `${C} 公里`, v: C * 1000 } : null, C * 10, S + d, S * (d + 1), C / 10, S].filter(Boolean)),
      why: `${S} × ${d} = ${C}，實際距離是 ${C} 公尺${km1 ? `；1000 公尺 = 1 公里，所以是 <b>${C / 1000} 公里</b>` : '，也就是 <b>' + C + ' 公尺</b>'}。`,
      trap: km1 ? `${C} 公尺換成公里要除以 1000，是 ${C / 1000} 公里，不是 ${C} 公里！` : '比例尺要用「乘」的：地圖上幾公分，就是幾個 ' + S + ' 公尺。',
      hint: `1 公分代表 ${S} 公尺，${d} 公分就是 ${d} 個 ${S} 公尺。${km1 ? '算完記得看看選項的單位！' : ''}` };
    // (2) 線段比例尺：數一數有幾段
    const seg = pick([250, 500, 1000]), k = pick([3, 4, 5]), T = seg * k;
    const t2 = { mode: 'opts', art: barArt(k, seg), answer: fm(T, useKm(T)),
      ask: `用下面的<b>線段比例尺</b>量一量：救援隊 🚁 沿著道路到迷路者 🧒，實際大約多遠？`,
      opts: distOpts(T, [seg * 2, seg * (k + 1), T * 10, seg * (k - 1), k * 100]),
      why: `比例尺的一小段代表 ${fm(seg, seg >= 1000)}，道路有 ${k} 段，${seg} × ${k} = ${T} 公尺${useKm(T) ? `，也就是 <b>${T / 1000} 公里</b>` : ''}。`,
      trap: `比例尺最右邊寫的「${seg >= 1000 ? 2 : seg * 2}」只是比例尺本身的長度，不是答案；要數道路有幾段。`,
      hint: `先數道路被切成幾小段，再乘上比例尺一段代表的距離。` };
    // (3) 反過來：實際距離 → 地圖上幾公分
    const [S3, k3] = pick([[250, 4], [500, 2], [500, 6], [200, 5], [250, 8], [100, 7], [200, 3], [500, 4]]), D = S3 * k3, km3 = useKm(D);
    const cm = [k3, k3 * 10, k3 + 1, k3 + 2, D / 100].filter((v, i, a) => v > 0 && Number.isInteger(v) && a.indexOf(v) === i).slice(0, 4);
    const t3 = { mode: 'opts', answer: `${k3} 公分`,
      art: `<svg viewBox="0 0 400 120" class="mr-svg" role="img" aria-label="無線電訊息"><rect x="2" y="2" width="396" height="116" rx="6" fill="#fff8e6" stroke="${INK}" stroke-width="3"/>
        ${at(40, 60, 34, INK, '📻')}<text x="76" y="44" font-size="17" font-weight="900">迷路者在救援中心 ${fm(D, km3)}外</text>
        <text x="76" y="80" font-size="16" font-weight="700">比例尺：1 公分代表 ${S3} 公尺</text></svg>`,
      ask: `迷路者在救援中心 <b>${fm(D, km3)}</b> 外，比例尺是「1 公分代表 ${S3} 公尺」。在地圖上要量<b>幾公分</b>？`,
      opts: cm.map(v => ({ t: `${v} 公分`, v })),
      why: `${km3 ? `${D / 1000} 公里 = ${D} 公尺，` : ''}${D} ÷ ${S3} = ${k3}，地圖上要量 <b>${k3} 公分</b>。`,
      trap: km3 ? '公里要先換成公尺（1 公里 = 1000 公尺），再看裡面有幾個 ' + S3 + ' 公尺。' : '這題是反過來問：實際距離裡有幾個 ' + S3 + ' 公尺，就是幾公分。',
      hint: `想一想：幾個 ${S3} 公尺合起來是 ${D} 公尺？${km3 ? '（1 公里 = 1000 公尺）' : ''}` };
    return [t1, t2, t3].map(t => { t.rq = t.ask.replace(/<[^>]*>/g, ''); return t; });
  }

  /* ---------- 任務 5：補齊地圖要素 ---------- */
  const PART = { title: '圖名', compass: '方位標', legend: '圖例', scale: '比例尺' };
  const PART_WHY = {
    title: '少了<b>圖名</b>，就不知道這張地圖畫的是哪裡、是什麼主題。',
    compass: '少了<b>方位標</b>，就不能確定方向；沒有方位標時一般當作上北下南，但畫出方位標最清楚。',
    legend: '少了<b>圖例</b>，就看不懂卍、▲、✚ 這些符號代表什麼。',
    scale: '少了<b>比例尺</b>，就算不出地圖上的距離實際有多遠。'
  };
  const PART_TRAP = {
    title: '地圖裡的「救援中心」只是地點的名字，不是圖名；圖名要說明整張地圖畫什麼。',
    compass: '「往海邊 ➜」是路上的指示牌，不是方位標；方位標要標出「北」。',
    legend: '地圖上有符號，不代表有圖例；圖例要把每個符號的意思寫出來。',
    scale: '黑白相間的線是「鐵路」，不是比例尺喔！比例尺會寫出代表多少公尺。'
  };
  function missArt(miss) {
    let s = `<svg viewBox="0 0 400 300" class="mr-svg" role="img" aria-label="缺了要素的地圖">
      <rect x="2" y="2" width="396" height="296" rx="6" fill="#fffdf5" stroke="${INK}" stroke-width="3"/>`;
    if (miss !== 'title') s += `<text x="200" y="28" text-anchor="middle" font-size="19" font-weight="900">山谷救援區域圖</text>`;
    s += `<rect x="14" y="40" width="372" height="248" rx="4" fill="#f3f8e8" stroke="#8a7a5a" stroke-width="2"/>
      ${LINE.river('M40 44 C70 100 24 150 52 200 S40 260 60 286')}
      ${LINE.road('M70 150 H250')}${LINE.rail('M70 250 H250')}
      <text x="150" y="140" font-size="13" font-weight="700" fill="#555">往海邊 ➜</text>
      ${SYM.temple(110, 90)}${SYM.peak(190, 80)}${SYM.hospital(140, 205)}
      ${at(222, 200, 22, INK, '🚩')}<text x="222" y="228" text-anchor="middle" font-size="12" font-weight="700">救援中心</text>`;
    if (miss !== 'compass') s += compass(338, 84, 0, 20);
    if (miss !== 'legend') {
      s += `<rect x="276" y="126" width="104" height="112" rx="4" fill="#fff" stroke="${INK}" stroke-width="2"/>
        <text x="328" y="143" text-anchor="middle" font-size="13" font-weight="900">圖例</text>`;
      [['temple', '廟宇'], ['peak', '山峰'], ['hospital', '醫院']].forEach(([k, n], i) => {
        const y = 162 + i * 20; s += `<g transform="translate(296 ${y}) scale(.7) translate(-296 ${-y})">${SYM[k](296, y)}</g><text x="312" y="${y}" dominant-baseline="central" font-size="12" font-weight="700">${n}</text>`;
      });
      s += `${LINE.rail('M285 222 H307', 6)}<text x="312" y="222" dominant-baseline="central" font-size="12" font-weight="700">鐵路</text>`;
    }
    if (miss !== 'scale') {
      s += `<rect x="276" y="244" width="104" height="38" rx="4" fill="#fff" stroke="${INK}" stroke-width="2"/>
        <rect x="286" y="252" width="30" height="7" fill="${INK}"/><rect x="316" y="252" width="30" height="7" fill="#fff" stroke="${INK}" stroke-width="1.5"/>
        <g font-size="10" font-weight="700" text-anchor="middle"><text x="286" y="274">0</text><text x="316" y="274">250</text><text x="346" y="274">500</text></g>
        <text x="352" y="259" font-size="10" font-weight="700">公尺</text>`;
    }
    return s + '</svg>';
  }
  function genMiss() {
    const asks = ['這張救援地圖被雨淋溼了，<b>少了一個地圖要素</b>！是哪一個？', '隊員拿到一張新地圖，仔細檢查：它<b>少了哪一個地圖要素</b>？', '出發前最後檢查！這張地圖<b>缺了哪一個要素</b>？'];
    return mix(Object.keys(PART)).slice(0, 3).map((m, i) => ({ mode: 'opts', art: missArt(m), ask: asks[i], rq: asks[i].replace(/<[^>]*>/g, ''),
      opts: ['title', 'compass', 'legend', 'scale'].map(k => ({ t: PART[k] })), answer: PART[m], why: PART_WHY[m], trap: PART_TRAP[m],
      hint: '地圖四要素：圖名、方位標、圖例、比例尺。一個一個找找看，哪一個不見了？' }));
  }

  const MISSIONS = [
    { icon: '🗺️', name: '挑對地圖', gen: genType },
    { icon: '🧭', name: '八方位導航', gen: genDir },
    { icon: '🔣', name: '圖例搜救', gen: genLegend },
    { icon: '📏', name: '比例尺測距', gen: genScale },
    { icon: '🧩', name: '補齊地圖要素', gen: genMiss }
  ];

  /* ---------- 關卡流程 ---------- */
  function run() {
    const tasks = [];
    MISSIONS.forEach((m, mi) => m.gen().forEach((t, ti) => tasks.push(Object.assign(t, { mi, ti }))));
    const stage = document.getElementById('stage');
    let i = 0;
    const trail = () => `<div class="mr-trail px">${MISSIONS.map((m, k) => {
      const st = k < tasks[i].mi ? 'done' : k === tasks[i].mi ? 'now' : '';
      return `<span class="mr-st ${st}">${st === 'done' ? '✅' : m.icon}<small>${m.name}</small></span>`;
    }).join('<span class="mr-dash">┄</span>')}<span class="mr-saved">🧒 已救回 <b>${i}</b> / ${tasks.length}</span></div>`;
    const step = () => {
      if (game.over) return;
      if (i >= tasks.length) {
        stage.innerHTML = `<div class="panel px mr-end"><div class="mr-big">🚁🎉</div><b>任務完成！${tasks.length} 位迷路者全部平安回家！</b><br>你是地圖王國最可靠的救援隊員！</div>`;
        return later(finishLevel, 1200);
      }
      const t = tasks[i], m = MISSIONS[t.mi];
      window.MapRescue.cur = t;   // 測試用：目前題目
      setProg(i + 1, tasks.length); setAsk(t.ask);
      if (t.ti === 0) toast(`${m.icon} 任務 ${t.mi + 1}：${m.name}，出發！`, 2200);
      let ans = '';
      if (t.mode === 'rose') ans = `<div class="mr-rose">${ROSE.flat().map(d => d ? `<button class="px-btn opt mr-dir" data-a="${d}方">${d}</button>` : '<span class="mr-mid">🧭</span>').join('')}</div>`;
      else if (t.mode === 'cards') ans = `<div class="opts mr-cards">${t.opts.map(o => `<button class="px-btn opt mr-card" data-a="${o.t}">${o.html}</button>`).join('')}</div>`;
      else if (t.mode === 'opts') ans = `<div class="opts">${mix(t.opts).map(o => `<button class="px-btn opt" data-a="${o.t}">${o.t}</button>`).join('')}</div>`;
      else ans = '<p class="mr-tip">👆 直接點地圖上的符號或線條</p>';
      stage.innerHTML = `${trail()}<div class="panel px"><div class="mr-head">${m.icon} 任務 ${t.mi + 1}：${m.name}<span>第 ${t.ti + 1} / 3 位迷路者</span></div>
        <div class="mr-art">${t.art || ''}</div>${ans}<div id="why"></div></div>`;
      let solved = false;
      const judge = (a, el) => {
        if (solved || game.over) return;
        const ok = a === t.answer, an = t.mode === 'tap' ? `點了「${NAME[a]}」` : a, cn = t.mode === 'tap' ? `點「${NAME[t.answer]}」` : t.answer;
        report(ok, t.rq || t.ask, an, cn);
        if (!ok) { el.classList.add('wrong'); if (el.tagName === 'BUTTON') el.disabled = true; restartAnim(el, 'shake'); miss(t.hint); return; }
        solved = true; good(); bigCheck(); el.classList.add(t.mode === 'tap' ? 'mr-found' : 'right');
        stage.querySelectorAll('.opt').forEach(b => { b.disabled = true; });
        document.getElementById('why').innerHTML = `<div class="explain" style="margin-top:10px">💡 ${t.why}${t.trap ? `<div class="trap">⚠️ 小心陷阱：${t.trap}</div>` : ''}</div>
          <div class="next-row" style="margin-top:10px"><button class="px-btn orange" id="nextQ">${i + 1 < tasks.length ? '救下一位 ▶' : '完成救援 🏁'}</button></div>`;
        document.getElementById('nextQ').addEventListener('click', () => { Sound.click(); i++; step(); });
      };
      stage.querySelectorAll('[data-a]').forEach(b => b.addEventListener('click', () => judge(b.dataset.a, b)));
      if (t.mode === 'tap') stage.querySelector('.mr-art svg').addEventListener('click', e => { const g = e.target.closest('[data-k]'); if (g) judge(g.dataset.k, g); });
    };
    step();
  }
  window.MapRescue = { run, dirOf, gens: { genType, genDir, genLegend, genScale, genMiss } };

  /* ---------- 把關卡加進地圖單元（u2） ---------- */
  const U = window.UNITS && UNITS.find(u => u.id === 'u2');
  if (U) U.levels.push({
    id: 'u2l5', kind: 'game', type: 'rescue', icon: '🚁', name: '地圖王國：迷航救援隊',
    how: '5 個救援任務、15 位迷路者！挑對地圖、用八方位導航、看圖例、算比例尺、補齊地圖要素。',
    recap: '先依需要挑對地圖；有方位標就看方位標判斷北方；符號要對照圖例；比例尺用乘、除算距離，注意公尺和公里（1 公里 = 1000 公尺）；地圖四要素是圖名、方位標、圖例、比例尺。'
  });
})();
