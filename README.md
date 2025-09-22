# PropertyHub - Ghanaian Property Management System

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/sunday-binakins-projects/v0-empty-conversation)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/RMxis8CwcHa)

## Overview

PropertyHub is a comprehensive property management system designed specifically for the Ghanaian market. It features role-based access control, manual workflow emphasis, Ghana-specific localization (Ghana Cedi currency, Ghana Card verification, Ghana Post GPS addresses), and comprehensive property portfolio management tools.

## Application Routes

### Root Routes
- **`/`** - Home page that redirects to dashboard
- **`/dashboard`** - Main dashboard with role-based content

### Landlord/Property Manager Routes
- **`/properties`** - Property portfolio management with grid/list views, filtering, and bulk actions
- **`/properties/[id]`** - Individual property detail page with units management
- **`/finance`** - Financial management overview with charts and analytics
- **`/invoices`** - Invoice management and generation system
- **`/payments`** - Manual payment tracking with Mobile Money, Bank Transfer, and Cash support
- **`/rent-roll`** - Comprehensive rent roll and lease management
- **`/tenants`** - Tenant management with Ghana Card verification and manual approval workflows
- **`/tenants/[id]`** - Individual tenant profile page with payment history
- **`/maintenance`** - Maintenance operations with Kanban board and table views
- **`/reports`** - Financial analytics with rent collection and occupancy reports
- **`/profile`** - Landlord profile and settings with business information

### Super Admin Routes
- **`/admin/users`** - User management with role controls and impersonation capabilities
- **`/admin/properties`** - Property oversight and landlord assignment management
- **`/admin/verification`** - Property verification queue with fraud detection
- **`/admin/reports`** - Reports and analytics with financial insights and export options
- **`/admin/activity`** - System audit logs and security tracking
- **`/admin/disputes`** - Dispute resolution center for tenant-landlord conflicts
- **`/admin/settings`** - System-wide configuration and settings

### Caretaker Routes
- **`/dashboard`** - Caretaker dashboard with assigned properties and maintenance overview
- **`/properties`** - Read-only view of assigned properties and units with tenant contact info
- **`/tenants`** - Tenant directory with contact actions (Call/Message buttons)
- **`/maintenance`** - Maintenance requests management with status updates and notes
- **`/meter-readings`** - Utility meter readings submission for electricity and water
- **`/profile`** - Caretaker profile and settings with work information

## User Roles & Access

### Super Admin
- **Full System Access**: All routes and administrative functions
- **User Management**: Create, approve, deactivate users and impersonate for troubleshooting
- **Property Oversight**: View all properties across landlords with verification controls
- **Fraud Detection**: Property verification queue with automated checks
- **System Monitoring**: Comprehensive audit logs and security tracking
- **Dispute Resolution**: Mediation tools for tenant-landlord conflicts
- **Analytics**: System-wide reports and financial insights

### Landlord
- **Property Portfolio**: Manage their own properties with full CRUD operations
- **Financial Management**: Track rent, expenses, and generate invoices
- **Tenant Management**: Handle tenant applications, approvals, and lease agreements
- **Maintenance Operations**: Create and track maintenance requests and assignments
- **Payment Tracking**: Record and monitor rent payments manually
- **Reporting**: Access to rent collection and occupancy analytics

### Caretaker
- **Limited Property Access**: View only assigned properties in read-only mode
- **Tenant Directory**: Access tenant contact information for communication
- **Maintenance Management**: Core responsibility - manage maintenance requests with status updates
- **Meter Readings**: Submit utility readings for landlord billing purposes
- **Task-Oriented Dashboard**: Focused view of assigned properties and active maintenance requests

### Tenant (Portal Access)
- **Payment Submission**: Submit rent payments through landlord's system
- **Maintenance Requests**: Submit maintenance requests via tenant portal
- **Lease Information**: View lease details and payment history

## Caretaker Workflow

### Dashboard Overview
- **Assigned Properties**: Simple list of properties under caretaker's management
- **Active Maintenance Requests**: Grouped by priority (Urgent, Normal) with quick status overview
- **Recent Activity**: Feed of caretaker's own actions (meter readings, maintenance updates)

### Properties & Units (Read-Only)
- **Property Information**: Address, landlord contact, and basic property details
- **Units Overview**: List of units with occupancy status and current tenant names
- **Contact Information**: Tenant phone numbers for direct communication

### Tenant Directory
- **Searchable List**: All tenants in assigned properties with contact details
- **Communication Tools**: Direct Call and Message buttons for tenant contact
- **Unit Information**: Clear mapping of tenants to their respective units

### Maintenance Requests (Core Function)
- **Status Management**: Update requests from "New" → "In Progress" → "Resolved"
- **Progress Notes**: Add detailed updates and cost tracking
- **Priority Handling**: Visual indicators for urgent vs normal requests
- **Tenant Communication**: Direct contact options for maintenance coordination

### Meter Readings Submission
- **Utility Tracking**: Submit electricity and water meter readings
- **Automated Forms**: Pre-filled dates and unit information
- **Reading History**: Track submission patterns and overdue readings
- **Landlord Integration**: Readings sent directly to landlord for billing

## Key Features

### Ghana-Specific Features
- **Currency**: Ghana Cedi (₵) formatting throughout the system
- **Phone Numbers**: Ghana phone number formatting (+233)
- **Addresses**: Ghana Post GPS address support
- **Identification**: Ghana Card ID verification for tenants
- **Regions**: Ghana regions for property location context
- **Payment Methods**: Mobile Money (MTN, Vodafone, AirtelTigo), Bank Transfer, Cash

### Technical Features
- **State Management**: Redux Toolkit for comprehensive state management
- **Responsive Design**: Mobile-first design with hamburger navigation
- **Role-Based Navigation**: Dynamic sidebar based on user permissions
- **Manual Workflows**: Emphasis on manual processes over automation
- **Interactive Charts**: Financial and occupancy analytics using Recharts
- **Export Capabilities**: PDF and Excel export for reports and data

## Navigation Structure

The application uses role-based navigation defined in `/components/sidebar.tsx`:

**Super Admin Navigation:**
1. Dashboard → System monitoring and health metrics
2. User Management → User oversight and role controls
3. Property Oversight → Cross-landlord property management
4. Verification Queue → Property fraud detection and approval
5. Reports & Analytics → System-wide insights and exports
6. Dispute Resolution → Tenant-landlord conflict mediation
7. System Activity → Audit logs and security tracking
8. System Settings → Platform configuration

**Landlord Navigation:**
1. Dashboard → Portfolio overview and manual task tracking
2. Properties → Property management with filtering and bulk actions
3. Finance → Revenue tracking and financial management
4. Invoices → Invoice generation and management
5. Payments → Manual payment recording and tracking
6. Rent Roll → Lease management and rent tracking
7. Tenants → Tenant lifecycle management
8. Maintenance → Maintenance operations and ticketing
9. Reports → Financial analytics and occupancy insights
10. Profile & Settings → Business information and preferences

**Caretaker Navigation:**
1. Dashboard → Assigned properties and maintenance overview
2. Properties & Units → Read-only property and tenant information
3. Tenant Directory → Contact information with communication tools
4. Maintenance Requests → Core workflow for request management
5. Meter Readings → Utility readings submission
6. Profile & Settings → Personal information and work details

## Development

This repository stays in sync with your deployed chats on [v0.app](https://v0.app).
Any changes made to your deployed app will be automatically pushed to this repository.

### Deployment

Your project is live at:
**[https://vercel.com/sunday-binakins-projects/v0-empty-conversation](https://vercel.com/sunday-binakins-projects/v0-empty-conversation)**

### Continue Building

Continue building your app on:
**[https://v0.app/chat/projects/RMxis8CwcHa](https://v0.app/chat/projects/RMxis8CwcHa)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
