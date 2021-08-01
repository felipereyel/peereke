import express from 'express';
import cors from 'cors';
import { ExpressPeerServer } from 'peer';

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());
const server = app.listen(port, () => console.log(`Listening on port ${port}`));

const peerServer = ExpressPeerServer(server, {
  allow_discovery: true,
});

app.use('/', peerServer);
