/**
 * Migration: Add banking fields to users table
 * Version: 7
 * Description: Adds bank details for PDF invoices
 * 
 * Story: EPIC-4-001 - Generate PDF
 */

export async function up(knex) {
  return knex.schema.table('users', (table) => {
    table.string('bank_name', 255).nullable().comment('Bank name for invoice footer');
    table.string('iban', 34).nullable().comment('IBAN for payment instructions');
    table.string('bic', 11).nullable().comment('BIC/SWIFT code');
  });
}

export async function down(knex) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('bank_name');
    table.dropColumn('iban');
    table.dropColumn('bic');
  });
}
