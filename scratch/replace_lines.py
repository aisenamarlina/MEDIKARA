import sys

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = 1602  # 0-indexed for line 1603
end_idx = 1821    # 0-indexed for line 1822

with open('new_dashboard.txt', 'r', encoding='utf-8-sig') as f:
    new_block = f.read()

# Make sure new_block ends with newline
if not new_block.endswith('\n'):
    new_block += '\n'

new_lines = lines[:start_idx] + [new_block] + lines[end_idx:]

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print("SUCCESS")
