import express from 'express';

import User from '../../model/user';

const isPub = (obj: any) => {
  if (!(typeof obj === 'object')) return false;
  return obj.x && obj.y && typeof obj.x === 'string' && typeof obj.y === 'string';
};

export default async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { username, pubkey } = req.body;

    if (!(username && pubkey && isPub(pubkey))) {
      res.status(400).send('username and pubkey are required');
      return;
    }

    const oldUser = await User.findByUsername(username);

    if (oldUser) {
      res.status(409).send('User Already Exist. Please Login');
      return;
    }

    const user = await User.create(username, pubkey);
    res.status(201).json({ token: user.token });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
