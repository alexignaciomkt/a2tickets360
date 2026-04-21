async function run() {
  try {
    const response = await fetch('https://s3.a2tickets360.com.br/a2tickets360/logo.png', {
      method: 'PUT',
      body: 'test image data',
      headers: {
        'Content-Type': 'image/png'
      }
    });
    console.log(response.status, response.statusText);
    const text = await response.text();
    console.log(text);
  } catch (e) {
    console.log(e);
  }
}
run();
