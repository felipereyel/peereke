import { v4 as uuidv4 } from 'uuid';
import { client } from '../config/client';
import jwt from 'jsonwebtoken';

export type Pub = {
  x: string;
  y: string;
};

type UserDTO = {
  username: string;
  connection: string;
  pubkey: Pub;
  created_at: Date;
  updated_at: Date;
};

export type PublicUserDTO = {
  username: string;
  connection: string;
  pubkey: Pub;
};

export default class User {
  username: string;
  pubkey: Pub;
  connection: string;

  static async allUsers(): Promise<PublicUserDTO[]> {
    const users = (await client.query(
      "SELECT username, connection, pubkey FROM users where updated_at >= NOW() - INTERVAL '1 HOUR'",
    )) as PublicUserDTO[];
    return users;
  }

  static async oneUser(username: string): Promise<PublicUserDTO | null> {
    const [user] = (await client.query(
      "SELECT username, connection, pubkey FROM users where username = $1 and updated_at >= NOW() - INTERVAL '1 HOUR'",
      [username],
    )) as PublicUserDTO[];

    return user ?? null;
  }

  static async create(username: string, pubkey: Pub): Promise<User> {
    const connection = uuidv4();
    const [user] = (await client.query(
      'INSERT INTO users(username, pubkey, connection) values ($1, $2, $3) RETURNING *',
      [username, pubkey, connection],
    )) as UserDTO[];
    if (!user) throw new Error('could not create user');
    return new User(user.username, user.pubkey, user.connection);
  }

  static async findByUsername(username: string): Promise<User | null> {
    const [user] = (await client.query('SELECT * FROM users where username = $1', [
      username,
    ])) as UserDTO[];
    if (!user) return null;
    return new User(user.username, user.pubkey, user.connection);
  }

  static async fromPayload(payload: PublicUserDTO): Promise<User> {
    const user = await User.findByUsername(payload.username);
    if (!user) throw new Error('could not find user');
    if (user.connection !== payload.connection) throw new Error('outdated token');
    return user;
  }

  constructor(username: string, pubkey: Pub, connection: string) {
    this.username = username;
    this.pubkey = pubkey;
    this.connection = connection;
  }

  get token(): string {
    return jwt.sign(
      {
        username: this.username,
        connection: this.connection,
        pubkey: this.pubkey,
      } as PublicUserDTO,
      process.env.TOKEN_KEY as string,
      {
        expiresIn: '1h',
      },
    );
  }

  async refreshConnection(): Promise<void> {
    const connection = uuidv4();
    await client.query('UPDATE users SET connection = $2 where username = $1', [
      this.username,
      connection,
    ]);
    this.connection = connection;
  }

  async connectionInfo(): Promise<{ token: string }> {
    await this.refreshConnection();
    return { token: this.token };
  }
}
