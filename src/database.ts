import 'dotenv/config'
import { knex as setupKnex, Knex } from 'knex'
import { env } from './env'

if (!process.env.DATABASE_PORT) {
  throw new Error('DATABASE_URL env not found.')
}

export const config: Knex.Config = {
  client: 'mysql2',
  version: '8.0.30',
  connection: {
    host: env.DATABASE_HOST,
    port: env.DATABASE_PORT,
    user: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    database: env.DATABASE_NAME,
  },
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
}

export const knex = setupKnex(config)
