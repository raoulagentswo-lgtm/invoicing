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

    // Modify status enum to include OVERDUE
    // Note: In PostgreSQL, we need to drop and recreate the constraint
    // We'll handle this with raw SQL for better control
  }).then(() => {
    // Execute raw SQL to modify the enum type and constraint
    return knex.raw(`
      -- Create new enum type with OVERDUE
      CREATE TYPE status_enum_new AS ENUM ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED');
      
      -- Alter table to use new enum
      ALTER TABLE invoices 
      ALTER COLUMN status DROP DEFAULT,
      ALTER COLUMN status TYPE status_enum_new USING status::text::status_enum_new,
      ALTER COLUMN status SET DEFAULT 'DRAFT'::status_enum_new;
      
      -- Drop old enum
      DROP TYPE IF EXISTS status_enum CASCADE;
      
      -- Rename new enum to old name
      ALTER TYPE status_enum_new RENAME TO status_enum;
    `);
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
