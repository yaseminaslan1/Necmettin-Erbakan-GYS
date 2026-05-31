/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('notifications', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.string('type', 64).notNullable();
    table.string('title', 255).notNullable();
    table.text('message').nullable();
    table.string('related_type', 64).nullable();
    table.integer('related_id').unsigned().nullable();
    table.timestamp('read_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.index(['user_id', 'read_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('notifications');
};
