/* 三版本（南一・康軒・翰林）五上單元對照：給 KGVer（kg-ver.js）用。單元名稱、順序依 curriculum/social.json（115 學年度）。
   levels：關卡 id（u1l1＝data.js 第一單元第 1 關；x1～x5 是 js/x-units.js 補做的南一、康軒獨有課）；星星仍記在關卡 id 上。
   bankUnits：exam-bank.js、js/exam-x.js 的 unit 名稱。lessons：單元卡顯示的課名。 */
window.BOOK = (function () {
  var U1 = '第一單元 臺灣的位置與先民足跡', U2 = '第二單元 臺灣登上國際舞臺', U3 = '第三單元 成為清帝國的領土', U4 = '第四單元 土地的利用與變遷', U5 = '第五單元 製作小書看見臺灣',
    X1 = '臺灣島的形成與海岸', X2 = '原住民族與漢人的社會', X3 = '生活規範與法律', X4 = '臺灣的物產資源', X5 = '臺灣的氣候與生活';
  function all(u) { return [u + 'l1', u + 'l2', u + 'l3', u + 'l4']; }
  return { subject: 'social', grade: 5, sem: '上', defaultVersion: 'han', versions: {
    nani: [
      { no: 1, title: '臺灣！我來了', icon: '🗺️', lessons: ['鳥瞰臺灣', '海中誕生的家園', '當人類來到臺灣'], levels: ['u1l1', 'u1l2'].concat(all('x1'), ['u1l3']), bankUnits: [U1, X1] },
      { no: 2, title: '島嶼上的生活樣貌', icon: '🏘️', lessons: ['島嶼上的子民', '島上居民的生活'], levels: all('x2').concat(all('x3')), bankUnits: [X2, X3] },
      { no: 3, title: '臺灣的物產資源', icon: '🌾', lessons: ['豐饒的土地', '山中的故事'], levels: all('x4'), bankUnits: [X4] },
      { no: 4, title: '看見福爾摩沙', icon: '⛵', lessons: ['潟湖上的海上貿易', '大航海時期來臺的人們', '大航海時期對臺的影響'], levels: all('u2'), bankUnits: [U2] },
      { no: 5, title: '〔探究〕發現臺灣之美', icon: '📖', lessons: ['發現問題', '蒐集資料', '整理與分享'], levels: all('u5'), bankUnits: [U5] }
    ],
    kang: [
      { no: 1, title: '臺灣我的家', icon: '🏠', lessons: ['臺灣的地理位置與文化發展有何關係？', '社會規範如何影響人們的行為？', '為什麼法律與我們的生活有關係？'], levels: ['u1l1'].concat(all('x3')), bankUnits: [X3] },
      { no: 2, title: '臺灣的自然環境與生活', icon: '⛰️', lessons: ['地形如何影響我們的生活？', '氣候如何影響我們的生活？'], levels: all('x1').concat(['u4l1'], all('x5')), bankUnits: [X1, X5] },
      { no: 3, title: '尋根探源話臺灣', icon: '⛏️', lessons: ['史前人類如何利用環境與資源來生活？', '原住民族如何與環境共存？'], levels: ['u1l2', 'u1l3', 'x2l1', 'u1l4'], bankUnits: [U1] },
      { no: 4, title: '大航海時代的臺灣', icon: '⛵', lessons: ['大航海時代臺灣如何登上世界舞臺？', '大航海時代有哪些人經營臺灣？', '大航海時代對臺灣帶來什麼影響？'], levels: all('u2'), bankUnits: [U2] },
      { no: 5, title: '主題探究與實作：守護臺灣最美的風景', icon: '📖', lessons: ['發現問題', '蒐集資料', '整理與分享'], levels: all('u5'), bankUnits: [U5] }
    ],
    han: [
      { no: 1, title: '臺灣的位置與先民足跡', levels: all('u1'), bankUnits: [U1] },
      { no: 2, title: '臺灣登上國際舞臺', levels: all('u2'), bankUnits: [U2] },
      { no: 3, title: '成為清帝國的領土', levels: all('u3'), bankUnits: [U3] },
      { no: 4, title: '土地的利用與變遷', levels: all('u4'), bankUnits: [U4] },
      { no: 5, title: '製作小書看見臺灣（探究）', levels: all('u5'), bankUnits: [U5] }
    ]
  } };
})();
