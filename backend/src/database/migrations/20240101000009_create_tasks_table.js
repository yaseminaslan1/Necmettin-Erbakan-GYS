/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('tasks', (table) => {
    table.increments('id').primary();
    table.string('title', 255).notNullable();
    table.text('description').nullable();
    table.integer('project_id').unsigned().notNullable();
    table.integer('stage_id').unsigned().notNullable();
    table.integer('assignee_id').unsigned().nullable();
    table.integer('creator_id').unsigned().notNullable();
    table.enum('priority', ['low', 'medium', 'high', 'urgent']).defaultTo('medium');
    table.integer('order_index').notNullable().defaultTo(0);
    table.date('due_date').nullable();
    table.integer('estimated_hours').nullable();
    table.timestamp('started_at').nullable();
    table.timestamp('completed_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.foreign('project_id').references('id').inTable('projects').onDelete('CASCADE');
    table.foreign('stage_id').references('id').inTable('workflow_stages').onDelete('CASCADE');
    table.foreign('assignee_id').references('id').inTable('users').onDelete('SET NULL');
    table.foreign('creator_id').references('id').inTable('users').onDelete('CASCADE');
    
    table.index(['project_id']);
    table.index(['stage_id']);
    table.index(['assignee_id']);
    table.index(['priority']);
    table.index(['due_date']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('tasks');
};
