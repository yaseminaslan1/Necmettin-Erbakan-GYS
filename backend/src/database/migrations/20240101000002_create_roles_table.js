/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('roles', (table) => {
    table.increments('id').primary();
    table.string('name', 100).unique().notNullable();
    table.string('description', 500).nullable();
    table.boolean('is_system').defaultTo(false); // System roles cannot be deleted
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('roles');
};
