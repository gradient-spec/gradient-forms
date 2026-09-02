import { SEED_FORMS, SEED_RESPONSES } from '../../src/data/seedData';

// In-Memory Data Store (Failsafe fallback when DB is disconnected)
export let formsStore = [...SEED_FORMS];
export let responsesStore = [...SEED_RESPONSES];

export const resetStore = () => {
  formsStore = [...SEED_FORMS];
  responsesStore = [...SEED_RESPONSES];
};
