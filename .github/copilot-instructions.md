# K1 Flow Copilot Instructions

## Architecture Overview
This is a hybrid Laravel 12 + React TypeScript application for K-1 tax form management. It combines server-side Blade templates with client-side React components for interactive features.

### Key Components
- **Backend**: Laravel controllers return Blade views with data attributes
- **Frontend**: React components mount into DOM elements using `createRoot`
- **Data Flow**: Blade passes initial data via `data-*` attributes; React handles UI updates via API calls
- **API**: RESTful endpoints under `/api` for CRUD operations
- **Domain**: K-1 forms, companies, outside basis, loss limitations, ownership structures
- **Modules**: Companies, K-1 Forms, Outside Basis, Loss Limitations, Loss Carryforwards, Ownership

### Example Pattern
```php
// Controller passes data to view
return view('company', ['id' => $id]);
```
```blade
<!-- Blade view with data attributes -->
<div id="company-detail" data-company-id="{{ $id }}"></div>
```
```tsx
// React component reads data and mounts
const mount = document.getElementById('company-detail');
if (mount) {
  const companyId = parseInt(mount.dataset.companyId || '0', 10);
  createRoot(mount).render(<CompanyDetail companyId={companyId} />);
}
```

## Development Workflow
- **Setup**: `composer install && pnpm install && php artisan migrate`
- **Dev Server**: `php artisan serve` + `pnpm run dev`
- **Testing**: `composer test` for PHPUnit; `pnpm test` for Jest (React components)
- **Build**: `pnpm run build` for production assets

## Key Conventions
- **Models**: Use Eloquent relationships; organize in `app/Models/K1/` subdirectory
- **Controllers**: Organize in `app/Http/Controllers/K1/` subdirectory
- **Routes**: Web routes (`routes/web.php`) return Blade views; API routes (`routes/api.php`) handle data operations
- **Components**: Use shadcn/ui + Radix UI primitives with Tailwind CSS
- **TypeScript Typings**: Define interfaces in `@/types/k1/index.ts`
- **Currency**: Use currency.js for formatting money values; use `formatCurrency()` from `@/lib/currency.ts`
- **State**: Client-side state managed in React; server state via API calls

## Common Patterns
- **Company CRUD**: API endpoints `/api/companies` for GET/POST/PUT/DELETE
- **K-1 Forms**: Nested under companies `/api/companies/{id}/forms`
- **Form Sub-resources**: `/api/forms/{id}/income-sources`, `/api/forms/{id}/outside-basis`, etc.
- **Ownership**: `/api/ownership` for ownership relationships between companies
- **File Uploads**: K-1 PDF uploads via `/api/companies/{id}/forms/{formId}/upload`

## File Structure Highlights
- `app/Models/K1/`: Eloquent models (K1Company, K1Form, K1OutsideBasis, etc.)
- `app/Http/Controllers/K1/`: Controllers for K-1 CRUD operations
- `resources/views/`: Blade templates (welcome, company, k1-form)
- `resources/js/components/k1/`: React components for K-1 features
- `resources/js/types/k1/`: TypeScript interfaces
- `resources/js/lib/currency.ts`: Currency formatting utilities
- `routes/api.php`: API endpoints
- `routes/web.php`: Web routes for pages

## IRS References
- **Schedule K-1 (Form 1065)**: Partner's Share of Income, Deductions, Credits
- **Form 6198**: At-Risk Limitations
- **Form 8582**: Passive Activity Loss Limitations
- **Section 461(l)**: Excess Business Loss Limitation

## Database Tables
- `k1_companies`: Partnership/S-Corp entities
- `k1_forms`: Schedule K-1 forms with all Part I, II, III fields
- `k1_income_sources`: Income categorization (passive, non-passive, capital, 461(l))
- `k1_outside_basis`: Outside basis tracking
- `k1_ob_adjustments`: CPA work product for basis adjustments
- `k1_loss_limitations`: Form 6198/8582 calculations
- `k1_loss_carryforwards`: Suspended losses by type and character
- `k1_ownership`: Tiered ownership relationships

Focus on tax data integrity, proper handling of money values (DECIMAL(16,2)), and maintaining relationships between companies, K-1 forms, and related records.</content>
<parameter name="filePath">/Users/bwh/proj/bwh/bwh-php/.github/copilot-instructions.md