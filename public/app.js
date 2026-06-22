document.getElementById('ping').addEventListener('click', async () => {
  const output = document.getElementById('output');
  output.textContent = 'Loading...';
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    output.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    output.textContent = 'Error: ' + err.message;
  }
});
