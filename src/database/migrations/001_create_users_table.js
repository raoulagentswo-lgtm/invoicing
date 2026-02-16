/**
 * Migration: Create users table
 * Version: 1
 * Description: Creates the users table for user registration and authentication
 * 
 * Story: EPIC-5-001 - User Registration
 */

export async function up(knex) {
  return knex.schema.createTable('users', (table) => {
    // Primary Key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // User Information
    table.string('email', 255).unique().notNullable().index();
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.string('password_hash', 255).notNullable();

    // Email Verification
    table.boolean('email_verified').defaultTo(false);
    table.string('email_verification_token', 255).nullable().unique();
    table.timestamp('email_verified_at').nullable();
    table.timestamp('verification_token_expires_at').nullable();

    // Company Information
    table.string('company_name', 255).nullable();
    table.string('siret', 14).nullable().unique().index();
    table.text('company_address').nullable();
    table.string('company_phone', 20).nullable();

    // Logo & Signature
    table.string('logo_url', 500).nullable();
    table.string('signature_url', 500).nullable();

    // Account Status
    table.enum('status', ['active', 'suspended', 'deleted']).defaultTo('active').index();
    table.boolean('is_archived').defaultTo(false).index();

    // Rate Limiting & Security
    table.integer('failed_login_attempts').defaultTo(0);
    table.timestamp('last_failed_login_at').nullable();
    table.timestamp('locked_until').nullable();

    // Password Reset
    table.string('password_reset_token', 255).nullable().unique();
    table.timestamp('password_reset_expires_at').nullable();

    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now()).index();
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('last_login_at').nullable();
    table.timestamp('deleted_at').nullable();

    // Metadata
    table.jsonb('metadata').defaultTo('{}');

    // Audit Trail
    table.text('audit_log').nullable();
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists('users');
}
