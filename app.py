from flask import Flask, render_template, request, jsonify
from tools import sys_op
from tools.BrocardiScraper import BrocardiScraper

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/fetch_norm', methods=['POST'])
def fetch_data():
    try:
        data = request.get_json()
        act_type = data['act_type']
        date = data['date']
        act_number = data['act_number']
        article = data['article']
        version = data['version']
        version_date = data['version_date']
        comma = data['comma']
        
        result_data, urn, norma = sys_op.get_urn_and_extract_data(act_type, date, act_number, article, None, comma, version, version_date)
        
        norma_data = {
            'tipo_atto': norma.tipo_atto_str,
            'data': norma.data,
            'numero_atto': norma.numero_atto,
            'numero_articolo': norma.numero_articolo,
            'url': norma.url
        }
        
        response = {
            'result': result_data,
            'urn': urn,
            'norma_data': norma_data
        }
        
        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/fetch_tree', methods=['POST'])
def fetch_tree():
    try:
        data = request.get_json()
        urn = data['urn']
        tree, _ = sys_op.get_tree(urn, link=False)
        
        return jsonify({'tree': tree})
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)
