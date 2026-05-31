/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('role_permissions', (table) => {
    table.increments('id').primary();
    table.integer('role_id').unsigned().notNullable();
    table.integer('permission_id').unsigned().notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.foreign('role_id').references('id').inTable('roles').onDelete('CASCADE');
    table.foreign('permission_id').references('id').inTable('permissions').onDelete('CASCADE');
    table.unique(['role_id', 'permission_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('role_permissions');
};
