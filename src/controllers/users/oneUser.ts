import express from 'express';
import User from '../../model/user';

export default async (req: express.Request, res: express.Response): Promise<void> => {
  const user = await User.oneUser(req.params.id);
  if (user) {
    res.send({ user });
  } else {
    res.status(404).send({ user });
  }
};
