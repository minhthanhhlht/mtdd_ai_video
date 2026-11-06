"""Validate skill references, portable asset imports and optional manifest hashes."""
import argparse, json, re, hashlib
from pathlib import Path

p = argparse.ArgumentParser()
p.add_argument('skill', type=Path)
a = p.parse_args()
root = a.skill.resolve()
errors = []
skill = root / 'SKILL.md'

text = skill.read_text(encoding='utf8')
if not text.startswith('---\n') or 'name: edit-agency-kinetic-v1' not in text:
    errors.append('Invalid frontmatter in SKILL.md')

for f in root.rglob('*.md'):
    t = f.read_text(encoding='utf8')
    for target in re.findall(r'\[[^\]]*\]\(([^)]+)\)', t):
        if '://' in target or target.startswith('#'):
            continue
        path = (f.parent / target.split('#')[0]).resolve()
        if not path.exists():
            errors.append(f'Missing reference {f.relative_to(root)} -> {target}')

for f in (root / 'assets/remotion-starter/src').glob('*.tsx'):
    t = f.read_text(encoding='utf8')
    if re.search(r'[A-Za-z]:[/\\](?:Users|Codex-Video)', t):
        errors.append('Machine path in ' + str(f))
    for imp in re.findall(r"from ['\"](\.[^'\"]+)['\"]", t):
        if imp.endswith('.css'):
            continue
        base = f.parent / imp
        if not any(Path(str(base) + ext).exists() for ext in ['', '.tsx', '.ts', '.json', '.js']):
            errors.append('Missing import ' + imp + ' in ' + str(f))

manifest = root / 'manifest.json'
if manifest.exists():
    m = json.loads(manifest.read_text(encoding='utf8'))
    for name, digest in m.get('sha256', {}).items():
        f = root / name
        if not f.is_file() or hashlib.sha256(f.read_bytes()).hexdigest() != digest:
            errors.append('Hash mismatch ' + name)

total_files = sum(f.is_file() for f in root.rglob('*'))
print(json.dumps({'files': total_files, 'errors': errors}, indent=2))
raise SystemExit(bool(errors))

