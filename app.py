from flask import Flask, render_template, request, jsonify, send_file
from tools import sys_op
import base64
import os

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
        version_date = data.get('version_date')  # Usa get per gestire il caso in cui version_date non sia presente
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
        urn = data['urn'].split('~')[0]  # Rimuove tutto dopo il simbolo "~"
        tree, _ = sys_op.get_tree(urn, link=False)
        
        return jsonify({'tree': tree})
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/export_pdf', methods=['POST'])
def export_pdf():
    try:
        data = request.get_json()
        urn = data['urn']
        
        download_dir = os.path.join(os.getcwd(), "download")
        if not sys_op.drivers:
            driver = sys_op.setup_driver(download_dir)
        else:
            driver = sys_op.drivers[0]
        
        pdf_path = sys_op.extract_pdf(driver, urn, 30)
        
        if not pdf_path:
            raise ValueError("Errore nella generazione del PDF")
        
        return send_file(pdf_path, as_attachment=True)
    except Exception as e:
        return jsonify({'error': str(e)})
    finally:
        sys_op.close_driver()

if __name__ == '__main__':
    app.run(debug=True)
