/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('projects', (table) => {
    table.increments('id').primary();
    table.string('name', 255).notNullable();
    table.text('description').nullable();
    table.integer('owner_id').unsigned().notNullable();
    table.string('color', 7).defaultTo('#6366f1'); // Default indigo color
    table.enum('status', ['active', 'archived', 'completed']).defaultTo('active');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.foreign('owner_id').references('id').inTable('users').onDelete('CASCADE');
    table.index(['owner_id']);
    table.index(['status']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('projects');
};
