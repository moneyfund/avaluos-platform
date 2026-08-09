# Avalúos Platform

Plataforma central de avalúos inmobiliarios basada en el sistema existente de `moneyfund/agente-norvingarcia`.

## Objetivo

Separar el sistema de avalúos de las webs inmobiliarias y convertirlo en una aplicación independiente, preparada para arquitectura multi-tenant.

## Principios de migración

- No reescribir ni recalibrar los motores de avalúo durante la extracción.
- Conservar fórmulas, coeficientes, zonas, curvas de precio y resultados existentes.
- Mantener terrenos y casas como los tipos soportados inicialmente.
- Mantener Firebase como infraestructura, pero conectar posteriormente este repositorio a un proyecto Firebase exclusivo.
- Mantener el motor de PDF actual y parametrizar branding en una fase posterior.
- No mover ni eliminar todavía los datos históricos del proyecto actual.
- Validar paridad de resultados antes de activar multitenancy.

## Fases

1. Extracción funcional del módulo actual.
2. Pruebas de regresión y paridad.
3. Firebase independiente.
4. Tenant, membresías y roles.
5. Aislamiento de datos y Storage.
6. Branding y PDF por tenant.
7. Licencias.
8. Integración con Norvin, Diamantes y Amy Blandon.

## Estado

Repositorio inicializado. La aplicación actual de producción continúa sin cambios mientras se realiza la migración.
