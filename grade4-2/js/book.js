/* 三版本（南一・康軒・翰林）四下單元對照：給 KGVer（kg-ver.js）用。單元名稱、順序依 curriculum/social.json（115 學年度）。
   levels：data.js 的任務 id（u1-1＝第一站任務 1；u6 從四上搬來，u7～u11 是康軒、翰林獨有的課）；星星仍記在任務 id 上。
   bankUnits：exam-bank.js 的 unit 名稱。station：首頁航線圖的站名。 */
window.BOOK = (function () {
  var U1 = '第一單元 家鄉的地形與氣候', U2 = '第二單元 家鄉的產業與創新', U3 = '第三單元 家鄉的人口', U4 = '第四單元 多元文化與願景', U5 = '探究 想像家鄉的樣子',
    UT = '家鄉的交通與訊息', UW = '家鄉的水資源', UM = '家鄉的山與海', UA = '家鄉的農牧生活', UO = '家鄉的老故事', UN = '家鄉的新風貌';
  function all(u) { return [u + '-1', u + '-2', u + '-3']; }
  return { subject: 'social', grade: 4, sem: '下', defaultVersion: 'nani', versions: {
    nani: [
      { no: 1, title: '家鄉的地形與氣候', levels: all('u1'), bankUnits: [U1] },
      { no: 2, title: '家鄉的產業與創新', levels: all('u2'), bankUnits: [U2] },
      { no: 3, title: '家鄉的人口', levels: all('u3'), bankUnits: [U3] },
      { no: 4, title: '多元文化與願景', levels: all('u4'), bankUnits: [U4] },
      { no: 5, title: '〔探究〕想像家鄉的樣子', levels: all('u5'), bankUnits: [U5] }
    ],
    kang: [
      { no: 1, title: '家鄉的產業', station: '產業站', levels: all('u2').concat(['u9-1']), bankUnits: [U2] },
      { no: 2, title: '家鄉的人口', levels: all('u3'), bankUnits: [U3] },
      { no: 3, title: '家鄉的交通', levels: all('u6'), bankUnits: [UT] },
      { no: 4, title: '家鄉風情畫', station: '風情畫站', levels: ['u11-1', 'u11-2', 'u4-3'], bankUnits: [UN] },
      { no: 5, title: '主題探究與實作：家鄉的徽章', station: '徽章探究站', levels: ['u11-3'].concat(all('u5').slice(0, 2)), bankUnits: [U5] }
    ],
    han: [
      { no: 1, title: '家鄉的水資源', levels: all('u7').concat(['u1-3']), bankUnits: [UW] },
      { no: 2, title: '家鄉的山與海', levels: all('u8'), bankUnits: [UM] },
      { no: 3, title: '家鄉的農牧生活', levels: all('u9'), bankUnits: [UA] },
      { no: 4, title: '家鄉的老故事', levels: all('u10'), bankUnits: [UO] },
      { no: 5, title: '家鄉的新風貌', levels: ['u11-1', 'u11-2', 'u2-3'], bankUnits: [UN] },
      { no: 6, title: '歡迎來到我的家鄉（探究）', station: '家鄉導覽站', levels: all('u5'), bankUnits: [U5] }
    ]
  } };
})();
