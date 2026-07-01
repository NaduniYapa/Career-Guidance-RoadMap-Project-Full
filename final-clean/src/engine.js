/**
 * Engine barrel — re-exports the roadmap engine and stub repositories.
 * Components import from '@/engine' so this keeps imports clean.
 * Real user/forum data now comes from the DB via API routes.
 */

import { engine } from './lib/roadmap-engine.js';

// Stubs — actual data lives in PostgreSQL, accessed via API routes.
// These exist so AdminPanel/DiscussionPanel don't break during migration.
export const userRepo = {
  getAllAsPlain:   () => ({}),
  addProfessional: () => {},
  delete:          () => {},
  findByUsername:  () => null,
};

export const forumRepo = {
  getCount: () => 0,
};

export { engine };
export default engine;
