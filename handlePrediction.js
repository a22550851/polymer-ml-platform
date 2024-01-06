document.getElementById('calculateButton').addEventListener('click', function() {
    const donorsmiles = document.getElementById('donorsmiles').value;
    const acceptorsmiles = document.getElementById('acceptorsmiles').value;

    fetch('http://34.123.177.193/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            donorsmiles: donorsmiles,
            acceptorsmiles: acceptorsmiles
        })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('result').textContent = '结果: ' + data.result;
    })
    .catch(error => console.error('错误:', error));
});
