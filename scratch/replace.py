import sys

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

with open('dashboard_block.txt', 'r', encoding='utf-8-sig') as f:
    old_block = f.read()

with open('new_dashboard.txt', 'r', encoding='utf-8-sig') as f:
    new_block = f.read()

content = content.replace('\r\n', '\n')
old_block = old_block.replace('\r\n', '\n')
new_block = new_block.replace('\r\n', '\n')

if old_block in content:
    new_content = content.replace(old_block, new_block)
    with open('src/App.jsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("SUCCESS")
else:
    print("FAILED TO FIND BLOCK")
