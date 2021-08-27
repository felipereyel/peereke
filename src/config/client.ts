import { Pool } from 'pg';

class PgClient {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }

  async query(query: string, args?: unknown[]): Promise<unknown[]> {
    const client = await this.pool.connect();
    const result = await client.query(query, args);
    client.release();
    return result.rows;
  }
}

export const client = new PgClient();
