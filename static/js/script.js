document.getElementById('scrape-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    fetch('/fetch_data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        const resultContainer = document.getElementById('result');
        const urnContainer = document.getElementById('urn');
        const normaDataContainer = document.getElementById('norma-data');

        if (result.error) {
            if (resultContainer) {
                resultContainer.textContent = `Error: ${result.error}`;
            }
        } else {
            if (resultContainer) {
                resultContainer.textContent = `Result: ${result.result}`;
            }

            if (urnContainer) {
                urnContainer.textContent = `URN: ${result.urn}`;
            }

            if (normaDataContainer) {
                const normaData = result.norma_data;
                normaDataContainer.innerHTML = `
                    <h2>Informazioni della Norma Visitata</h2>
                    <p><strong>Tipo atto:</strong> ${normaData.tipo_atto}</p>
                    <p><strong>Data:</strong> ${normaData.data}</p>
                    <p><strong>Numero atto:</strong> ${normaData.numero_atto}</p>
                    <p><strong>Numero articolo:</strong> ${normaData.numero_articolo}</p>
                    <p><strong>URL:</strong> <a href="${normaData.url}" target="_blank">${normaData.url}</a></p>
                `;
            }
        }
    })
    .catch(error => {
        const resultContainer = document.getElementById('result');
        if (resultContainer) {
            resultContainer.textContent = `Error: ${error}`;
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.number-input button').forEach(function(button) {
        button.addEventListener('click', function() {
            const input = button.parentNode.querySelector('input[type=number]');
            let currentValue = parseInt(input.value) || 0;
            console.log(`Current Value: ${currentValue}`); // Debugging line
            if (button.classList.contains('decrement')) {
                if (currentValue > 1) { // Imposta il minimo a 1
                    input.value = currentValue - 1;
                    console.log(`Decremented to: ${input.value}`); // Debugging line
                }
            } else if (button.classList.contains('increment')) {
                input.value = currentValue + 1;
                console.log(`Incremented to: ${input.value}`); // Debugging line
            }
            input.focus();
            input.dispatchEvent(new Event('input'));
        });
    });
});
