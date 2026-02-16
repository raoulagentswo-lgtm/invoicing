/**
 * Migration: Create invoices table
 * Version: 3
 * Description: Creates the invoices table for invoice management
 * 
 * Story: EPIC-1-001 - Create Invoice Draft
 */

export async function up(knex) {
  return knex.schema.createTable('invoices', (table) => {
    // Primary Key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Foreign Keys
    table.uuid('user_id').notNullable().index();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');

    table.uuid('client_id').notNullable().index();
    table.foreign('client_id').references('id').inTable('clients').onDelete('RESTRICT');

    // Invoice Number
    table.string('invoice_number', 50).notNullable().unique().index();
    table.integer('invoice_sequence').notNullable().defaultTo(1);

    // Dates
    table.date('invoice_date').notNullable().defaultTo(knex.fn.now());
    table.date('due_date').notNullable();
    table.date('paid_date').nullable();

    // Status
    table.enum('status', ['DRAFT', 'SENT', 'VIEWED', 'PAID', 'CANCELLED', 'REFUNDED']).defaultTo('DRAFT').index();

    // Description and Notes
    table.text('description').nullable();
    table.text('notes').nullable();

    // Currency and Tax
    table.string('currency', 3).defaultTo('EUR');
    table.decimal('tax_rate', 5, 2).defaultTo(20.00); // 20% by default
    table.decimal('tax_amount', 10, 2).defaultTo(0);

    // Amounts
    table.decimal('subtotal_amount', 10, 2).defaultTo(0);
    table.decimal('total_amount', 10, 2).defaultTo(0);
    table.decimal('paid_amount', 10, 2).defaultTo(0);

    // Payment Terms
    table.string('payment_terms', 100).nullable();
    table.text('payment_instructions').nullable();

    // Metadata
    table.jsonb('metadata').defaultTo('{}');

    // Audit
    table.text('audit_log').nullable();

    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now()).index();
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at').nullable();

    // Composite indexes for common queries
    table.index(['user_id', 'status']);
    table.index(['user_id', 'created_at']);
    table.index(['client_id', 'status']);
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists('invoices');
}
