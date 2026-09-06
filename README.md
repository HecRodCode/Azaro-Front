# Azaro — Frontend

Cliente del juego Azaro (drones multijugador en arena 3D). Prueba técnica individual de Riwi.

## Repos relacionados

- Backend: https://github.com/HecRodCode/Azaro-API.git

## Stack

Angular (última estable) — standalone components, signals, zoneless · Three.js

## Estructura

```
src/app/
├── core/                 # servicios (socket, room, game-state) y modelos, todo con signals
└── features/
    ├── lobby/            # crear/unir sala
    ├── room-waiting/     # sala de espera
    └── arena/            # canvas de Three.js, HUD, modal de preguntas
```

## Clonar y correr

```bash
git clone https://github.com/HecRodCode/Azaro-Front.git
cd Azaro-Front
npm install
cp src/environments/environment.example.ts src/environments/environment.ts  # apuntar al backend local
npm start
```

Queda en `http://localhost:4200`. Necesita el backend corriendo en `http://localhost:3000` (ver su propio README) para funcionar.

## Notas de diseño

- Sin NgModules: todo standalone, con `provideZonelessChangeDetection()` en `app.config.ts`. El estado vive en signals (`signal()` / `computed()`) dentro de los servicios de `core/`, no en zone.js.
- El acceso al WebSocket está encapsulado en un `SocketService`; los componentes solo leen signals, nunca tocan el socket directamente.
- La arena usa cámara ortográfica en ángulo, geometrías básicas (`PlaneGeometry`, `BoxGeometry`) con texturas en `NearestFilter`, y un pase de post-procesado que renderiza a baja resolución y escala hacia arriba, para lograr el look pixel-art retro.

Detalle completo de las reglas de negocio y la arquitectura general en el repo de docs.
