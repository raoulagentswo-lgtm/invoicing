/**
 * Email Service
 * 
 * Handles invoice email sending
 * Story: EPIC-4-001 - Generate PDF
 * 
 * NOTE: This is a stub implementation for now.
 * Future: SendGrid integration
 */

import nodemailer from 'nodemailer';

/**
 * Send invoice via email (STUB)
 * @param {Object} params
 * @param {string} params.recipientEmail - Recipient email
 * @param {string} params.invoiceNumber - Invoice number
 * @param {string} params.pdfBuffer - PDF buffer (optional)
 * @param {string} params.senderEmail - Sender email
 * @returns {Promise<Object>} Result with success status
 */
export async function sendInvoiceEmail({
  recipientEmail,
  invoiceNumber,
  pdfBuffer,
  senderEmail = process.env.SMTP_FROM_EMAIL || 'noreply@facturation.app'
}) {
  try {
    // STUB: For now, just log and return success
    // In production, use SendGrid or another email service
    
    console.log(`[EMAIL STUB] Sending invoice ${invoiceNumber} to ${recipientEmail}`);
    console.log(`[EMAIL STUB] PDF buffer size: ${pdfBuffer ? pdfBuffer.length : 'N/A'} bytes`);
    console.log(`[EMAIL STUB] From: ${senderEmail}`);

    // TODO: Remove this stub and implement real email sending
    // const transporter = nodemailer.createTransport({
    //   host: process.env.SMTP_HOST,
    //   port: process.env.SMTP_PORT,
    //   secure: true,
    //   auth: {
    //     user: process.env.SMTP_USER,
    //     pass: process.env.SMTP_PASS
    //   }
    // });

    // const mailOptions = {
    //   from: senderEmail,
    //   to: recipientEmail,
    //   subject: `Invoice ${invoiceNumber}`,
    //   html: `<p>Please find attached your invoice ${invoiceNumber}</p>`,
    //   attachments: pdfBuffer ? [
    //     {
    //       filename: `${invoiceNumber}.pdf`,
    //       content: pdfBuffer
    //     }
    //   ] : []
    // };

    // await transporter.sendMail(mailOptions);

    return {
      success: true,
      message: `Invoice ${invoiceNumber} email queued for delivery (stub implementation)`,
      stub: true,
      details: {
        recipientEmail,
        invoiceNumber,
        pdfSize: pdfBuffer ? pdfBuffer.length : 0
      }
    };
  } catch (error) {
    console.error('Error sending invoice email:', error);
    return {
      success: false,
      message: 'Failed to send invoice email',
      error: error.message
    };
  }
}

export default {
  sendInvoiceEmail
};
