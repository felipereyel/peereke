import express from 'express';
import cors from 'cors';
import { ExpressPeerServer } from 'peer';

import register from './controllers/register';
import login from './controllers/login';
import auth from './middleware/auth';
// import listUsers from './controllers/listUsers';

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());
const server = app.listen(port, () => console.log(`Listening on port ${port}`));

const peerServer = ExpressPeerServer(server, {
  key: process.env.SECRET,
  allow_discovery: false,
});

app.use('/peer', peerServer);

app.post('/register', register);
app.post('/login', login);
app.get('/hello', auth, (req: express.Request, res: express.Response) => res.send('Hello There'));
// app.get('/users', auth, listUsers);
