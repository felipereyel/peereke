import express from 'express';
import { ec as EC } from 'elliptic';

import User from '../../model/user';

const ec = new EC('secp256k1');

export default async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { username, message, signature } = req.body;
    // message => 10 int array
    // signature => xy int array

    if (
      !(username && message && message instanceof Array && signature && signature instanceof Array)
    ) {
      res.status(400).send('username, message and signature are required');
      return;
    }

    const user = await User.findByUsername(username);
    if (!user) {
      res.status(400).send('Invalid Credentials');
    } else {
      const key = ec.keyFromPublic(user.pubkey, 'hex');
      const result = key.verify(message, signature);
      if (result) {
        res.status(200).json(await user.connectionInfo());
      } else {
        res.status(400).send('Invalid Credentials');
      }
    }
  } catch (err) {
    console.error(err);
  }
};
