/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('project_members', (table) => {
    table.increments('id').primary();
    table.integer('project_id').unsigned().notNullable();
    table.integer('user_id').unsigned().notNullable();
    table.integer('role_id').unsigned().nullable(); // Project-specific role
    table.timestamp('joined_at').defaultTo(knex.fn.now());
    
    table.foreign('project_id').references('id').inTable('projects').onDelete('CASCADE');
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('role_id').references('id').inTable('roles').onDelete('SET NULL');
    table.unique(['project_id', 'user_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('project_members');
};
