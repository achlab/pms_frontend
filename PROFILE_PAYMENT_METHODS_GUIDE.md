# Profile & Payment Methods Management Guide

This guide covers the newly added profile and payment methods management features for landlords and caretakers.

## Features Added

### 1. Landlord Profile Page (`/landlord/profile`)

A complete profile management page for landlords with:
- **Profile Photo Upload**: Upload and display profile pictures (max 5MB)
- **Basic Information**: Full name, phone, email (read-only), country
- **Location Details**: Physical address and city
- **Bio Section**: About me text area for personal description
- **Form Validation**: Required fields for name and phone
- **Auto-save**: Profile updates persist to backend

**Access**: Available to users with `landlord` role via sidebar navigation

### 2. Caretaker Profile Page (`/caretaker/profile`)

Similar to landlord profile with additional fields:
- **All landlord profile features**
- **Working Hours**: Typical availability schedule
- **Emergency Contact**: Alternative contact number for urgent matters

**Access**: Available to users with `caretaker` role via sidebar navigation

### 3. Payment Methods Management (`/payment-methods`)

A comprehensive payment methods configuration page for landlords with three tabs:

#### Mobile Money Tab
- Add multiple mobile money accounts (MTN MoMo, Vodafone Cash, AirtelTigo Money)
- Fields: Provider, Account Number, Account Name
- Toggle active/inactive status per account
- Delete accounts with confirmation

#### Bank Transfer Tab
- Add multiple bank accounts
- Fields: Bank Name, Account Number, Account Name, Branch (optional)
- Toggle active/inactive status per account
- Delete accounts with confirmation

#### Cash Tab
- Simple enable/disable toggle for cash payments
- Informational note about manual verification

**Access**: Available to landlords via "Payment Methods" link in sidebar

## Updated Components

### Sidebar Navigation
Updated sidebar to include new pages:
- **Landlord**: "My Profile" → `/landlord/profile`, "Payment Methods" → `/payment-methods`
- **Caretaker**: "My Profile" → `/caretaker/profile`

### Pay Rent Page (`/pay-rent`)
Now dynamically fetches real payment methods from the backend instead of using mock data:
- Displays only active payment methods
- Shows landlord's configured mobile money accounts
- Shows landlord's configured bank accounts  
- Shows cash option if enabled
- Shows "No payment methods available" message when landlord hasn't configured any

## Backend Integration

### Profile Service (`lib/services/profile.service.ts`)

**New Interfaces:**
```typescript
interface LandlordProfile {
  id?: number;
  email?: string;
  full_name?: string;
  phone?: string;
  bio?: string;
  address?: string;
  city?: string;
  country?: string;
  photo_url?: string;
}

interface CaretakerProfile extends LandlordProfile {
  emergency_contact?: string;
  working_hours?: string;
}
```

**New Methods:**
- `getLandlordProfile()`: GET `/landlord/profile`
- `updateLandlordProfile(data)`: PUT `/landlord/profile`
- `getCaretakerProfile()`: GET `/caretaker/profile`
- `updateCaretakerProfile(data)`: PUT `/caretaker/profile`
- `uploadProfilePhoto(file)`: POST `/profile/upload-photo`

### Payment Method Service (`lib/services/payment-method.service.ts`)

**Updated Interfaces:**
```typescript
interface MobileMoneyMethod {
  id?: number;
  provider: "mtn_momo" | "vodafone_cash" | "airteltigo_money";
  account_number: string;
  account_name: string;
  is_active?: boolean;
}

interface BankTransferMethod {
  id?: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  branch?: string;
  is_active?: boolean;
}
```

**New Methods:**
- `addMobileMoneyMethod(data)`: POST `/landlord/payment-methods/mobile-money`
- `updateMobileMoneyMethod(id, data)`: PUT `/landlord/payment-methods/mobile-money/{id}`
- `deleteMobileMoneyMethod(id)`: DELETE `/landlord/payment-methods/mobile-money/{id}`
- `addBankTransferMethod(data)`: POST `/landlord/payment-methods/bank-transfer`
- `updateBankTransferMethod(id, data)`: PUT `/landlord/payment-methods/bank-transfer/{id}`
- `deleteBankTransferMethod(id)`: DELETE `/landlord/payment-methods/bank-transfer/{id}`
- `updateCashSettings(enabled)`: PUT `/landlord/payment-methods/cash`

## Expected Backend Endpoints

The frontend expects these Laravel API endpoints to be implemented:

### Profile Endpoints
```
GET    /api/landlord/profile                   - Get landlord profile
PUT    /api/landlord/profile                   - Update landlord profile
GET    /api/caretaker/profile                  - Get caretaker profile
PUT    /api/caretaker/profile                  - Update caretaker profile
POST   /api/profile/upload-photo               - Upload profile photo
```

### Payment Method Endpoints
```
GET    /api/landlord/payment-methods                          - Get all payment methods
POST   /api/landlord/payment-methods/mobile-money             - Add mobile money
PUT    /api/landlord/payment-methods/mobile-money/{id}        - Update mobile money
DELETE /api/landlord/payment-methods/mobile-money/{id}        - Delete mobile money
POST   /api/landlord/payment-methods/bank-transfer            - Add bank account
PUT    /api/landlord/payment-methods/bank-transfer/{id}       - Update bank account
DELETE /api/landlord/payment-methods/bank-transfer/{id}       - Delete bank account
PUT    /api/landlord/payment-methods/cash                     - Update cash settings
```

## UI/UX Features

### Design Consistency
- Gradient backgrounds matching existing pages
- Modern card-based layouts
- Responsive design (mobile-friendly)
- Loading states with spinners
- Error handling with toast notifications
- Form validation

### Color Schemes
- **Landlord Profile**: Blue → Purple gradient
- **Caretaker Profile**: Green → Emerald gradient
- **Payment Methods**: Purple → Pink gradient

### Interactive Elements
- Copy-to-clipboard buttons for account details
- Toggle switches for active/inactive status
- Delete confirmations to prevent accidental deletion
- Photo upload with preview
- File size validation (max 5MB)
- Real-time form updates

## User Workflow

### For Landlords

1. **Set Up Profile**
   - Navigate to "My Profile" in sidebar
   - Upload professional photo
   - Fill in contact details and bio
   - Save profile

2. **Configure Payment Methods**
   - Navigate to "Payment Methods" in sidebar
   - Add mobile money accounts (as many as needed)
   - Add bank accounts (as many as needed)
   - Enable/disable cash payments
   - Toggle active/inactive per method
   - Save changes

3. **Tenants Can Now Pay**
   - Tenants visit `/pay-rent` page
   - See all active payment methods
   - Choose preferred method
   - Complete payment using displayed details

### For Caretakers

1. **Set Up Profile**
   - Navigate to "My Profile" in sidebar
   - Upload professional photo
   - Fill in contact details and bio
   - Add working hours and emergency contact
   - Save profile

### For Tenants

1. **View Payment Options**
   - Visit `/pay-rent` page
   - See landlord's active payment methods
   - Copy account details with one click
   - Use payment reference for tracking
   - Upload receipt after payment

## Testing Checklist

- [ ] Landlord can create/update profile
- [ ] Caretaker can create/update profile
- [ ] Photo upload works (validates size and type)
- [ ] Email field is read-only
- [ ] Payment methods page loads existing data
- [ ] Can add multiple mobile money accounts
- [ ] Can add multiple bank accounts
- [ ] Toggle switches update active status
- [ ] Delete buttons work with confirmation
- [ ] Cash payment toggle persists
- [ ] Pay-rent page shows only active methods
- [ ] Pay-rent page shows empty state when no methods
- [ ] Copy-to-clipboard works for all fields
- [ ] Form validation prevents empty submissions
- [ ] Toast notifications show for success/error
- [ ] Loading states display correctly
- [ ] Responsive design works on mobile

## Notes

- Profile photos are stored in backend storage
- Payment methods are per-landlord (tenants see their landlord's methods)
- Multiple payment methods can be configured for flexibility
- Inactive methods are hidden from tenants but retained in database
- All forms include proper error handling and loading states
- Backend must implement all specified endpoints for full functionality
