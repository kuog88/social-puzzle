/* 五上社會：可靈 Kling 動畫（家長自製，影片在 ../videos/）
   - 答題後的「💡 解說」如果講到影片的主題，下面會出現「▶ 看動畫」按鈕。
   - 單元頁會列出「📺 這個單元的動畫」，依單元關卡內容自動挑出相關影片。
   q：比對解說文字（要很明確才放按鈕）；u：比對單元內容（放進單元動畫清單）。 */
(function () {
  var V = [
    { f: 'kling_01_plates', t: '板塊推擠，臺灣從海裡誕生', q: /板塊/, u: /板塊/ },
    { f: 'kling_09_strait', t: '空拍臺灣海峽', q: /臺灣海峽/, u: /臺灣海峽/ },
    { f: 'kling_10_tropic', t: '北回歸線穿過臺灣', q: /北回歸線/, u: /北回歸線/ },
    { f: 'kling_11_coord', t: '用經緯度找到臺灣', q: /經度|緯度|經緯/, u: /經度|緯度|經緯/ },
    { f: 'kling_02_mountain', t: '雲霧中的玉山與中央山脈', q: /玉山|中央山脈/, u: /玉山|中央山脈/ },
    { f: 'kling_12_basin', t: '空拍臺北盆地', q: /盆地/, u: /盆地/ },
    { f: 'kling_13_hill', t: '苗栗丘陵上的茶園', q: /丘陵/, u: /丘陵/ },
    { f: 'kling_14_changbin', t: '長濱文化：八仙洞裡的舊石器人', q: /長濱|八仙洞/, u: /長濱|八仙洞|舊石器/ },
    { f: 'kling_03_yuanshan', t: '圓山文化：貝塚與磨製石器', q: /圓山|貝塚/, u: /圓山|貝塚|史前/ },
    { f: 'kling_04_beinan', t: '卑南文化：玉玦與石板棺', q: /卑南文化|卑南遺址|玉玦|石板棺/, u: /卑南|玉玦|石板棺/ },
    { f: 'kling_05_shisanhang', t: '十三行文化：煉鐵與玻璃珠', q: /十三行|煉鐵/, u: /十三行|煉鐵/ },
    { f: 'kling_06_tao', t: '達悟族：拼板舟與飛魚', q: /達悟|拼板舟|飛魚/, u: /達悟|拼板舟|飛魚/ },
    { f: 'kling_07_paiwan', t: '排灣族：石板屋與百步蛇', q: /排灣|石板屋|百步蛇/, u: /排灣|石板屋|百步蛇/ },
    { f: 'kling_08_amis', t: '阿美族：豐年祭', q: /阿美|豐年祭/, u: /阿美|豐年祭/ },
    { f: 'kling_15_thao', t: '邵族：日月潭的杵音', q: /邵族|杵音/, u: /邵族|杵音/ },
    { f: 'kling_16_bunun', t: '布農族：八部合音', q: /布農|八部合音/, u: /布農|八部合音/ },
    { f: 'kling_17_atayal', t: '泰雅族：織布與紋面', q: /泰雅/, u: /泰雅/ },
    { f: 'kling_18_tsou', t: '鄒族：庫巴會所與戰祭', q: /鄒族|庫巴|戰祭/, u: /鄒族|庫巴|戰祭/ }
  ];
  // 單元動畫清單：依三個版本的課名人工對照（數字＝影片編號 kling_XX）
  var GEO = ['09', '10', '11'], LAND = ['01', '02', '12', '13'], PRE = ['14', '03', '04', '05'], TRIBE = ['06', '07', '08', '15', '16', '17', '18'];
  var UNIT_MAP = {
    han: { 1: GEO.concat(PRE, TRIBE), 4: LAND },                       // 臺灣的位置與先民足跡／土地的利用與變遷
    kang: { 1: ['09', '11'], 2: LAND.concat(['10']), 3: PRE.concat(TRIBE) }, // 臺灣我的家／自然環境與生活（地形、氣候）／尋根探源
    nani: { 1: GEO.concat(LAND, PRE), 2: TRIBE, 3: ['13'] }              // 臺灣我來了（鳥瞰、海中誕生、人類來到）／島嶼上的子民／物產資源（丘陵茶園）
  };
  var css = document.createElement('style');
  css.textContent =
    '.vd-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;justify-content:center}' +
    '.vd-btn{font:inherit;font-weight:800;font-size:15px;cursor:pointer;border:3px solid #c0392b;background:#fff;color:#c0392b;border-radius:999px;padding:6px 14px;box-shadow:0 3px 0 #c0392b}' +
    '.vd-btn:hover{background:#fff1ee}.vd-btn:active{transform:translateY(2px);box-shadow:0 1px 0 #c0392b}' +
    '.vd-box{margin:12px 0 4px;padding:10px 12px;border:3px dashed #e8a090;border-radius:16px;background:#fff8f4}' +
    '.vd-box h4{margin:0 0 4px;font-size:17px;color:#a0392b}' +
    '#vd-ov{position:fixed;inset:0;z-index:2147483300;background:rgba(0,0,0,.78);display:flex;align-items:center;justify-content:center;padding:12px}' +
    '#vd-ov .in{width:min(860px,100%);background:#1d1d1d;border-radius:18px;padding:10px;text-align:center;color:#fff}' +
    '#vd-ov video{width:100%;max-height:72vh;border-radius:12px;background:#000;display:block}' +
    '#vd-ov b{display:block;margin:8px 0;font-size:18px}' +
    '#vd-ov button{font:inherit;font-weight:800;font-size:16px;border:none;border-radius:999px;padding:8px 26px;background:#f39c12;color:#fff;cursor:pointer}';
  document.head.appendChild(css);

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function btns(list) {
    return list.map(function (v) { return '<button type="button" class="vd-btn" data-vd="' + v.f + '">▶ 看動畫：' + esc(v.t) + '</button>'; }).join('');
  }
  function play(f) {
    var v = V.filter(function (x) { return x.f === f; })[0]; if (!v) return;
    if (window.speechSynthesis) speechSynthesis.cancel();
    var ov = document.createElement('div'); ov.id = 'vd-ov';
    ov.innerHTML = '<div class="in" role="dialog" aria-label="' + esc(v.t) + '"><video controls autoplay playsinline preload="auto" src="../videos/' + f + '.mp4"></video><b>' + esc(v.t) + '</b><button type="button">看完了，關閉</button></div>';
    function close() { var vd = ov.querySelector('video'); vd.pause(); vd.removeAttribute('src'); vd.load(); ov.remove(); }
    ov.querySelector('button').onclick = close;
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    document.body.appendChild(ov);
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.vd-btn');
    if (b) { e.preventDefault(); play(b.getAttribute('data-vd')); }
  });

  // 答題解說：依解說＋題目文字放按鈕（最多 2 個）
  function onWhy() {
    var why = document.getElementById('why');
    if (!why || why.querySelector('.vd-row')) return;
    var ex = why.querySelector('.explain'); if (!ex) return;
    var ask = document.getElementById('lvAsk');
    var text = ex.textContent + ' ' + (ask ? ask.textContent : '');
    var hit = V.filter(function (v) { return v.q.test(text); });
    if (hit.length > 2) return;   // 一次講到很多族、很多遺址的題目不放（太籠統）
    if (!hit.length) return;
    var row = document.createElement('div'); row.className = 'vd-row'; row.innerHTML = btns(hit);
    ex.appendChild(row);
  }
  // 單元頁：依這個單元所有關卡的內容挑影片
  function onUnit() {
    var desc = document.getElementById('unitDesc');
    if (!desc || desc.querySelector('.vd-box') || typeof curUnit === 'undefined' || !curUnit) return;
    var ver = (window.KGVer && window.BOOK) ? KGVer.cur(BOOK).version : 'han';
    var ids = ((UNIT_MAP[ver] || UNIT_MAP.han)[curUnit.no]) || [];
    var hit = ids.map(function (n) { return V.filter(function (v) { return v.f.slice(6, 8) === n; })[0]; }).filter(Boolean);
    if (!hit.length) return;
    var box = document.createElement('div'); box.className = 'vd-box';
    box.innerHTML = '<h4>📺 這個單元的動畫</h4><div class="vd-row" style="justify-content:flex-start">' + btns(hit) + '</div>';
    desc.appendChild(box);
  }
  // #why 每一題都會重新產生，所以看整個頁面；單元頁看 #unitDesc
  function init() {
    new MutationObserver(function () { onWhy(); }).observe(document.body, { childList: true, subtree: true });
    var d = document.getElementById('unitDesc');
    if (d) new MutationObserver(function () { onUnit(); }).observe(d, { childList: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.KGVideos = { list: V, play: play };
})();
