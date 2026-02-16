/**
 * Migration: Create line_items table
 * Version: 4
 * Description: Creates the line_items table for invoice line items management
 * 
 * Story: EPIC-1-002/003 - Line Items & Tax Calculations
 */

export async function up(knex) {
  return knex.schema.createTable('line_items', (table) => {
    // Primary Key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Foreign Keys
    table.uuid('invoice_id').notNullable().index();
    table.foreign('invoice_id').references('id').inTable('invoices').onDelete('CASCADE');

    // Line Item Details
    table.text('description').notNullable();
    table.decimal('quantity', 10, 2).notNullable().defaultTo(1);
    table.decimal('unit_price', 10, 2).notNullable();
    table.boolean('tax_included').defaultTo(false);

    // Calculated Fields
    table.decimal('amount', 10, 2).notNullable(); // quantity * unit_price
    table.decimal('tax_amount', 10, 2).defaultTo(0); // amount * tax_rate (if not included)
    table.decimal('total', 10, 2).notNullable(); // amount + tax_amount

    // Tax info
    table.decimal('tax_rate', 5, 2).defaultTo(20.00); // Tax rate for this line item

    // Order and Metadata
    table.integer('line_order').notNullable().defaultTo(0); // Order of line items
    table.jsonb('metadata').defaultTo('{}');

    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now()).index();
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at').nullable();

    // Indexes for performance
    table.index(['invoice_id', 'created_at']);
    table.index(['invoice_id', 'deleted_at']);
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists('line_items');
}
