/* 三版本（南一・康軒・翰林）六下單元對照：給 KGVer（kg-ver.js）用。單元名稱、順序依 curriculum/social.json（115 學年度）。
   levels：關卡 id（u1l1＝data.js 第一站第 1 關、u1x＝進階挑戰；t1 搬自六上科技、w1 搬自五下世界文化、p1 搬自五下電力（js/x-move.js）；
   f1、f2 是補做的南一、康軒獨有課（js/x-new.js））；星星仍記在關卡 id 上。
   探究單元是統整本冊：南一「守護地球」加考環境永續、康軒「科技改變生活」加考科技題庫，讓期末卷有 50 題。
   bankUnits：exam-bank.js、js/exam-move.js、js/exam-x.js 的 unit 名稱。lessons：車站卡顯示的課名。 */
window.BOOK = (function () {
  var U1 = '第一單元 永續的經濟發展', U2 = '第二單元 促進社會永續發展', U3 = '第三單元 環境永續的地球村', U4 = '第四單元 改變世界的行動者',
    UT = '科技的發展與新規範', UW = '世界宗教與多元文化', E1 = '臺灣電力的發展', F1 = '科技與飲食、石化科技', F2 = '能源科技：從蒸汽到電力';
  function all(u) { return [u + 'l1', u + 'l2', u + 'l3', u + 'x']; }
  var INQ = ['發現問題', '蒐集資料', '行動與分享'], INQL = ['u4l1', 'u4l2', 'u4x'];
  return { subject: 'social', grade: 6, sem: '下', defaultVersion: 'han', versions: {
    nani: [
      { no: 1, title: '科技與生活', em: '🍱', station: '科技生活站', lessons: ['科技與飲食的關係', '石化科技與生活', '資訊科技與生活'], levels: all('f1').concat(['t1l1', 't1l2', 't1l3']), bankUnits: [F1, UT] },
      { no: 2, title: '全球交流下的臺灣', em: '🌐', station: '全球交流站', lessons: ['世界宗教在臺灣', '從全球交流看多元與差異', '永續發展的地球村'], levels: ['w1l1', 'w1l2', 'w1l3', 'u1l1', 'u1l2', 'u3l2', 'u3l3'], bankUnits: [UW, U1, U3] },
      { no: 3, title: '〔探究〕守護地球的實踐者', lessons: INQ, levels: INQL.concat(['u3l1']), bankUnits: [U4, U3] }
    ],
    kang: [
      { no: 1, title: '世界多元文化與科技發展對臺灣的影響', em: '🌐', station: '文化科技站', lessons: ['世界多元文化在臺灣如何展現？', '能源科技的發展如何影響臺灣？', '生物、資訊科技的發展如何影響臺灣？'],
        levels: ['w1l1', 'w1l2'].concat(all('f2'), ['p1l2', 't1l1', 't1l2', 't1l3']), bankUnits: [UW, F2, E1, UT] },
      { no: 2, title: '臺灣走向世界', em: '🤝', station: '走向世界站', lessons: ['為什麼臺灣要參與國際事務？', '為什麼我們要關心人權議題？', '為什麼我們要關心環境議題？'], levels: all('u2').concat(all('u3')), bankUnits: [U2, U3] },
      { no: 3, title: '主題探究與實作：科技改變生活', lessons: INQ, levels: INQL, bankUnits: [U4, UT] }
    ],
    han: [
      { no: 1, title: '永續的經濟發展', levels: all('u1'), bankUnits: [U1] },
      { no: 2, title: '促進社會永續發展', levels: all('u2'), bankUnits: [U2] },
      { no: 3, title: '環境永續的地球村', levels: all('u3'), bankUnits: [U3] },
      { no: 4, title: '改變世界的行動者（探究）', levels: INQL, bankUnits: [U4] }
    ]
  } };
})();
