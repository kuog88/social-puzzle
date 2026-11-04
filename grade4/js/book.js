/* 三版本（南一・康軒・翰林）四上單元對照：給 KGVer（kg-ver.js）用。單元名稱、順序依 curriculum/social.json（115 學年度）。
   levels：data.js 的關卡 id（u1l1＝第一單元第 1 關；u5、u6 從四下搬來，u7～u11 是康軒、翰林獨有的課；u2l5 是 🎮 闖關任務「迷航救援隊」，放在三個版本的地圖單元）；星星仍記在關卡 id 上。
   bankUnits：exam-bank.js 的 unit 名稱（UM 地圖與方位＝救援隊配套題，三版本地圖單元共用）。lessons：單元卡顯示的課名。 */
window.BOOK = (function () {
  var U1 = '第一單元 交通與訊息', U2 = '第二單元 地圖上的家鄉', U3 = '第三單元 認識家鄉景觀', U4 = '第四單元 家鄉的節慶',
    UL = '家鄉的地形與氣候', UP = '家鄉的人口', UC = '家鄉的多元文化', UO = '家鄉的傳統住屋與器物', UF = '家鄉的傳統信仰與老街',
    UD = '生活的作息', UR = '家鄉的生命禮俗', UI = '探究：介紹我的家鄉', UM = '地圖與方位';
  function all(u, n) { var a = []; for (var i = 1; i <= (n || 4); i++) a.push(u + 'l' + i); return a; }
  return { subject: 'social', grade: 4, sem: '上', defaultVersion: 'nani', versions: {
    nani: [
      { no: 1, title: '交通與訊息', lessons: ['陸地的運輸', '船運與空運', '訊息的傳播'], levels: all('u1'), bankUnits: [U1] },
      { no: 2, title: '地圖上的家鄉', lessons: ['閱讀地圖認識家鄉', '家鄉的地圖'], levels: all('u2').concat(['u2l5']), bankUnits: [U2, UM] },
      { no: 3, title: '認識家鄉景觀', lessons: ['家鄉的景觀', '家鄉景觀與生活'], levels: all('u3'), bankUnits: [U3] },
      { no: 4, title: '家鄉的節慶', lessons: ['家鄉的傳統節慶', '家鄉的特色節慶活動', '發現生活中的節日'], levels: all('u4'), bankUnits: [U4] },
      { no: 5, title: '〔探究〕家鄉的生活', lessons: ['發現問題', '蒐集資料', '整理與分享'], levels: all('u11', 3), bankUnits: [UI] }
    ],
    kang: [
      { no: 1, title: '家鄉的自然環境', lessons: ['家鄉在哪裡', '家鄉的地形', '氣候、水資源與生活'], levels: ['u2l2', 'u2l5'].concat(all('u5', 3)), bankUnits: [UL, UM] },
      { no: 2, title: '家鄉的傳統住屋與器物', lessons: ['傳統住屋與生活', '器物與生活'], levels: all('u8'), bankUnits: [UO] },
      { no: 3, title: '家鄉的傳統信仰與老街', lessons: ['信仰與生活', '老街與生活'], levels: all('u9'), bankUnits: [UF] },
      { no: 4, title: '家鄉的作息、節慶與節日', lessons: ['生活的作息', '傳統的節慶', '現代的節日'], levels: ['u10l1', 'u10l2'].concat(all('u4')), bankUnits: [UD, U4] },
      { no: 5, title: '主題探究與實作：介紹家鄉有方法', lessons: ['發現問題', '蒐集資料', '製作家鄉小書', '分享回饋'], levels: all('u11', 3), bankUnits: [UI] }
    ],
    han: [
      { no: 1, title: '家鄉的地圖與運用', lessons: ['閱讀生活中的地圖', '善用地圖好生活'], levels: all('u2').concat(['u2l5']), bankUnits: [U2, UM] },
      { no: 2, title: '家鄉的地形與氣候', lessons: ['高低起伏的地形', '千變萬化的氣候'], levels: all('u5', 3), bankUnits: [UL] },
      { no: 3, title: '家鄉的人口與生活', lessons: ['家鄉的人口組成', '人口變化與發展'], levels: all('u6', 3), bankUnits: [UP] },
      { no: 4, title: '家鄉的多元文化', lessons: ['家鄉的飲食文化', '家鄉的多元服飾', '家鄉的多元語言與命名'], levels: all('u7'), bankUnits: [UC] },
      { no: 5, title: '家鄉的節慶與禮俗', lessons: ['家鄉的傳統節慶', '家鄉的現代節日', '家鄉的生命禮俗'], levels: all('u4').concat(['u10l3', 'u10l4']), bankUnits: [U4, UR] },
      { no: 6, title: '家鄉故事導覽員（探究）', lessons: ['感受', '想像', '實踐'], levels: all('u11', 3), bankUnits: [UI] }
    ]
  } };
})();
