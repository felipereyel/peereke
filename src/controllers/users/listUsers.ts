import express from 'express';
import User from '../../model/user';

export default async (req: express.Request, res: express.Response): Promise<void> => {
  res.send(await User.listActiveUsers());
};
