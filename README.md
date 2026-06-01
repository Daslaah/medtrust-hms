# MedTrust Hospital Management System

## Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Create MySQL database:**
   - Open MySQL (phpMyAdmin au command line)
   - Import `database.sql` file
   Au wezeshe MySQL kwa:
   ```bash
   mysql -u root -p < database.sql
   ```

3. **Configure environment:**
   Copy `.env.example` to `.env` and update values:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=medtrust_hms
   JWT_SECRET=your_secret_key
   PORT=5000
   ```

4. **Seed sample data (optional):**
   ```bash
   npm run seed
   ```

5. **Start server:**
   ```bash
   npm run dev
   ```

## Default Accounts

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Receptionist | receptionist | receptionist123 |
| Doctor | doctor1 | doctor123 |
| Lab Technician | lab1 | lab123 |
| Pharmacist | pharmacy1 | pharmacy123 |

## Patient Workflow

1. **Registration** (Receptionist): Register new patients and collect initial payments
2. **Doctor Consultation** (Doctor): Create medical records and prescribe treatments
3. **Lab Tests** (Lab Technician): Order and complete lab tests
4. **Pharmacy** (Pharmacist): Dispense prescribed medications
5. **Billing** (Receptionist/Pharmacy): Process final payments and complete workflow

## Reports Dashboard (Admin Only)

Access comprehensive analytics and reports at `/reports`:

- **Dashboard Overview**: Patient statistics, payment summaries, inventory levels, recent activity
- **Patient Reports**: Detailed patient data with consultation, lab test, and prescription counts
- **Payment Reports**: Transaction history with filtering by type, method, and date range
- **Inventory Reports**: Medicine stock levels, expiry dates, and usage statistics
- **Workflow Reports**: Efficiency metrics including completion times and bottlenecks

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Users (Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Roles
- `GET /api/roles` - Get all roles

### Reports (Admin only)
- `GET /api/reports/dashboard` - Dashboard statistics overview
- `GET /api/reports/patients` - Patient reports with filtering
- `GET /api/reports/payments` - Payment transaction reports
- `GET /api/reports/inventory` - Medicine inventory reports
- `GET /api/reports/workflow` - Workflow efficiency metrics

## Frontend Setup

```bash
cd frontend
npm install
npm start
```

## Deployment

### Backend deployment (Railway)

1. Sign in to Railway and create a new project.
2. Connect your GitHub repository `Daslaah/medtrust-hms` or deploy from the local repository.
3. In Railway, set the root directory to `backend`.
4. Set the start command to:
   ```bash
   npm start
   ```
5. Add environment variables using values from `backend/.env.example`:
   - `DB_HOST`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `JWT_SECRET`
   - `PORT` (Railway may set this automatically)
6. Add a MySQL plugin or connect an external MySQL database.
7. Deploy and verify the health endpoint at `/api/health`.

### Frontend deployment (Vercel)

1. Sign in to Vercel and connect your GitHub repository.
2. Set the root directory to `frontend`.
3. Set the build command to:
   ```bash
   npm run build
   ```
4. Set the publish directory to:
   ```bash
   build
   ```
5. Add environment variable:
   - `REACT_APP_API_URL=https://<your-backend-domain>/api`
6. Deploy and verify the frontend loads correctly.

### Notes

- Do not commit `.env` files; use `backend/.env.example` as the template.
- For backend database seeding, run `npm run seed` locally or use Railway's console after deployment.
- If the frontend cannot connect, confirm `REACT_APP_API_URL` points to the deployed Railway backend URL.
