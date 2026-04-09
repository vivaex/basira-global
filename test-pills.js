const fetch = require('node-fetch');

async function testPills() {
  try {
    const res = await fetch('http://localhost:3000/api/generate-pills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        weakAreas: [{ category: 'memory', score: 40, title: 'الذاكرة السمعية' }],
        parentStats: { focus: 30, listening: 50 },
        emotionalStats: { frustration: 2, impulsivity: 5, focusLoss: 10 }
      })
    });
    
    if(!res.ok) {
       console.log('Error status:', res.status);
       const text = await res.text();
       console.log('Response:', text);
       return;
    }
    
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Fetch Error:', err);
  }
}

testPills();
