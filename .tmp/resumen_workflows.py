import json

with open('.tmp/facturas.json', 'r', encoding='utf-8') as f:
    d = json.load(f)
    print('FACTURAS NODES:')
    for n in d.get('nodes', []):
        print(f"- {n['name']} ({n['type']})")

with open('.tmp/BT_info_general.json', 'r', encoding='utf-8') as f:
    d = json.load(f)
    print('\nBT_INFO_GENERAL NODES:')
    for n in d.get('nodes', []):
        print(f"- {n['name']} ({n['type']})")
