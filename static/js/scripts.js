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
        if (result.error) {
            document.getElementById('result').textContent = `Error: ${result.error}`;
        } else {
            document.getElementById('result').textContent = JSON.stringify(result, null, 2);
        }
    })
    .catch(error => {
        document.getElementById('result').textContent = `Error: ${error}`;
    });
});
