from flask import Flask, render_template, request, jsonify
from tools import sys_op
from tools.BrocardiScraper import BrocardiScraper

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/extract', methods=['POST'])
def extract():
    act_type = request.form['act_type']
    date = request.form['date']
    act_number = request.form['act_number']
    article = request.form['article']
    version = request.form['version']
    version_date = request.form['version_date']
    comma = request.form['comma']
    
    data, urn, norma = sys_op.get_urn_and_extract_data(act_type, date, act_number, article, None, comma, version, version_date)
    
    # Estrarre solo le informazioni necessarie
    norma_data = {
        'tipo_atto': norma.tipo_atto_str,
        'data': norma.data,
        'numero_atto': norma.numero_atto,
        'numero_articolo': norma.numero_articolo,
        'url': norma.url
    }
    
    return render_template('index.html', data=data, urn=urn, norma_data=norma_data)

@app.route('/fetch_data', methods=['POST'])
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
        
        # Estrarre solo le informazioni necessarie
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

if __name__ == '__main__':
    app.run(debug=True)
