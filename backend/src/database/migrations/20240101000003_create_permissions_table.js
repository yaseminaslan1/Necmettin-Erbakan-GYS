/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('permissions', (table) => {
    table.increments('id').primary();
    table.string('name', 100).unique().notNullable();
    table.string('description', 500).nullable();
    table.string('module', 50).notNullable(); // e.g., 'projects', 'tasks', 'users'
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.index(['module']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('permissions');
};
