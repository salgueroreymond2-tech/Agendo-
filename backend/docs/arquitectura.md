# Arquitectura

```text
Frontend Parte 2 (HTML/CSS/JS) → /api/v1 → Routes → Controllers → Services → Models → MySQL
```

El frontend se sirve desde Express para usar el mismo origen que la API. Las rutas privadas usan sesión mediante cookie y no aceptan un `business_id` como autorización: el servidor comprueba la propiedad del negocio para cada consulta o mutación.

| Capa | Responsabilidad |
|---|---|
| Routes | Versionado, middleware y contrato HTTP. |
| Controllers | Traducción de request/response; sin reglas de negocio. |
| Services | Autorización tenant, transacciones, trial, disponibilidad y analítica. |
| Models | Mapeo Sequelize con nombres de columnas `snake_case`. |
| Migrations | Esquema reproducible; no usa `sync({ force })` ni `alter`. |

Las sesiones no usan JWT: el navegador recibe un token aleatorio en una cookie `HttpOnly` y la base conserva solo su HMAC, expiración y revocación. Esto permite cerrar sesión de manera real.

Las funciones de administrador requieren `role=platform_admin`. El dashboard de un propietario debe consumir solo datos de su negocio; las métricas globales de Valeria no se exponen a tenants.
