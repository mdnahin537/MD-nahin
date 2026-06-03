#!/usr/bin/env python3
"""Crude brace/bracket/paren balance check for src/index.html.

Strategy: walk only the <script> regions. Ignore /* */ and // comments,
ignore string/regex literals. Tracks ({[ depths; exits non-zero if any final
depth != 0 or any depth ever goes negative.

This is not a JS parser. False positives are possible, but on a single file
that compiled cleanly at e3a0e9a, the deltas surface real imbalance bugs.
"""
import re, sys, pathlib

SRC = pathlib.Path(sys.argv[1] if len(sys.argv)>1 else 'src/index.html')
text = SRC.read_text()

# Extract <script> blocks (excluding type=application/json etc.)
script_re = re.compile(r'<script(?![^>]*type=["\'](?:application/json|importmap)["\'])[^>]*>(.*?)</script>', re.S|re.I)

total = {'{':0, '(':0, '[':0}
pairs = {'}':'{', ')':'(', ']':'['}
issues = []

def walk(code, label):
    i=0; n=len(code)
    line=1; col=0
    # state: in_str (quote char or None), in_tpl (bool depth), in_regex (bool), in_line_cmt, in_block_cmt
    in_str=None; in_block=False; in_line=False
    # crude regex detection: after these tokens, a / starts a regex
    last_significant=''
    REGEX_PREV = set([',', '(', '[', '=', ':', '!', '&', '|', '?', '{', '}', ';', 'return', 'typeof', '/', '+', '-', '~', '<', '>', '*', '%', '^'])
    while i<n:
        c=code[i]
        nxt=code[i+1] if i+1<n else ''
        if c=='\n': line+=1; col=0
        else: col+=1
        if in_block:
            if c=='*' and nxt=='/': in_block=False; i+=2; continue
            i+=1; continue
        if in_line:
            if c=='\n': in_line=False
            i+=1; continue
        if in_str:
            if c=='\\' and i+1<n: i+=2; continue
            if in_str=='`' and c=='$' and nxt=='{':
                # template literal expression — treat as code: push a synthetic '{' tracker
                total['{']+=1; i+=2; continue
            if c==in_str:
                in_str=None
            i+=1; continue
        # not in string/comment
        if c=='/' and nxt=='*': in_block=True; i+=2; continue
        if c=='/' and nxt=='/': in_line=True; i+=2; continue
        if c in ('"',"'",'`'): in_str=c; i+=1; continue
        # regex literal? Skip — too noisy; common false sources are inside strings already.
        if c in '({[':
            total[c]+=1
        elif c in ')}]':
            opener=pairs[c]
            total[opener]-=1
            if total[opener]<0:
                issues.append(f'{label}: negative {opener} at line {line} col {col}')
                return False
        if not c.isspace(): last_significant=c
        i+=1
    return True

for m in script_re.finditer(text):
    walk(m.group(1), f'<script @ char {m.start()}>')

print('final depths:', total)
ok = all(v==0 for v in total.values()) and not issues
if issues:
    print('issues:')
    for it in issues[:10]: print(' ', it)
sys.exit(0 if ok else 1)
