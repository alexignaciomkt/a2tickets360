import { Client, Databases, Storage, Users } from 'node-appwrite';

// ─────────────────────────────────────────────────────────────────────────────
// Appwrite SDK Singleton
// Single connection point — never instantiate these anywhere else.
// ─────────────────────────────────────────────────────────────────────────────

// DEV ONLY: Appwrite server uses a self-signed certificate.
// Bun/Node rejects it by default. Disable TLS verification in non-production.
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://database.a2tickets360.com.br/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || 'a2tickets360')
  .setKey(process.env.APPWRITE_API_KEY || '');

export const appwriteDatabases = new Databases(client);
export const appwriteStorage   = new Storage(client);
export const appwriteUsers     = new Users(client);

// Convenience constants pulled from env (so routes never hardcode IDs)
export const DB_ID = process.env.APPWRITE_DATABASE_ID || 'a2tickets360-db';

export const COLLECTIONS = {
  admins:           process.env.APPWRITE_COLLECTION_ADMINS           || 'admins',
  userProfiles:     process.env.APPWRITE_COLLECTION_USER_PROFILES    || 'user_profiles',
  events:           process.env.APPWRITE_COLLECTION_EVENTS           || 'events',
  tickets:          process.env.APPWRITE_COLLECTION_TICKETS          || 'tickets',
  sales:            process.env.APPWRITE_COLLECTION_SALES            || 'sales',
  staff:            process.env.APPWRITE_COLLECTION_STAFF            || 'staff',
  checkins:         process.env.APPWRITE_COLLECTION_CHECKINS         || 'checkins',
  suppliers:        process.env.APPWRITE_COLLECTION_SUPPLIERS        || 'suppliers',
  sponsors:         process.env.APPWRITE_COLLECTION_SPONSORS         || 'sponsors',
  stands:           process.env.APPWRITE_COLLECTION_STANDS           || 'stands',
  visitors:         process.env.APPWRITE_COLLECTION_VISITORS         || 'visitors',
  legalPages:       process.env.APPWRITE_COLLECTION_LEGAL_PAGES      || 'legal_pages',
  organizerPosts:   process.env.APPWRITE_COLLECTION_ORGANIZER_POSTS  || 'organizer_posts',
  eventCategories:  process.env.APPWRITE_COLLECTION_EVENT_CATEGORIES || 'event_categories',
  organizer_details: process.env.APPWRITE_COLLECTION_ORGANIZER_DETAILS || 'organizer_details',
} as const;

export const BUCKETS = {
  media:      process.env.APPWRITE_BUCKET_MEDIA       || 'media',
  ticketsQr:  process.env.APPWRITE_BUCKET_TICKETS_QR  || 'tickets-qr',
  documents:  process.env.APPWRITE_BUCKET_DOCUMENTS   || 'documents',
} as const;
