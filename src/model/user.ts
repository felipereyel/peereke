import { v4 as uuidv4 } from 'uuid';
import { client } from '../config/client';
import jwt from 'jsonwebtoken';

type UserDTO = {
  username: string;
  connection_id: string;
  password: string;
};

export type UserAuth = {
  username: string;
  connectionId: string;
};

export default class User {
  username: string;
  password: string;
  connectionId: string;

  static async create(username: string, password: string): Promise<User> {
    const connectionId = uuidv4();
    const [user] = (await client.query(
      'INSERT INTO users(username, password, connection_id) values ($1, $2, $3) RETURNING *',
      [username, password, connectionId],
    )) as UserDTO[];
    if (!user) throw new Error('could not create user');
    return new User(user.username, user.password, user.connection_id);
  }

  static async findByUsername(username: string): Promise<User | null> {
    const [user] = (await client.query('SELECT * FROM users where username = $1', [
      username,
    ])) as UserDTO[];
    if (!user) return null;
    return new User(user.username, user.password, user.connection_id);
  }

  static async fromPayload(payload: UserAuth): Promise<User> {
    const user = await User.findByUsername(payload.username);
    if (!user) throw new Error('could not find user');
    if (user.connectionId !== payload.connectionId) throw new Error('outdated token');
    return user;
  }

  constructor(username: string, password: string, connectionId: string) {
    this.username = username;
    this.password = password;
    this.connectionId = connectionId;
  }

  get token(): string {
    return jwt.sign(
      {
        username: this.username,
        connectionId: this.connectionId,
      } as UserAuth,
      process.env.TOKEN_KEY as string,
      {
        expiresIn: '2h',
      },
    );
  }

  async refreshConnectionId(): Promise<void> {
    const connectionId = uuidv4();
    await client.query('UPDATE users SET connection_id = $2 where username = $1', [
      this.username,
      connectionId,
    ]);
    this.connectionId = connectionId;
  }

  async connectionInfo(): Promise<{ token: string }> {
    await this.refreshConnectionId();
    return { token: this.token };
  }
}
