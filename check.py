#!/usr/bin/env python3
"""Проверка страницы CV: согласованность словарей и незаполненные места."""

import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).parent
LANGS = ["lv", "ru", "en"]

html = (ROOT / "index.html").read_text(encoding="utf-8")
used_text = set(re.findall(r'data-i18n="([^"]+)"', html))
used_tags = set(re.findall(r'data-tags="([^"]+)"', html))
used = used_text | used_tags

dicts = {}
for lang in LANGS:
    path = ROOT / "locales" / f"{lang}.json"
    try:
        dicts[lang] = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        print(f"FAIL  {path.name}: битый JSON — {exc}")
        sys.exit(1)

problems = []

for lang, d in dicts.items():
    for key in sorted(used - set(d)):
        problems.append(f"{lang}.json: нет ключа '{key}', который есть в index.html")
    for key in sorted(set(d) - used):
        problems.append(f"{lang}.json: ключ '{key}' нигде не используется")
    for key in sorted(used_tags & set(d)):
        if not isinstance(d[key], list):
            problems.append(f"{lang}.json: '{key}' должен быть списком строк")

todos = 0
for lang, d in dicts.items():
    for key, value in d.items():
        items = value if isinstance(value, list) else [value]
        for item in items:
            if isinstance(item, str) and "TODO:" in item:
                todos += 1
                print(f"TODO  {lang}.json → {key}: {item}")

# инструкции в верхнем комментарии сами содержат слово TODO — их не считаем
html_body = re.sub(r"(?s)<!--.*?-->", "", html)
for num, line in enumerate(html_body.splitlines(), 1):
    if "TODO:" in line:
        todos += 1
        print(f"TODO  index.html: {line.strip()}")

print()
for p in problems:
    print(f"FAIL  {p}")

if problems:
    print(f"\nОшибок: {len(problems)}")
    sys.exit(1)

print("OK    словари согласованы, ключи совпадают во всех трёх языках")
if todos:
    print(f"WARN  осталось заполнить: {todos} — публиковать рано")
    sys.exit(2)

print("OK    незаполненных мест нет, можно публиковать")
