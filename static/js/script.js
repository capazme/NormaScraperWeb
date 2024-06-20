document.getElementById('scrape-form').addEventListener('submit', function(e) {
    e.preventDefault(); // Previene il comportamento predefinito del form (refresh della pagina)

    const formData = new FormData(e.target); // Crea un oggetto FormData con i dati del form
    const data = {};
    formData.forEach((value, key) => {
        if (key === 'article') {
            value = value.replace(/\s+/g, ''); // Rimuove gli spazi dall'articolo
        }
        data[key] = value; // Aggiunge i dati al nuovo oggetto
    });

    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = 'block'; // Mostra l'elemento di caricamento
    }

    // Invia i dati al server con una richiesta POST
    fetch('/fetch_norm', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (loadingElement) {
            loadingElement.style.display = 'none'; // Nasconde l'elemento di caricamento
        }
        const normaDataContainer = document.getElementById('norma-data');
        const resultContainer = document.getElementById('result');

        if (result.error) {
            resultContainer.textContent = `Error: ${result.error}`; // Mostra un messaggio di errore
        } else {
            const normaData = result.norma_data;
            // Mostra i dati della norma nel DOM
            normaDataContainer.innerHTML = `
                <h2>Informazioni della Norma Visitata</h2>
                <p><strong>Tipo atto:</strong> ${normaData.tipo_atto}</p>
                <p><strong>Data:</strong> ${normaData.data}</p>
                <p><strong>Numero atto:</strong> ${normaData.numero_atto}</p>
                <p><strong>Numero articolo:</strong> ${normaData.numero_articolo}</p>
                <p><strong>URL:</strong> <a href="${normaData.url}" target="_blank">${normaData.url}</a></p>
            `;
            resultContainer.textContent = `Result: ${result.result}`;

            // Controlla se la nuova URL è diversa dall'ultima cercata
            if (lastFetchedUrl !== normaData.url) {
                lastFetchedUrl = normaData.url; // Aggiorna l'ultima URL cercata
                fetchTree(normaData.url); // Chiama la funzione per ottenere l'albero degli articoli
            }
        }
    })
    .catch(error => {
        if (loadingElement) {
            loadingElement.style.display = 'none'; // Nasconde l'elemento di caricamento in caso di errore
        }
        const resultContainer = document.getElementById('result');
        resultContainer.textContent = `Error: ${error}`; // Mostra un messaggio di errore
    });
});

let articleTree = [];
let lastFetchedUrl = ''; // Variabile per tenere traccia dell'ultima URL cercata

function fetchTree(urn) {
    fetch('/fetch_tree', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ urn: urn })
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            console.error(result.error); // Log dell'errore
        } else {
            const tree = result.tree;
            setArticleTree(tree); // Imposta l'albero degli articoli
        }
    })
    .catch(error => {
        console.error('Error fetching tree:', error); // Log dell'errore
    });
}

function setArticleTree(tree) {
    articleTree = tree; // Mantiene tutti gli articoli come ricevuti dal backend
    console.log(articleTree); // Per debug
}


document.addEventListener('DOMContentLoaded', function() {
    const decrementButton = document.querySelector('.decrement');
    const incrementButton = document.querySelector('.increment');
    const articleInput = document.getElementById('article');
    const actTypeInput = document.getElementById('act_type');

    if (decrementButton && incrementButton && articleInput) {
        decrementButton.addEventListener('click', function() {
            if (!actTypeInput.value) {
                alert('Per favore inserisci il tipo di atto prima di cambiare articolo.');
                return;
            }
            let currentValue = articleInput.value;
            currentValue = decrementArticle(currentValue);
            articleInput.value = currentValue;
            articleInput.focus();
            articleInput.dispatchEvent(new Event('input')); // Triggera l'evento input
        });

        incrementButton.addEventListener('click', function() {
            if (!actTypeInput.value) {
                alert('Per favore inserisci il tipo di atto prima di cambiare articolo.');
                return;
            }
            let currentValue = articleInput.value;
            currentValue = incrementArticle(currentValue);
            articleInput.value = currentValue;
            articleInput.focus();
            articleInput.dispatchEvent(new Event('input')); // Triggera l'evento input
        });
    }

    function incrementArticle(article) {
        let index = articleTree.indexOf(article);
        if (index < 0) {
            index = 0;
        } else if (index < articleTree.length - 1) {
            index++;
        } else {
            index = 0; // Reset to the beginning
        }
        return articleTree[index];
    }

    function decrementArticle(article) {
        let index = articleTree.indexOf(article);
        if (index < 0) {
            index = 0;
        } else if (index > 0) {
            index--;
        } else {
            index = articleTree.length - 1; // Set to the end
        }
        return articleTree[index];
    }
});
