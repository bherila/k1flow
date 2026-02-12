# K1 Flow

A web application for managing Schedule K-1 forms and tracking flow-through tax information from partnerships, S-corporations, and other pass-through entities. K1 Flow helps you calculate outside basis, track loss limitations, and manage hierarchical ownership structures.

## Features

- **User Authentication & Management**: Complete user sign-up, sign-in, email verification, and password reset flows
- **Admin Panel**: Comprehensive user management for administrators with audit logging
- **Company Management**: Track multiple K-1 issuing entities with EIN, address, and entity type
- **Company Ownership & Access Control**: Fine-grained access control - companies are owned by users and can be shared with other users
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
- **Company-level access control**: Each company has an owner and can grant shared access to other users
- Account lockout capability
- Comprehensive audit logging of user actions
- IP tracking for security (Cloudflare-aware)
- Soft delete for users
- Caching for optimized authorization checks

## User Roles & Permissions

- **Standard Users**: 
  - Can create and own companies
  - Can grant/revoke access to their companies for other users
  - Can access companies owned by them or shared with them
  - Can manage K-1 forms, ownership interests, and basis tracking for companies they have access to
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
- `k1_companies` - Partnership/S-Corp entities that issue K-1s (with owner_user_id for ownership)
- `company_user` - Pivot table for shared access to companies
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

### Companies (Requires authentication + access-company gate for specific company operations)
- `GET /api/companies` - List companies the user owns or has access to
- `POST /api/companies` - Create company (user becomes owner)
- `GET /api/companies/{company}` - Get company details
- `PUT /api/companies/{company}` - Update company
- `DELETE /api/companies/{company}` - Delete company

### Company Access Control
- `GET /api/companies/{company}/users` - List users with access to company
- `POST /api/companies/{company}/users` - Grant access to a user (requires `user_id`)
- `DELETE /api/companies/{company}/users/{user}` - Revoke user's access to company
- `GET /api/users/search?q={query}` - Search for users by email (for autocomplete)

### K-1 Forms (Requires access to the related company)
- `GET /api/ownership-interests/{interest}/k1s` - List K-1 forms for ownership interest
- `POST /api/ownership-interests/{interest}/k1s` - Create K-1 form
- `GET /api/forms/{form}` - Get K-1 form details
- `PUT /api/forms/{form}` - Update K-1 form
- `DELETE /api/forms/{form}` - Delete K-1 form
- `POST /api/forms/{form}/upload` - Upload K-1 PDF
- `POST /api/forms/{form}/extract-pdf` - Extract data from K-1 PDF using AI

### Form Sub-resources
- `/api/forms/{form}/income-sources` - Income source CRUD
- `/api/ownership-interests/{interest}/basis/{year}` - Get/update outside basis for year
- `/api/ownership-interests/{interest}/basis/{year}/adjustments` - Create basis adjustments
- `/api/adjustments/{adjustment}` - Update/delete adjustment
- `/api/ownership-interests/{interest}/losses/{year}` - Get/update loss limitations
- `/api/ownership-interests/{interest}/carryforwards` - List/create loss carryforwards
- `/api/carryforwards/{carryforward}` - Update/delete carryforward

### Ownership Interests (Requires access to related companies)
- `GET /api/ownership-interests` - List all ownership interests
- `POST /api/ownership-interests` - Create ownership relationship
- `GET /api/ownership-interests/{interest}` - Get ownership interest details
- `PUT /api/ownership-interests/{interest}` - Update ownership interest
- `DELETE /api/ownership-interests/{interest}` - Delete ownership interest
- `GET /api/companies/{company}/ownership-interests` - Get ownership interests where company is owner
- `GET /api/companies/{company}/owned-by` - Get ownership interests where company is owned

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
