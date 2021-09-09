import express from 'express';
import User from '../../model/user';

export default async (req: express.Request, res: express.Response): Promise<void> => {
  if (await User.oneUser(req.params.id)) {
    res.send('user exists');
  } else {
    res.status(404).send('user does not exist');
  }
};
