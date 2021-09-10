import express from 'express';
import jwt from 'jsonwebtoken';
import User, { PublicUserDTO } from '../model/user';

export default async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.body.token || req.query.token || req.headers['authorization'];

  if (!token) {
    return res.status(403).send('unauthorized');
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY as string);
    res.locals.user = await User.fromPayload(decoded as PublicUserDTO);
  } catch (err) {
    return res.status(401).send('Invalid Token: ' + err.message);
  }

  return next();
};
