import express from 'express';
import bcrypt from 'bcryptjs';

import User from '../model/user';

export default async (req: express.Request, res: express.Response) => {
  try {
    const { username, password } = req.body;

    if (!(username && password)) {
      return res.status(400).send('username and password are required');
    }

    const user = await User.findByUsername(username);

    if (user && (await bcrypt.compare(password, user.password))) {
      return res.status(200).json(await user.connectionInfo());
    }
    return res.status(400).send('Invalid Credentials');
  } catch (err) {
    console.error(err);
  }
};
