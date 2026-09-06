// Rutas top-level. Lazy loading por feature para mantener el bundle inicial pequeño.

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/overworld/overworld.page').then((m) => m.OverworldPage),
  },
  {
    path: 'arena/:code',
    loadComponent: () =>
      import('./features/arena/arena.page').then((m) => m.ArenaPage),
  },
  { path: '**', redirectTo: '' },
];
