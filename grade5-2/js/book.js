/* 三版本（南一・康軒・翰林）五下單元對照：給 KGVer（kg-ver.js）用。單元名稱、順序依 curriculum/social.json（115 學年度）。
   levels：任務 id（u1l1＝data.js 第一單元第 1 則；q1、q2、m1 搬自五上清帝國、六上消費理財（js/x-move.js），e1、e2、j1 是補做的南一、康軒獨有課（js/x-new.js））；星星仍記在任務 id 上。
   bankUnits：exam-bank.js、js/exam-move.js、js/exam-x.js 的 unit 名稱。lessons：頻道卡顯示的課名。 */
window.BOOK = (function () {
  var U1 = '第一單元 日本統治下的臺灣', U2 = '第二單元 生活中的文化展現', U3 = '第三單元 走向民主的中華民國', U4 = '第四單元 從臺灣探索世界文化', U5 = '第五單元 時空採訪員',
    UQ = '清帝國時期的臺灣', UM = '消費選擇與理財規劃', E1 = '臺灣電力的發展', E2 = '生產活動與環保經濟', J1 = '日治時期的社會變遷';
  function all(u) { return [u + 'l1', u + 'l2', u + 'l3']; }
  var INQ = ['發現問題', '蒐集資料', '整理與分享'];
  return { subject: 'social', grade: 5, sem: '下', defaultVersion: 'han', versions: {
    nani: [
      { no: 1, title: '唐山到臺灣', lessons: ['移民與自然環境的關係', '漢人移墾社會的形成', '清帝國時期的臺灣社會'], levels: all('q1'), bankUnits: [UQ] },
      { no: 2, title: '開港通商後的臺灣', lessons: ['開港通商', '臺灣地位的改變'], levels: all('q2'), bankUnits: [UQ] },
      { no: 3, title: '臺灣電力的發展', lessons: ['當島嶼遇見電', '電力發展的挑戰'], levels: all('e1'), bankUnits: [E1] },
      { no: 4, title: '經濟與生活', em: '💰', lessons: ['日常的經濟活動', '理財大小事', '環保經濟'], levels: all('m1').concat(['e2l2', 'e2l3']), bankUnits: [UM, E2] },
      { no: 5, title: '〔探究〕打造永續的家園', lessons: INQ, levels: all('u5'), bankUnits: [U5] }
    ],
    kang: [
      { no: 1, title: '我們的經濟活動', lessons: ['生產活動如何影響人們的生活？', '消費與理財如何影響人們的生活？'], levels: all('e2').concat(all('m1')), bankUnits: [E2, UM] },
      { no: 2, title: '清帝國時期臺灣的發展與改變', lessons: ['移民的開墾如何改變臺灣社會？', '開港通商如何影響經濟與文化？', '開港後清帝國的統治措施有什麼變化？'], levels: all('q1').concat(all('q2')), bankUnits: [UQ] },
      { no: 3, title: '日治時期人民與政府的關係', lessons: ['日本帝國如何統治臺灣？', '殖民統治下臺灣人如何爭取權利？'], levels: ['u1l2', 'u1l3'], bankUnits: [U1] },
      { no: 4, title: '日治時期的社會變遷', em: '🏫', lessons: ['日治時期的建設帶來什麼影響？', '日治時期的教育有何改變與影響？', '日治時期的社會文化有何改變與影響？'], levels: ['u1l1'].concat(all('j1')), bankUnits: [J1] },
      { no: 5, title: '主題探究與實作：穿越時空探家園', lessons: INQ, levels: all('u5'), bankUnits: [U5] }
    ],
    han: [
      { no: 1, title: '日本統治下的臺灣', levels: all('u1'), bankUnits: [U1] },
      { no: 2, title: '生活中的文化展現', levels: all('u2'), bankUnits: [U2] },
      { no: 3, title: '走向民主的中華民國', levels: all('u3'), bankUnits: [U3] },
      { no: 4, title: '從臺灣探索世界文化', levels: all('u4'), bankUnits: [U4] },
      { no: 5, title: '時空採訪員（探究）', levels: all('u5'), bankUnits: [U5] }
    ]
  } };
})();
