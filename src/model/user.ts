import { v4 as uuidv4 } from 'uuid';
import { client } from '../config/client';
import jwt from 'jsonwebtoken';

export type Pub = {
  x: string;
  y: string;
};

type UserDTO = {
  username: string;
  connectionId: string;
  pubkey: Pub;
  created_at: Date;
  updated_at: Date;
};

export type PublicUserDTO = {
  username: string;
  connectionId: string;
  pubkey: Pub;
};

export default class User {
  username: string;
  pubkey: Pub;
  connectionId: string;

  static async allUsers(): Promise<PublicUserDTO[]> {
    const users = (await client.query(
      "SELECT username, connectionId, pubkey FROM users where updated_at >= NOW() - INTERVAL '1 HOUR'",
    )) as PublicUserDTO[];
    return users;
  }

  static async oneUser(username: string): Promise<PublicUserDTO | null> {
    const [user] = (await client.query(
      "SELECT username, connectionId, pubkey FROM users where username = $1 and updated_at >= NOW() - INTERVAL '1 HOUR'",
      [username],
    )) as PublicUserDTO[];

    return user ?? null;
  }

  static async create(username: string, pubkey: Pub): Promise<User> {
    const connectionId = uuidv4();
    const [user] = (await client.query(
      'INSERT INTO users(username, pubkey, connectionId) values ($1, $2, $3) RETURNING *',
      [username, pubkey, connectionId],
    )) as UserDTO[];
    if (!user) throw new Error('could not create user');
    return new User(user.username, user.pubkey, user.connectionId);
  }

  static async findByUsername(username: string): Promise<User | null> {
    const [user] = (await client.query('SELECT * FROM users where username = $1', [
      username,
    ])) as UserDTO[];
    if (!user) return null;
    return new User(user.username, user.pubkey, user.connectionId);
  }

  static async fromPayload(payload: PublicUserDTO): Promise<User> {
    const user = await User.findByUsername(payload.username);
    if (!user) throw new Error('could not find user');
    if (user.connectionId !== payload.connectionId) throw new Error('outdated token');
    return user;
  }

  constructor(username: string, pubkey: Pub, connectionId: string) {
    this.username = username;
    this.pubkey = pubkey;
    this.connectionId = connectionId;
  }

  get token(): string {
    return jwt.sign(
      {
        username: this.username,
        connectionId: this.connectionId,
        pubkey: this.pubkey,
      } as PublicUserDTO,
      process.env.TOKEN_KEY as string,
      {
        expiresIn: '1h',
      },
    );
  }

  async refreshConnectionId(): Promise<void> {
    const connectionId = uuidv4();
    await client.query('UPDATE users SET connectionId = $2 where username = $1', [
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
