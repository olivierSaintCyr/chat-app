import express from 'express';

const app = express();

app.get('/', (req, res) => {
    res.send('Hello World! welcome to user api');
});

const PORT = 8080;
app.listen(PORT, () => console.log('Conversation api is listenning on port: ${PORT}`));