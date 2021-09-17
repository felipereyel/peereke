import express from 'express';
import User, { PublicUserDTO } from '../../model/user';

let users: PublicUserDTO[] = [];
setInterval(() => {
  User.allUsers()
    .then(r => users = r)
    .catch(console.error)
}, 500);

export default async (req: express.Request, res: express.Response): Promise<void> => {
  res.send({ users });
};
