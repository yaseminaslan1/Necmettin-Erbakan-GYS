/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('workflow_stages', (table) => {
    table.increments('id').primary();
    table.integer('project_id').unsigned().notNullable();
    table.string('name', 100).notNullable();
    table.string('color', 7).defaultTo('#6b7280'); // Default gray
    table.integer('order_index').notNullable().defaultTo(0);
    table.boolean('is_default').defaultTo(false); // Default stage for new tasks
    table.boolean('is_completed').defaultTo(false); // Marks tasks as completed
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.foreign('project_id').references('id').inTable('projects').onDelete('CASCADE');
    table.index(['project_id', 'order_index']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('workflow_stages');
};
