import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

app.get('/', (_, res) => res.send('OK'));
app.listen(port, () => console.log(`Listening on port ${port}`));
