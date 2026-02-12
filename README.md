# K1 Flow

A web application for managing Schedule K-1 forms and tracking flow-through tax information from partnerships, S-corporations, and other pass-through entities. K1 Flow helps you calculate outside basis, track loss limitations, and manage hierarchical ownership structures.

## Features

- **User Authentication & Management**: Complete user sign-up, sign-in, email verification, and password reset flows
- **Admin Panel**: Comprehensive user management for administrators with audit logging
- **Company Management**: Track multiple K-1 issuing entities with EIN, address, and entity type
- **K-1 Form Tracking**: Store and manage Schedule K-1 forms by tax year with all IRS fields
- **Outside Basis Tracking**: Calculate and track your tax basis in partnership interests
- **Loss Limitations**: Track suspended losses under Section 465 (At-Risk), Section 469 (Passive), and Section 461(l) (Excess Business Loss)
- **Loss Carryforwards**: Manage suspended losses by type and character
- **Ownership Hierarchy**: Model tiered ownership structures for flow-through calculations
- **PDF Storage**: Upload and store K-1 form PDFs

## Authentication & Security

- Email verification required for new accounts
- Password reset via email
- Admin-only access control using Laravel Gates
- Account lockout capability
- Comprehensive audit logging of user actions
- IP tracking for security (Cloudflare-aware)
- Soft delete for users

## User Roles

- **Standard Users**: Can manage their own K-1 forms and ownership interests
- **Administrators**: 
  - User ID 1 is always an admin
  - Can manage all users
  - Can lock/unlock accounts
  - Can reset passwords
  - Can view audit logs
  - Can verify email addresses

## Tech Stack

- **Backend**: Laravel 12 (PHP 8.1+)
- **Frontend**: React 19 with TypeScript
- **UI Components**: shadcn/ui + Radix UI primitives
- **Styling**: Tailwind CSS v4
- **Build**: Vite
- **Database**: MySQL/SQLite

## Getting Started

### Prerequisites

- PHP 8.1 or higher
- Composer
- Node.js 18+ and pnpm
- MySQL or SQLite

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd k1flow
   ```

2. **Install dependencies**
   ```bash
   composer install
   pnpm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   
   Update `.env` with your database credentials.

4. **Run migrations**
   ```bash
   php artisan migrate
   ```

5. **Build assets**
   ```bash
   pnpm run build
   ```

### Development

Run the development server:
```bash
# Start Laravel server and Vite dev server concurrently
pnpm run dev
php artisan serve
```

Or use multiple terminals:
- Terminal 1: `php artisan serve`
- Terminal 2: `pnpm run dev`

### Testing

Tests run against an in-memory SQLite database to ensure production data is never affected.

```bash
# Run PHPUnit tests
composer test

# Run Jest (TypeScript) tests
pnpm test
```

For detailed testing documentation, see [docs/TESTING.md](docs/TESTING.md).

## Database Schema

### Core Tables

- `users` - User accounts with authentication and authorization
- `user_audit_logs` - Comprehensive audit trail of user actions
- `k1_companies` - Partnership/S-Corp entities that issue K-1s
- `k1_forms` - Schedule K-1 forms with all Part I, II, and III fields
- `k1_income_sources` - Income categorization (passive, non-passive, capital, 461(l))
- `k1_outside_basis` - Outside basis tracking per K-1
- `k1_ob_adjustments` - CPA work product for basis adjustments
- `k1_loss_limitations` - Form 6198/8582/461(l) calculations
- `k1_loss_carryforwards` - Suspended losses by type and character
- `k1_ownership` - Ownership relationships for tiered structures

## API Endpoints

### Authentication
- `GET /sign-in` - Sign in page
- `POST /sign-in` - Process sign in
- `GET /sign-up` - Sign up page
- `POST /sign-up` - Process sign up
- `POST /sign-out` - Sign out
- `GET /email/verify` - Email verification notice
- `GET /email/verify/{id}/{hash}` - Process email verification
- `POST /email/verification-notification` - Resend verification email
- `GET /reset-password/{token}` - Password reset form
- `POST /reset-password` - Process password reset
- `POST /forgot-password` - Request password reset

### User Settings
- `GET /user/settings` - User settings page
- `POST /user/settings/profile` - Update profile
- `POST /user/settings/password` - Change password
- `POST /user/settings/email` - Request email change

### Admin (Requires admin-only gate)
- `GET /admin/users` - Admin user management page
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/{user}` - Update user
- `DELETE /api/admin/users/{user}` - Delete user
- `GET /api/admin/users/{user}/audit-log` - View user audit log

### Companies
- `GET /api/companies` - List all companies
- `POST /api/companies` - Create company
- `GET /api/companies/{id}` - Get company details
- `PUT /api/companies/{id}` - Update company
- `DELETE /api/companies/{id}` - Delete company

### K-1 Forms
- `GET /api/companies/{id}/forms` - List K-1 forms for company
- `POST /api/companies/{id}/forms` - Create K-1 form
- `GET /api/companies/{id}/forms/{formId}` - Get K-1 form details
- `PUT /api/companies/{id}/forms/{formId}` - Update K-1 form
- `DELETE /api/companies/{id}/forms/{formId}` - Delete K-1 form
- `POST /api/companies/{id}/forms/{formId}/upload` - Upload K-1 PDF

### Form Sub-resources
- `/api/forms/{id}/income-sources` - Income source CRUD
- `/api/forms/{id}/outside-basis` - Outside basis CRUD
- `/api/forms/{id}/outside-basis/adjustments` - OB adjustments CRUD
- `/api/forms/{id}/loss-limitations` - Loss limitations CRUD
- `/api/forms/{id}/loss-carryforwards` - Loss carryforwards CRUD

### Ownership
- `GET /api/ownership` - List all ownership relationships
- `POST /api/ownership` - Create ownership relationship
- `PUT /api/ownership/{id}` - Update ownership
- `DELETE /api/ownership/{id}` - Delete ownership
- `GET /api/companies/{id}/owners` - Get owners of a company
- `GET /api/companies/{id}/owned` - Get companies owned by a company

## IRS References

This application tracks data from:
- **Schedule K-1 (Form 1065)** - Partner's Share of Income, Deductions, Credits, etc.
- **Form 6198** - At-Risk Limitations
- **Form 8582** - Passive Activity Loss Limitations
- **Section 461(l)** - Excess Business Loss Limitation

## Deployment

See [Deployment Instructions](#deployment-instructions) below for deploying to a cPanel-hosted Apache server.

### Deployment Instructions

1. **Upload Project Files**
   - Upload all project files to your server, excluding `node_modules/`, `vendor/`, and `.env`
   - Place files in a directory outside of `public_html`, e.g., `~/k1flow/`

2. **Install Dependencies**
   ```bash
   cd ~/k1flow
   composer install --no-dev --optimize-autoloader
   pnpm install
   pnpm run build
   ```

3. **Configure Environment**
   - Create `.env` and configure database, `APP_KEY`, and `APP_URL`

4. **Set Up Public Directory**
   - Copy `~/k1flow/public/` contents to `~/public_html/`
   - Update `index.php` paths as needed

5. **Database Setup**
   ```bash
   php artisan migrate --force
   ```

6. **Set Permissions**
   ```bash
   chmod -R 775 storage bootstrap/cache
   ```

7. **Cache Configuration**
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

## License

Private - All rights reserved
