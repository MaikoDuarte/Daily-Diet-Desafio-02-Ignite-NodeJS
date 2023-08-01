import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('meals', (table) => {
    table.dropForeign(['user_id'])
    table.dropColumn('user_id')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('meals', (table) => {
    table.string('user_id').unsigned().references('id').inTable('users')
  })
}
