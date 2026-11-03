/* 三版本（南一・康軒・翰林）六上單元對照：給 KGVer（kg-ver.js）用。單元名稱、順序依 curriculum/social.json（115 學年度）。
   levels：關卡 id（u1l1＝data.js 第一單元第 1 關；k1、k2、d1 搬自五下日治與民主、g1 搬自六下國際與人權（js/x-move.js）；p1、c1、s1 是補做的南一、康軒獨有課（js/x-units.js））；星星仍記在關卡 id 上。
   bankUnits：exam-bank.js、js/exam-move.js、js/exam-x.js 的 unit 名稱。lessons：單元卡顯示的課名。 */
window.BOOK = (function () {
  var U1 = '第一單元 戰後經濟發展與轉型', U2 = '第二單元 消費選擇與理財規劃', U3 = '第三單元 生活中的各種規範', U4 = '第四單元 科技的發展與新規範', U5 = '第五單元 四角辯論會',
    UK = '日本統治下的臺灣', UJ = '日治時期的社會變遷', UD = '臺灣的民主之路', UG = '臺灣與國際社會', P1 = '民主政府的運作', C1 = '城鄉與區域發展', S1 = '多元族群與友善社會';
  function all(u, n) { var a = []; for (var i = 1; i <= (n || 3); i++) a.push(u + 'l' + i); return a; }
  var INQ = ['發現問題', '蒐集資料', '整理與分享'];
  return { subject: 'social', grade: 6, sem: '上', defaultVersion: 'han', versions: {
    nani: [
      { no: 1, title: '日本統治下的臺灣社會', icon: '🏯', lessons: ['日本展開在臺灣的統治', '經濟建設對社會發展的重要性', '社會生活與風氣的轉變'], levels: all('k1', 2).concat(all('k2', 2)), bankUnits: [UK, UJ] },
      { no: 2, title: '邁向民主社會', icon: '🗳️', lessons: ['臺灣的民主之路', '民主國家的運作方式'], levels: all('d1').concat(all('p1')), bankUnits: [UD, P1] },
      { no: 3, title: '戰後臺灣的經濟與城鄉發展', icon: '🏭', lessons: ['戰後臺灣的經濟發展', '臺灣的城鄉發展'], levels: all('u1').concat(all('c1')), bankUnits: [U1, C1] },
      { no: 4, title: '臺灣進行式', icon: '🤝', lessons: ['多元族群的共榮', '開創友善的社會', '與世界做朋友'], levels: all('s1').concat(all('g1')), bankUnits: [S1, UG] },
      { no: 5, title: '〔探究〕我的生活圈', icon: '🗣️', lessons: INQ, levels: all('u5'), bankUnits: [U5] }
    ],
    kang: [
      { no: 1, title: '民主政治的發展', icon: '🗳️', lessons: ['臺灣人民爭取民主自由的歷程為何？', '臺灣人民有哪些權利和義務？', '民主國家政府與人民的關係為何？'], levels: all('d1').concat(['u3l3'], all('p1')), bankUnits: [UD, P1] },
      { no: 2, title: '社會變遷下的個人發展與族群文化', icon: '🤝', lessons: ['個人發展如何受到社會變遷的影響？', '族群交流如何影響臺灣社會？'], levels: all('s1'), bankUnits: [S1] },
      { no: 3, title: '戰後經濟發展、轉型與生活', icon: '🏭', lessons: ['戰後經濟發展如何影響人們生活？', '臺灣如何邁向科技島？'], levels: all('u1'), bankUnits: [U1] },
      { no: 4, title: '臺灣的城鄉與區域發展', icon: '🏙️', lessons: ['臺灣的工業化與都市化如何發展？', '生活圈如何形成與發展？', '區域如何畫分與調整？'], levels: all('c1'), bankUnits: [C1] },
      { no: 5, title: '主題探究與實作：臺灣向前行', icon: '🗣️', lessons: INQ, levels: all('u5'), bankUnits: [U5] }
    ],
    han: [
      { no: 1, title: '戰後經濟發展與轉型', levels: all('u1'), bankUnits: [U1] },
      { no: 2, title: '消費選擇與理財規劃', levels: all('u2'), bankUnits: [U2] },
      { no: 3, title: '生活中的各種規範', levels: all('u3'), bankUnits: [U3] },
      { no: 4, title: '科技的發展與新規範', levels: all('u4'), bankUnits: [U4] },
      { no: 5, title: '四角辯論會（探究）', levels: all('u5'), bankUnits: [U5] }
    ]
  } };
})();
