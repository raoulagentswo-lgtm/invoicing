/**
 * Migration: Create invoice status history table
 * Version: 6
 * Description: Creates table to track invoice status transitions
 * 
 * Story: EPIC-1-005 - Invoice Workflow (Draft → Sent → Paid)
 */

export async function up(knex) {
  return knex.schema.createTable('invoice_status_history', (table) => {
    // Primary Key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Foreign Keys
    table.uuid('invoice_id').notNullable().index();
    table.foreign('invoice_id').references('id').inTable('invoices').onDelete('CASCADE');

    table.uuid('user_id').notNullable().index();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');

    // Status transition
    table.enum('from_status', ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']).nullable();
    table.enum('to_status', ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']).notNullable();

    // Additional context
    table.text('reason').nullable();
    table.jsonb('metadata').defaultTo('{}');

    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now()).index();

    // Composite indexes
    table.index(['invoice_id', 'created_at']);
    table.index(['user_id', 'created_at']);
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists('invoice_status_history');
}
