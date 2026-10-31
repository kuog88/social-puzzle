"""產生「平板直式自動放大」CSS：把每個遊戲 style.css 最外層規則裡的尺寸（px）乘上倍率，
放進 @media（平板直式）區塊，附加在 style.css 最後面。重跑時會先移除舊的區塊。
用法（在 repo 根目錄）：python tools/gen_tablet_scale.py grade*/style.css grade3.html
改了某個 style.css 之後重跑一次，舊的放大區塊會自動換掉。"""
import re, sys

START = '/* ===== 平板直式自動放大（tools/gen_tablet_scale.py 產生，請勿手改） ===== */'
END = '/* ===== 平板直式自動放大 結束 ===== */'
SCALE = 1.3
MEDIA = '@media (min-width:700px) and (orientation:portrait) and (min-height:900px)'
PROPS = re.compile(r'^(font-size|font|padding(-\w+)?|margin(-\w+)?|gap|row-gap|column-gap|width|height|min-width|min-height|max-width|max-height|'
                   r'border-radius|inset|top|left|right|bottom|line-height|letter-spacing|flex-basis|grid-template-columns|grid-auto-rows)$')
PX = re.compile(r'(-?\d+(?:\.\d+)?)px')

def top_level_rules(css):
    """回傳最外層的 (selector, body)；跳過 @media/@keyframes/@supports 等區塊與註解"""
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    out, i, n = [], 0, len(css)
    while i < n:
        j = css.find('{', i)
        if j < 0: break
        sel = css[i:j].strip()
        depth, k = 1, j + 1
        while k < n and depth:
            if css[k] == '{': depth += 1
            elif css[k] == '}': depth -= 1
            k += 1
        body = css[j + 1:k - 1]
        if not sel.startswith('@') and '{' not in body:
            out.append((sel, body))
        i = k
    return out

def scale_value(v):
    return PX.sub(lambda m: f'{round(float(m.group(1)) * SCALE, 1):g}px', v)

def build(css):
    lines = []
    for sel, body in top_level_rules(css):
        if re.search(r'(^|[\s,])(html|body|:root)\b', sel) and 'font-size' not in body: continue
        decls = []
        for d in body.split(';'):
            if ':' not in d: continue
            prop, val = d.split(':', 1); prop = prop.strip().lower(); val = val.strip()
            if PROPS.match(prop) and 'px' in val:
                decls.append(f'{prop}:{scale_value(val)}')
        if decls: lines.append(f'  {sel}{{{";".join(decls)}}}')
    return f'{START}\n{MEDIA}{{\n' + '\n'.join(lines) + f'\n}}\n{END}\n'

for path in sys.argv[1:]:
    text = open(path, encoding='utf-8').read()
    strip = lambda c: re.sub(re.escape(START) + r'.*?' + re.escape(END) + r'\n?', '', c, flags=re.S).rstrip() + '\n\n'
    if path.endswith('.html'):
        # 單檔網頁：只處理第一個 <style> 區塊，放大規則插在它的 </style> 前面
        i = text.index('<style>') + len('<style>'); j = text.index('</style>', i)
        css = strip(text[i:j]); block = build(css)
        open(path, 'w', encoding='utf-8').write(text[:i] + css + block + text[j:])
    else:
        css = strip(text); block = build(css)
        open(path, 'w', encoding='utf-8').write(css + block)
    print(path, block.count('\n') - 3, 'rules')
