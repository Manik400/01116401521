const express = require('express');
const axios = require('axios');
const https = require('https');

const app = express();
const port = 9876;
const windowSize = 10;
let numbers = [];
let windowPrevState = [];
const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzIwNzAzNzk5LCJpYXQiOjE3MjA3MDM0OTksImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImE3OWFiYTZmLTYzM2QtNDg1Yy1hZDc1LTdhYjY3MjhjNmIzZSIsInN1YiI6Im1hbmlrZ295YWw0MDBAZ21haWwuY29tIn0sImNvbXBhbnlOYW1lIjoiZ29NYXJ0IiwiY2xpZW50SUQiOiJhNzlhYmE2Zi02MzNkLTQ4NWMtYWQ3NS03YWI2NzI4YzZiM2UiLCJjbGllbnRTZWNyZXQiOiJVTldZV0JmUHdGTkxzUUtQIiwib3duZXJOYW1lIjoiTWFuaWsiLCJvd25lckVtYWlsIjoibWFuaWtnb3lhbDQwMEBnbWFpbC5jb20iLCJyb2xsTm8iOiIwMTExNjQwMTUyMSJ9.zRDPT8m0UvHeOOVHtk_lsMKM_XFiW6xDjpqjewECf8E';  

app.get('/', (req, res) => {
  res.send('Welcome to the Average Calculator microservice. Use /numbers/:numberid to get numbers.');
});

app.get('/numbers/:numberid', async (req, res) => {
  let numberId = req.params.numberid;
  console.log(numberId);
  switch (numberId) {
    case 'p':
      numberId = 'primes';
      break;
    case 'e':
      numberId = 'even';
      break;
    case 'f':
      numberId = 'fibo';
      break;
    case 'r':
      numberId = 'rand';
      break;
    default:
      return res.status(400).json({ error: 'Invalid number id' });
  }

  // Create an HTTPS agent that ignores self-signed certificates
  const httpsAgent = new https.Agent({ rejectUnauthorized: false });

  // Fetch numbers from the test server
  try {
    const response = await axios.get(`https://20.244.56.144/test/${numberId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      httpsAgent  // Pass the agent to Axios
    });

    console.log(response.data);  // Log the response data for debugging
    
    const newNumbers = response.data.numbers;  // Assuming the API returns numbers in this format
    
    if (!newNumbers) {
      return res.status(500).json({ error: 'Invalid response from the test server' });
    }

    // Ensure stored numbers are unique
    newNumbers.forEach(num => {
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    });

    // Update window states
    windowPrevState = [...numbers];

    if (numbers.length > windowSize) {
      numbers = numbers.slice(-windowSize);
    }

    // Calculate the average
    const avg = numbers.reduce((acc, num) => acc + num, 0) / numbers.length;

    // Prepare response
    const responseData = {
      windowPrevState,
      windowCurrState: numbers,
      numbers: newNumbers,
      avg: avg.toFixed(2),
    };

    res.json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching numbers from the test server' });
  }
});

app.listen(port, () => {
  console.log(`Average Calculator microservice is running on http://localhost:${port}`);
});
