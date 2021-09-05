import express from 'express';
import cors from 'cors';
import { ExpressPeerServer } from 'peer';

import users from './controllers/users';
import auth from './middleware/auth';

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());
const server = app.listen(port, () => console.log(`Listening on port ${port}`));

const peerServer = ExpressPeerServer(server, {
  key: process.env.SECRET,
  allow_discovery: true,
});

app.get('/hello', auth, (req, res) => res.send(`Hello There ${res.locals.user.username}`));
app.use('/users', users);

app.use('/peer', peerServer);
