/* 三版本（南一・康軒・翰林）三下單元對照：給 KGVer（kg-ver.js）用。單元名稱、順序依 curriculum/social.json（115 學年度）。
   levels：data.js 的「街區代號-第幾封信」（u1-0＝第一街區第 1 封）；星星仍記在這個代號上，換版本不會遺失。
   bankUnits：exam-bank.js 的 unit 名稱。lessons：街區頁顯示的課名。 */
window.BOOK = (function () {
  var U1 = '第一單元 我居住的地方', U2 = '第二單元 多元的生活空間', U3 = '第三單元 生活中的各行各業',
    U4 = '第四單元 生活與工作的轉變', U5 = '第五單元 儲蓄與消費', U6 = '第六單元 小小街道觀察家',
    U7 = '認識地方的方法', U8 = '為民服務的機關', U9 = '消費停看聽', U10 = '地名的由來與地方的故事', U11 = '探究：讓家園更美好';
  function all(id) { return [id + '-0', id + '-1', id + '-2']; }
  return { subject: 'social', grade: 3, sem: '下', defaultVersion: 'han', versions: {
    nani: [
      { no: 1, title: '居住的地方', lessons: '生活與環境／在地的特色／認識地方的方法', levels: all('u7').concat(['u2-0']), bankUnits: [U7] },
      { no: 2, title: '生活中的互動', lessons: '敦親睦鄰／為民服務', levels: ['u1-0', 'u1-1'].concat(all('u8')), bankUnits: [U1, U8] },
      { no: 3, title: '生活中的消費', lessons: '生活與消費／消費與選擇', levels: all('u5'), bankUnits: [U5] },
      { no: 4, title: '地名的由來與地方的故事', lessons: '地名的由來／探索地方的地名／居住地方的故事', levels: all('u10'), bankUnits: [U10] },
      { no: 5, title: '〔探究〕打造幸福的家園', lessons: '探究方法 123：問題發想→資訊統整→行動分享', levels: all('u11'), bankUnits: [U11] }
    ],
    kang: [
      { no: 1, title: '我們居住的地方', lessons: '認識居住的地方／居住地方的生活／地方的居民活動', levels: ['u1-1', 'u1-2'].concat(all('u8'), ['u2-1']), bankUnits: [U1, U8] },
      { no: 2, title: '消費與生活', lessons: '人人有消費／聰明的消費', levels: all('u5'), bankUnits: [U5] },
      { no: 3, title: '消費與選擇', lessons: '消費停看聽／消費改變生活', levels: all('u9'), bankUnits: [U9] },
      { no: 4, title: '家鄉的地名與故事', lessons: '地名的由來／探索家鄉地名／家鄉的故事', levels: all('u10'), bankUnits: [U10] },
      { no: 5, title: '主題探究與實作：家鄉特派員', lessons: '發現問題→找出原因→想出方法→實際行動→分享省思', levels: all('u11').concat(['u6-1']), bankUnits: [U11] }
    ],
    han: [
      { no: 1, title: '我居住的地方', lessons: '我與鄰居的互動／探訪居住的地方', levels: all('u1'), bankUnits: [U1] },
      { no: 2, title: '多元的生活空間', lessons: '不同地區的空間利用／多元的生活方式與交流', levels: all('u2'), bankUnits: [U2] },
      { no: 3, title: '生活中的各行各業', lessons: '為居住地方的產業和生活／職業甘苦談', levels: all('u3'), bankUnits: [U3] },
      { no: 4, title: '生活與工作的轉變', lessons: '生活需求的改變／工作方式的轉變／社會變遷產生的影響', levels: all('u4'), bankUnits: [U4] },
      { no: 5, title: '儲蓄與消費', lessons: '儲蓄有計畫／消費有學問／購物好習慣', levels: all('u5'), bankUnits: [U5] },
      { no: 6, title: '小小街道觀察家（探究）', lessons: '探究單元：感受 → 想像 → 實踐', levels: all('u6'), bankUnits: [U6] }
    ]
  } };
})();
