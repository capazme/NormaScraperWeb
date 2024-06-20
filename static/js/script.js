/*******************************
 * PARTE 1: GESTIONE DELLA SOTTOMISSIONE DEL FORM
 *******************************/
let lastUrn = ''; // Variabile per memorizzare l'URN ottenuto

document.getElementById('scrape-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = {};
    formData.forEach((value, key) => {
        if (key === 'article') {
            value = value.replace(/\s+/g, '');
        }
        data[key] = value;
    });

    setLoading(true);

    fetch('/fetch_norm', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        setLoading(false);

        const normaDataContainer = document.getElementById('norma-data');
        const resultContainer = document.getElementById('result');

        if (result.error) {
            handleError(result.error, resultContainer);
        } else {
            const normaData = result.norma_data;
            normaDataContainer.innerHTML = `
                <h2>Informazioni della Norma Visitata</h2>
                <p><strong>Tipo atto:</strong> ${normaData.tipo_atto}</p>
                <p><strong>Data:</strong> ${normaData.data}</p>
                <p><strong>Numero atto:</strong> ${normaData.numero_atto}</p>
                <p><strong>Numero articolo:</strong> ${normaData.numero_articolo}</p>
                <p><strong>URL:</strong> <a href="${normaData.url}" target="_blank">${normaData.url}</a></p>
            `;
            resultContainer.textContent = `Result: ${result.result}`;

            lastUrn = result.urn; // Memorizza l'URN ottenuto

            if (lastFetchedUrl !== normaData.url) {
                lastFetchedUrl = normaData.url;
                fetchTree(normaData.url);
            }
        }
    })
    .catch(error => {
        setLoading(false);
        handleError(error, document.getElementById('result'));
    });
});

/*******************************
 * PARTE 2: GESTIONE DEGLI ARTICOLI E URL
 *******************************/
let articleTree = [];
let lastFetchedUrl = '';

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
            handleError(result.error);
        } else {
            const tree = result.tree;
            setArticleTree(tree);
        }
    })
    .catch(error => {
        handleError(error);
    });
}

function setArticleTree(tree) {
    articleTree = tree;
    console.log(articleTree);
}

/*******************************
 * PARTE 3: GESTIONE DEGLI EVENTI DEL DOM
 *******************************/
document.addEventListener('DOMContentLoaded', function() {
    const decrementButton = document.querySelector('.decrement');
    const incrementButton = document.querySelector('.increment');
    const articleInput = document.getElementById('article');
    const actTypeInput = document.getElementById('act_type');
    const versionVigente = document.getElementById('vigente');
    const versionOriginale = document.getElementById('originale');
    const versionDateInput = document.getElementById('version_date');
    const viewPdfButton = document.getElementById('view-pdf');
    const pdfFrame = document.getElementById('pdf-frame');
    const downloadPdfButton = document.getElementById('download-pdf');

    function initializeVersionDateInput() {
        if (versionVigente.checked) {
            versionDateInput.disabled = false;
            versionDateInput.style.opacity = 1;
        } else {
            versionDateInput.disabled = true;
            versionDateInput.style.opacity = 0.5;
        }
    }

    versionVigente.addEventListener('change', function() {
        if (versionVigente.checked) {
            versionDateInput.disabled = false;
            versionDateInput.style.opacity = 1;
        }
    });

    versionOriginale.addEventListener('change', function() {
        if (versionOriginale.checked) {
            versionDateInput.disabled = true;
            versionDateInput.style.opacity = 0.5;
            versionDateInput.value = '';
        }
    });

    initializeVersionDateInput(); // Inizializza lo stato del campo alla prima visualizzazione della pagina

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
            articleInput.dispatchEvent(new Event('input'));
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
            articleInput.dispatchEvent(new Event('input'));
        });
    }

    viewPdfButton.addEventListener('click', function() {
        if (!lastUrn) {
            alert('Per favore completa prima una ricerca.');
            return;
        }

        setLoading(true);

        fetch('/export_pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ urn: lastUrn })
        })
        .then(response => response.blob())
        .then(blob => {
            setLoading(false);

            const pdfUrl = URL.createObjectURL(blob);
            pdfFrame.src = pdfUrl;
            pdfFrame.style.display = 'block';
            downloadPdfButton.style.display = 'block';

            downloadPdfButton.addEventListener('click', function() {
                const a = document.createElement('a');
                a.href = pdfUrl;
                a.download = 'norma.pdf';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            });
        })
        .catch(error => {
            setLoading(false);
            handleError(error, document.getElementById('result'));
        });
    });

    function incrementArticle(article) {
        if (!validateArticleInput(article)) {
            return articleTree[0]; // Reset to the beginning if input is invalid
        }
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
        if (!validateArticleInput(article)) {
            return articleTree[articleTree.length - 1]; // Set to the end if input is invalid
        }
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

/*******************************
 * FUNZIONI DI SUPPORTO
 *******************************/
function handleError(error, messageContainer) {
    console.error('Error:', error);
    if (messageContainer) {
        messageContainer.textContent = `Error: ${error.message || error}`;
    } else {
        alert(`Error: ${error.message || error}`);
    }
}

function setLoading(isLoading) {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = isLoading ? 'block' : 'none';
    }
}

function validateArticleInput(article) {
    if (!article || !articleTree.includes(article)) {
        alert('Articolo non valido. Per favore inserisci un articolo valido.');
        return false;
    }
    return true;
}
