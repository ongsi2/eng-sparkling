/**
 * Admin utilities for client-side use
 */

// Admin email addresses
export const ADMIN_EMAILS = [
  'ongsya@gmail.com',
];

/**
 * Check if email is admin
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
}
