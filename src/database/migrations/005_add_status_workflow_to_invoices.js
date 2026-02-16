/**
 * Migration: Add status workflow to invoices table
 * Version: 5
 * Description: Adds columns and constraints for invoice status workflow
 * 
 * Story: EPIC-1-005 - Invoice Workflow (Draft → Sent → Paid)
 */

export async function up(knex) {
  return knex.schema.alterTable('invoices', (table) => {
    // Add sent_at timestamp
    table.timestamp('sent_at').nullable();
  });
}

export async function down(knex) {
  return knex.schema.alterTable('invoices', (table) => {
    table.dropColumn('sent_at');
  }).then(() => {
    // Revert enum back to original
    return knex.raw(`
      CREATE TYPE status_enum_old AS ENUM ('DRAFT', 'SENT', 'VIEWED', 'PAID', 'CANCELLED', 'REFUNDED');
      
      ALTER TABLE invoices 
      ALTER COLUMN status DROP DEFAULT,
      ALTER COLUMN status TYPE status_enum_old USING status::text::status_enum_old,
      ALTER COLUMN status SET DEFAULT 'DRAFT'::status_enum_old;
      
      DROP TYPE IF EXISTS status_enum CASCADE;
      
      ALTER TYPE status_enum_old RENAME TO status_enum;
    `);
  });
}
