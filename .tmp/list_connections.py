import json

with open('.tmp/BT_info_general.json', 'r', encoding='utf-8') as f:
    d = json.load(f)
    print('CONNECTIONS BT_info_general:')
    for node_from, connections in d.get('connections', {}).items():
        for conn_type, targets in connections.items():
            for target in targets:
                for t in target:
                    print(f"{node_from} -> {t['node']}")

print('\n')

with open('.tmp/facturas.json', 'r', encoding='utf-8') as f:
    d = json.load(f)
    print('CONNECTIONS facturas:')
    for node_from, connections in d.get('connections', {}).items():
        for conn_type, targets in connections.items():
            for target in targets:
                for t in target:
                    print(f"{node_from} -> {t['node']}")
