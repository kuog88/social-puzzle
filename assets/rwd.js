/* 社會科遊戲共用：拖曳時手指靠近螢幕上下邊緣，畫面就自動捲動（手機、平板拖卡片不用另一隻手捲）
   用法：各遊戲 index.html 的 game.js 後面加 <script src="../assets/rwd.js"></script> */
(function () {
  'use strict';
  // 各遊戲拖曳中的卡片（跟著手指跑的那張）
  var DRAGGING = '.chip.ghost, .chipcard.dragging, .ghost-card, .ghost-chip, .card.dragging, [data-dragging]';
  var last = null, timer = 0;

  document.addEventListener('pointermove', function (e) {
    if (!e.isTrusted && !window.__rwdTest) return;  // 自己補發的事件不處理（__rwdTest 只給自動測試用）
    last = {x: e.clientX, y: e.clientY, id: e.pointerId, type: e.pointerType, target: e.target};
    if (!timer) timer = setTimeout(tick, 16);
  }, {capture: true, passive: true});
  var stop = function () { last = null; };
  document.addEventListener('pointerup', stop, true);
  document.addEventListener('pointercancel', stop, true);

  function tick() {
    timer = 0;
    if (!last || !document.querySelector(DRAGGING)) return;
    var zone = Math.max(56, Math.min(110, innerHeight * 0.13)), dy = 0;
    if (last.y < zone) dy = -Math.ceil((zone - last.y) / 5);
    else if (last.y > innerHeight - zone) dy = Math.ceil((last.y - (innerHeight - zone)) / 5);
    if (!dy) return;
    var before = window.scrollY;
    window.scrollBy(0, dy);
    if (window.scrollY !== before) {
      // 畫面捲動後手指沒動，補發一次 pointermove，讓遊戲重新判斷手指底下是哪個目標
      try {
        last.target.dispatchEvent(new PointerEvent('pointermove', {
          clientX: last.x, clientY: last.y, pointerId: last.id, pointerType: last.type, isPrimary: true, bubbles: true
        }));
      } catch (err) { /* 很舊的瀏覽器沒有 PointerEvent 建構子 */ }
    }
    timer = setTimeout(tick, 16);
  }
})();
