document.getElementById('scrape-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    const loadingElement = document.getElementById('loading');
    loadingElement.style.display = 'block';

    fetch('/fetch_norm', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        loadingElement.style.display = 'none';
        const normaDataContainer = document.getElementById('norma-data');
        const resultContainer = document.getElementById('result');

        if (result.error) {
            resultContainer.textContent = `Error: ${result.error}`;
        } else {
            const normaData = result.norma_data;
            normaDataContainer.innerHTML = `
                <h2>Informazioni della Norma Visitata</h2>
                <p><strong>Tipo atto:</strong> ${normaData.tipo_atto}</p>
                <p><strong>Data:</strong> ${normaData.data}</p>
