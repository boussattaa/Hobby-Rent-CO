'use server';

import { resend } from '@/utils/resend';

export async function sendNewMessageEmail({ to, senderName, messagePreview, link }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('Skipping email: Missing RESEND_API_KEY');
    return { error: 'Missing API Key' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'HobbyRent <noreply@hobbyrent.com>',
      to: [to], // In test mode, this must be the account owner's email usually
      subject: `New message from ${senderName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You have a new message!</h2>
          <p><strong>${senderName}</strong> sent you a message:</p>
          <blockquote style="background: #f9f9f9; padding: 15px; border-left: 4px solid #ccc;">
            "${messagePreview}"
          </blockquote>
          <a href="${link}" style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
            Reply Now
          </a>
        </div>
      `,
    });

    if (error) {
      console.error('Resend Error:', error);
      return { error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Email Exception:', err);
    return { error: err.message };
  }
}
