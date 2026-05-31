/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('goals', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.string('title', 255).notNullable();
    table.text('description').nullable();
    table.integer('target_value').notNullable().defaultTo(10);
    table.integer('current_value').notNullable().defaultTo(0);
    table.enum('type', ['tasks', 'completion', 'overdue', 'custom']).defaultTo('tasks');
    table.enum('status', ['in_progress', 'completed']).defaultTo('in_progress');
    table.timestamps(true, true);

    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.index('user_id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('goals');
};
