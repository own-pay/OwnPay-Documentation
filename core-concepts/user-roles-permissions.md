# User Roles and Permissions

Understanding OwnPay's role-based access control (RBAC) system.

## What is RBAC?

**Role-Based Access Control (RBAC)** defines what actions users can perform based on their assigned role.

Instead of granting permissions to individual users, you:
1. Create **roles** with specific permissions
2. Assign **users to roles**
3. Users inherit **all permissions** from their role

## Default Roles

OwnPay comes with built-in roles:

### Master Administrator
- **Scope:** Entire system
- **Access:** All brands
- **Permissions:** Everything
- **Use Case:** System owner/CTO
- **Count:** Usually 1-2 per installation

### Brand Manager
- **Scope:** Single brand
- **Access:** Only assigned brand
- **Permissions:** All brand features
- **Use Case:** Brand owner/manager
- **Count:** 1+ per brand

### Staff Member
- **Scope:** Single brand, limited features
- **Access:** Only assigned brand
- **Permissions:** Specific tasks (view payments, create invoices, etc.)
- **Use Case:** Team member handling payments
- **Count:** Multiple per brand

### View Only
- **Scope:** Single brand, read-only
- **Access:** Read payment data only
- **Permissions:** View transactions, reports, data
- **Use Case:** Accountant, auditor
- **Count:** As needed per brand

## Custom Roles

Create custom roles for specific needs:

### Create Custom Role
1. Go to **People → Roles**
2. Click **Add Role**
3. Enter role name (e.g., "Customer Support")
4. Select permissions (see below)
5. Click **Create**

### Assign to User
1. Go to **People → Staff**
2. Select user
3. Change **Role** dropdown
4. Click **Save**

## Permissions

Available permissions by category:

### Payments
- **View Transactions** - See transaction history
- **Create Payment Link** - Generate payment links
- **Create Invoice** - Generate invoices
- **Refund Payment** - Issue refunds
- **Dispute Payment** - Handle chargebacks
- **Export Transactions** - Download transaction data

### Customers
- **View Customers** - See customer list
- **Create Customer** - Add new customers
- **Edit Customer** - Modify customer data
- **Delete Customer** - Remove customers

### Reports
- **View Reports** - Access financial reports
- **Export Reports** - Download reports
- **View Analytics** - See dashboard metrics

### Gateways
- **View Gateways** - See configured gateways
- **Add Gateway** - Configure new gateway
- **Edit Gateway** - Modify gateway settings
- **Delete Gateway** - Remove gateway

### Staff
- **Manage Staff** - Add/remove team members
- **Manage Roles** - Create custom roles
- **Assign Roles** - Change user roles

### Settings
- **View Settings** - See brand settings
- **Edit Settings** - Modify configuration
- **Manage Webhooks** - Configure webhooks
- **Manage API Keys** - Create API keys

### Branding
- **Edit Branding** - Change logo, colors
- **Edit Email Templates** - Customize emails
- **Manage Domains** - Configure custom domains

## Permission Matrix

| Permission | Master Admin | Brand Mgr | Staff | View Only |
|-----------|---|---|---|---|
| View Transactions | ✅ | ✅ | ✅ | ✅ |
| Create Payment | ✅ | ✅ | ✅ | ❌ |
| Refund | ✅ | ✅ | ✅ | ❌ |
| Manage Gateways | ✅ | ✅ | ❌ | ❌ |
| Manage Staff | ✅ | ✅ | ❌ | ❌ |
| Edit Settings | ✅ | ✅ | ❌ | ❌ |
| View All Brands | ✅ | ❌ | ❌ | ❌ |

## Creating Users

### Add Staff Member
1. Go to **People → Staff**
2. Click **Add Staff**
3. Enter:
   - **Name** - Full name
   - **Email** - Login email
   - **Role** - Select role
   - **Brand** - Assign to brand (if brand manager or staff)
4. Click **Create**
5. User receives email invitation
6. User sets password
7. User can log in

### Invitation Process
1. Admin sends invitation
2. User receives email with link
3. User clicks link
4. User sets password
5. User logs in to account

## Permission Scope

### Master Administrator Scope
- Can access **all brands**
- Can create new brands
- Can manage all users
- Can view all transactions
- System-wide permissions

### Brand Manager Scope
- Can only access **assigned brand**
- Can manage brand settings
- Can manage brand staff
- Can view brand transactions
- Brand-level permissions

### Staff Scope
- Can only access **assigned brand**
- Limited to specific features
- Cannot change settings
- Cannot manage other staff
- Task-level permissions

## Best Practices

### Least Privilege
- ✅ Grant **minimum permissions** needed
- ✅ Use **specific roles** not admin
- ✅ Regularly **audit permissions**
- ✅ Remove access when role changes

### Role Design
- ✅ Create roles for **common positions**
- ✅ Use **descriptive names** (e.g., "Finance Team")
- ✅ Document **role purposes**
- ✅ Review roles **quarterly**

### User Management
- ✅ Use **unique email addresses**
- ✅ Require **strong passwords**
- ✅ Enable **two-factor authentication**
- ✅ Audit **user access logs**

### Security
- ✅ Remove inactive users
- ✅ Rotate API keys regularly
- ✅ Monitor unusual activity
- ✅ Log all permission changes

## Example Roles

### Customer Support
- View Transactions
- View Customers
- Create Payment Link (for customer requests)
- View Reports
- Cannot: Change settings, Manage gateways

### Accountant
- View Transactions
- View Reports
- Export Reports
- Cannot: Create payments, Manage gateways

### Finance Manager
- All payment permissions
- View/Export Reports
- Manage Gateways (read-only)
- Cannot: Manage staff, Edit settings

### Developer
- View Transactions
- Manage API Keys
- Manage Webhooks
- Cannot: Change branding, Manage staff

## Delegation

Proper delegation using roles:

### Company Structure
```
Owner (Master Admin)
├── Finance Manager (Brand Manager)
│   ├── Accountant (View Only)
│   └── Payment Processor (Staff - Payments)
├── Support Manager (Brand Manager)
│   └── Support Team (Staff - Limited)
└── Developer (Custom Role - Tech)
```

### Benefits
- Clear **authority levels**
- **Audit trail** of changes
- **Security** through least privilege
- **Scalability** as team grows

## Troubleshooting

### User Can't Access Feature
1. Check **user's role** (People → Staff)
2. Check **role's permissions** (People → Roles)
3. Verify **role assigned to correct brand**
4. Check **brand assignment**
5. Ask user to **log out and back in**

### Lost Admin Access
1. Another admin can **restore access**
2. Or contact **OwnPay support**
3. Recovery process takes **24 hours**

### Auditing Access
1. Go to **Reports → Audit Log**
2. Filter by **user**
3. View **all actions** by that user
4. Check for **suspicious activity**

## Summary

OwnPay RBAC provides:
- ✅ **Granular control** over permissions
- ✅ **Scalable** team management
- ✅ **Audit trail** of all actions
- ✅ **Security** through least privilege

Ready to set up your team? → [Staff Directory](/user-guide/people/staff)
