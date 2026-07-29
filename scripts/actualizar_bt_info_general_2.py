import requests
import json

token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZGRkN2YwYy0zOWQ2LTQwY2UtODg2Ny1lZWVkZDRiNjgwZTgiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzgxNTk5NTg1fQ.jJHqTRqm1nt_zlTErfcRnBGsAiE5faEwDeUmJBIcP74'
headers = {'X-N8N-API-KEY': token, 'Accept': 'application/json'}

with open('.tmp/BT_info_general.json', 'r', encoding='utf-8') as f:
    workflow = json.load(f)

payload = {
    'name': workflow.get('name'),
    'nodes': workflow.get('nodes', []),
    'connections': workflow.get('connections', {}),
    'settings': workflow.get('settings', {}),
    'staticData': workflow.get('staticData', None),
    'meta': workflow.get('meta', {}),
    'tags': workflow.get('tags', [])
}

conns = payload['connections']
if 'extrae_info' in conns and 'main' in conns['extrae_info'] and len(conns['extrae_info']['main']) > 0:
    conns['extrae_info']['main'][0] = [c for c in conns['extrae_info']['main'][0] if c['node'] != 'structura_resp']

if 'Message a model' in conns and 'main' in conns['Message a model'] and len(conns['Message a model']['main']) > 0:
    conns['Message a model']['main'][0] = [c for c in conns['Message a model']['main'][0] if c['node'] != 'structura_resp1']

new_nodes = [
    {
      'name': 'Preparar_Revision',
      'type': 'n8n-nodes-base.code',
      'typeVersion': 2,
      'position': [ 700, 480 ],
      'parameters': {
        'jsCode': 'const inputJson = $input.first().json;\nlet content = \'\';\nif (inputJson.choices && inputJson.choices[0] && inputJson.choices[0].message) {\n  content = inputJson.choices[0].message.content;\n} else if (inputJson.message && inputJson.message.content) {\n  content = inputJson.message.content;\n} else {\n  content = JSON.stringify(inputJson);\n}\nreturn { json: { transcripcion: content } };'
      }
    },
    {
      'name': 'WhatsApp Formulario',
      'type': 'n8n-nodes-base.whatsApp',
      'typeVersion': 1.1,
      'position': [ 900, 480 ],
      'parameters': {
        'operation': 'text', 
        'phoneNumberId': '1169611772892016',
        'recipientPhoneNumber': "={{ $('When Executed by Another Workflow').first().json.phone_number }}",
        'text': "=Hola, hemos procesado la factura. Por favor revisa y aprueba la transcripción aquí:\n\n{{ $resumeWebhookUrl }}"
      },
      'credentials': {
        'whatsAppApi': {
          'id': '4K7SCrJix7ZmSRub',
          'name': 'WhatsApp account'
        }
      }
    },
    {
      'name': 'Wait Formulario',
      'type': 'n8n-nodes-base.wait',
      'typeVersion': 1.1,
      'position': [ 1100, 480 ],
      'parameters': {
        'resume': 'form',
        'formTitle': 'Validación de Factura',
        'formDescription': "=Revisa si la transcripción es correcta:\n\n{{ $('Preparar_Revision').first().json.transcripcion }}",
        'formFields': {
          'values': [
            {
              'fieldLabel': 'EsCorrecta',
              'fieldType': 'boolean',
              'requiredField': True
            },
            {
              'fieldLabel': 'Correcciones',
              'fieldType': 'textarea'
            }
          ]
        },
        'options': {}
      }
    },
    {
      'name': 'IF Aprobado',
      'type': 'n8n-nodes-base.if',
      'typeVersion': 1,
      'position': [ 1300, 480 ],
      'parameters': {
        'conditions': {
          'boolean': [
            {
              'value1': "={{ $json.EsCorrecta }}",
              'value2': True
            }
          ]
        }
      }
    },
    {
      'name': 'Restaurar Formato',
      'type': 'n8n-nodes-base.set',
      'typeVersion': 1,
      'position': [ 1500, 350 ],
      'parameters': {
        'keepOnlySet': True,
        'values': {
          'string': [
            {
              'name': 'choices[0].message.content',
              'value': "={{ $('Preparar_Revision').first().json.transcripcion }}"
            }
          ]
        },
        'options': {}
      }
    },
    {
      'name': 'LLM Correccion',
      'type': '@n8n/n8n-nodes-langchain.openAi',
      'typeVersion': 1.2,
      'position': [ 1500, 600 ],
      'parameters': {
        'resource': 'chat',
        'operation': 'message',
        'prompt': {
          'messages': [
            {
              'role': 'system',
              'content': 'Eres un asistente que corrige transcripciones de facturas en formato JSON. Se te proporcionará la transcripción original y las correcciones del usuario. Devuelve ÚNICAMENTE el JSON corregido, sin bloques de código.'
            },
            {
              'role': 'user',
              'content': "=Transcripción original:\n{{ $('Preparar_Revision').first().json.transcripcion }}\n\nCorrecciones del usuario:\n{{ $json.Correcciones }}"
            }
          ]
        },
        'model': 'gpt-4o',
        'options': {}
      },
      'credentials': {
        'openAiApi': {
          'id': 'ZeagSVvuyp06h0Np',
          'name': 'OpenAi Sabri account'
        }
      }
    }
]

for new_node in new_nodes:
    payload['nodes'].append(new_node)

if 'extrae_info' not in conns: conns['extrae_info'] = {'main': [[]]}
conns['extrae_info']['main'][0].append({'node': 'Preparar_Revision', 'type': 'main', 'index': 0})

if 'Message a model' not in conns: conns['Message a model'] = {'main': [[]]}
conns['Message a model']['main'][0].append({'node': 'Preparar_Revision', 'type': 'main', 'index': 0})

conns['Preparar_Revision'] = { 'main': [[ {'node': 'WhatsApp Formulario', 'type': 'main', 'index': 0} ]] }
conns['WhatsApp Formulario'] = { 'main': [[ {'node': 'Wait Formulario', 'type': 'main', 'index': 0} ]] }
conns['Wait Formulario'] = { 'main': [[ {'node': 'IF Aprobado', 'type': 'main', 'index': 0} ]] }

conns['IF Aprobado'] = {
    'main': [
        [ {'node': 'Restaurar Formato', 'type': 'main', 'index': 0} ],
        [ {'node': 'LLM Correccion', 'type': 'main', 'index': 0} ]
    ]
}

conns['LLM Correccion'] = { 'main': [[ {'node': 'Preparar_Revision', 'type': 'main', 'index': 0} ]] }

conns['Restaurar Formato'] = {
    'main': [
        [ 
            {'node': 'structura_resp', 'type': 'main', 'index': 0},
            {'node': 'structura_resp1', 'type': 'main', 'index': 0}
        ]
    ]
}

res = requests.put(f"https://dfn8n.sistemadistribuidorafenix.com/api/v1/workflows/{workflow['id']}", headers=headers, json=payload)
print(res.status_code)
if res.status_code != 200:
    print(res.text)
