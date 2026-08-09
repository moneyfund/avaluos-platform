# Migration Baseline

## Source of truth

The extraction is anchored to the existing production code in:

- Repository: `moneyfund/agente-norvingarcia`
- Source branch: `main`
- Source commit: `b05cf228820323b4993aa6955c78c34b923d0b9a`
- Source PR: `#127` (workspace redesign; business logic preserved)

The source commit is intentionally fixed. Future changes in `agente-norvingarcia` must not silently change this migration baseline.

## Critical files already identified

- `src/features/avaluos/engine/avaluo.engine.ts`
- `src/features/avaluos/engine/terreno.engine.ts`
- `src/features/avaluos/engine/casa.engine.ts`
- `src/features/avaluos/engine/shared/formulas.ts`
- `src/features/avaluos/engine/shared/weights.ts`
- `src/features/avaluos/types/avaluo.types.ts`
- `src/features/avaluos/constants/coeficientesCasas.ts`
- `src/features/avaluos/constants/factoresConstruccion.ts`
- `src/features/avaluos/constants/locations.ts`
- Matagalpa and Estelí zone configuration files
- appraisal forms, hooks and workspace components
- Firestore appraisal service
- Storage appraisal service
- current PDF templates and exporter
- Rural Sur regression test

## Non-negotiable parity rules

During extraction, do not intentionally change:

1. Rural Sur extension price curve.
2. Terrain coefficients or category limits.
3. House coefficient matrix or weights.
4. Zone base prices or appreciation factors.
5. area conversion constants.
6. market range logic.
7. existing output field semantics.
8. current PDF calculation inputs.
9. historical appraisal records.

## Migration order

1. Independent app shell.
2. Calculation core and regression tests.
3. Forms and result UI.
4. PDF engine and templates.
5. Firestore/Storage adapters with compatibility layer.
6. Independent Firebase project.
7. Multi-tenant context, memberships and permissions.
8. Tenant branding and PDF configuration.
9. License controls.

## Data safety

No production Firestore or Storage migration will be executed until calculation parity and UI parity are verified in this repository.
