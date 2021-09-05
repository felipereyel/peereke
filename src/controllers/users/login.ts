import express from 'express';
import bcrypt from 'bcryptjs';

import User from '../../model/user';

export default async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!(username && password)) {
      res.status(400).send('username and password are required');
      return;
    }

    const user = await User.findByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      res.status(200).json(await user.connectionInfo());
    } else {
      res.status(400).send('Invalid Credentials');
    }
  } catch (err) {
    console.error(err);
  }
};
