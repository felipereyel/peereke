import express from 'express';
import bcrypt from 'bcryptjs';

import User from '../model/user';

export default async (req: express.Request, res: express.Response) => {
  try {
    const { username, password } = req.body;

    if (!(username && password)) {
      return res.status(400).send('username and password are required');
    }

    const oldUser = await User.findByUsername(username);

    if (oldUser) {
      return res.status(409).send('User Already Exist. Please Login');
    }

    const encryptedPassword = await bcrypt.hash(password, 10);
    const user = await User.create(username, encryptedPassword);

    res.status(201).json(await user.connectionInfo());
  } catch (err) {
    console.log(err);
  }
};
