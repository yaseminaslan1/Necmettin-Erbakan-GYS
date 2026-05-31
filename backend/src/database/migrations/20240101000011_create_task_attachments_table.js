/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('task_attachments', (table) => {
    table.increments('id').primary();
    table.integer('task_id').unsigned().notNullable();
    table.integer('user_id').unsigned().notNullable();
    table.string('filename', 255).notNullable();
    table.string('original_name', 255).notNullable();
    table.string('mime_type', 100).notNullable();
    table.integer('size').unsigned().notNullable(); // File size in bytes
    table.string('path', 500).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.foreign('task_id').references('id').inTable('tasks').onDelete('CASCADE');
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.index(['task_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('task_attachments');
};
