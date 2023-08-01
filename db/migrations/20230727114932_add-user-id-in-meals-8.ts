import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('meals', (table) => {
    table.uuid('user_id').notNullable()
    table.foreign('user_id').references('user_id').inTable('users')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('meals', (table) => {
    table.dropForeign(['user_id'])
    table.dropColumn('user_id')
  })
}
