import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a unique invite slug that is URL-friendly.
 * The slug will be a random alphanumeric string of length between 1 and 24 characters.
 *
 * @returns A unique invite slug.
 */
export function generateInviteSlug(): string {
  const uuid = uuidv4();
  const base64Slug = Buffer.from(uuid).toString('base64').replace(/[^a-zA-Z]/g, '').substring(0, 12);
  return base64Slug;
}