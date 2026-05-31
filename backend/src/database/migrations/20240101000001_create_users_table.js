/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('email', 255).unique().notNullable();
    table.string('password', 255).nullable(); // Nullable for OAuth users
    table.string('name', 255).notNullable();
    table.string('avatar', 500).nullable();
    table.enum('provider', ['local', 'google', 'github']).defaultTo('local');
    table.string('provider_id', 255).nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('email_verified_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index(['email']);
    table.index(['provider', 'provider_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('users');
};
