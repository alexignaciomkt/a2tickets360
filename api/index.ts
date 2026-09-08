import { handle } from 'hono/vercel';
import app from '../server/src/index.js';

// Ensure we get the actual Hono app instance (handles both ESM default and CJS module.exports)
const honoApp = (app as any).default || app;

export const GET = handle(honoApp);
export const POST = handle(honoApp);
export const PUT = handle(honoApp);
export const PATCH = handle(honoApp);
export const DELETE = handle(honoApp);
export const OPTIONS = handle(honoApp);
