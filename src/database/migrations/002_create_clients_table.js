/**
 * Migration: Create clients table
 * Version: 2
 * Description: Creates the clients table for storing client information
 * 
 * Story: EPIC-2-001 - Create Client
 * Note: Initially created as supporting component for EPIC-1-001 (Create Invoice Draft)
 * Now completed as primary functionality for Story 7 (EPIC-2-001)
 */

export async function up(knex) {
  return knex.schema.createTable('clients', (table) => {
    // Primary Key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Foreign Key
    table.uuid('user_id').notNullable().index();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');

    // Client Information
    table.string('name', 255).notNullable().index();
    table.string('email', 255).notNullable();
    table.string('phone', 20).nullable();
    table.text('address').nullable();
    table.string('postal_code', 10).nullable();
    table.string('city', 100).nullable();
    table.string('country', 100).defaultTo('France').nullable();

    // Company Information
    table.string('company_name', 255).nullable();
    table.string('siret', 14).nullable().index();
    table.string('vat_number', 20).nullable();

    // Contact Information
    table.string('contact_person', 255).nullable();
    table.string('contact_phone', 20).nullable();

    // Account Status
    table.enum('status', ['active', 'inactive', 'archived']).defaultTo('active').index();

    // Metadata
    table.jsonb('metadata').defaultTo('{}');

    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now()).index();
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at').nullable();

    // Composite index for user_id and status
    table.index(['user_id', 'status']);
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists('clients');
}
