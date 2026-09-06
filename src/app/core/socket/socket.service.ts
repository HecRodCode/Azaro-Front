// Encapsula la conexión Socket.IO con el backend. Los componentes NUNCA
// tocan el socket directamente; consumen signals expuestos aquí.
// Vacío por ahora — se llena cuando exista el gateway del backend.

import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SocketService {}
