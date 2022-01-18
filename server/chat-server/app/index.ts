import express from 'express';

const app = express();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

const PORT = 8080;
app.listen(PORT, () => console.log(`Chat server listenning on port: ${PORT}`))