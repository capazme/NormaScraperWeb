from flask import Flask, render_template, request, jsonify
import os
import sys
import json
import requests
import threading
import pyperclip
from tools import sys_op
from tools.BrocardiScraper import BrocardiScraper

app = Flask(__name__)
brocardi = BrocardiScraper()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/fetch_data', methods=['POST'])
def fetch_data():
    data = request.json
    act_type = data.get('act_type')
    date = data.get('date')
    act_number = data.get('act_number')
    article = data.get('article')
    version = data.get('version')
    version_date = data.get('version_date')
    comma = data.get('comma')
    
    # Simulate the logic of your application
    try:
        result = sys_op.get_urn_and_extract_data(
            act_type=act_type,
            date=date,
            act_number=act_number,
            article=article,
            comma=comma,
            version=version,
            version_date=version_date
        )[0]
        print(result)
        return jsonify(result=result)
    except Exception as e:
        return jsonify(error=str(e)), 500

if __name__ == '__main__':
    app.run(debug=True)
