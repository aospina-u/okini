# Okini Café

Aplicación web responsiva desarrollada con HTML5, Tailwind CSS y JavaScript vainilla para la reserva y compra de café diario.

## Características Principales
- **Límite Diario de 2 Tazas:** Validación inteligente en frontend y servicio de datos para asegurar un máximo de 2 tazas de café por día.
- **Servicio en el Local:** Diseñado conceptualmente para el consumo en el establecimiento (`local storah`).
- **Arquitectura Híbrida (Local/Servidor):** Configurado inicialmente con `localStorage` en `js/api.js`, pero listo y estructurado para conectarse a una API REST backend con solo cambiar un parámetro (`USE_SERVER = true`).
- **Interfaz Responsiva:** Diseño moderno, limpio y adaptado a dispositivos móviles y de escritorio usando Tailwind CSS y FontAwesome.
- **Validaciones Completas:** Control de fechas pasadas, selección obligatoria de tipo de café, notificaciones flotantes (toasts) y manejo de errores.

## Estructura del Proyecto
```text
okini/
├── index.html       # Página principal
├── css/
│   └── styles.css   # Estilos personalizados adicionales
├── js/
│   ├── api.js       # Capa de servicios (localStorage / API Backend)
│   └── app.js       # Lógica de interfaz, validaciones y eventos
└── README.md        # Documentación
```

## Cómo Ejecutar
1. Descomprime el archivo ZIP.
2. Abre el archivo `index.html` directamente en tu navegador web favorito (Google Chrome, Firefox, Edge, Safari).
3. ¡Comienza a realizar tus reservas de café!
