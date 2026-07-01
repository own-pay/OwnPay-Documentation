# Security and Compliance

Security best practices, compliance features, and hardening guidelines for OwnPay.

## Core Security Features

OwnPay includes **industry-standard security** by default:

### Encryption

- ✅ **HTTPS/TLS 1.2+** - All traffic encrypted
- ✅ **Database encryption** - Sensitive data encrypted at rest
- ✅ **API key hashing** - Keys hashed, not plaintext
- ✅ **Password hashing** - Bcrypt with salt

### Data Protection

- ✅ **No card storage** - Tokenized payments only
- ✅ **PCI compliance** - Built-in, not retrofit
- ✅ **Secrets management** - Environment variables only
- ✅ **Input validation** - SQL injection prevention

### Authentication

- ✅ **Strong password requirements** - Minimum 12 characters
- ✅ **Two-factor authentication (2FA)** - TOTP (Google Authenticator)
- ✅ **Session timeouts** - Auto-logout after inactivity
- ✅ **Account lockout** - After failed login attempts

### Authorization

- ✅ **Role-based access control (RBAC)** - Granular permissions
- ✅ **Least privilege** - Default deny, explicit allow
- ✅ **Audit logging** - All actions logged
- ✅ **Permission enforcement** - Server-side validation

## PCI-DSS Compliance

### Requirement 1: Network Security

- ✅ Install firewall
- ✅ Restrict unnecessary ports
- ✅ Block direct internet access to database
- ✅ Use private subnets when possible

### Requirement 2: Secure Configuration

- ✅ Strong passwords for all accounts
- ✅ Disable unnecessary services
- ✅ Change default credentials
- ✅ Keep system patched

### Requirement 3: Cardholder Data Protection

- ✅ **Don't store sensitive data:**
  - Card numbers (PAN)
  - Expiration dates
  - CVV codes
  - Track data
- ✅ OwnPay handles via tokenization
- ✅ Store only last 4 digits if needed

### Requirement 4: Encryption

- ✅ Encrypt data **in transit** (HTTPS)
- ✅ Encrypt data **at rest** (database)
- ✅ Use strong cryptography (AES-256, TLS 1.2+)
- ✅ Manage encryption keys securely

### Requirement 5: Malware Protection

- ✅ Run antivirus/anti-malware
- ✅ Keep software updated
- ✅ Monitor file integrity
- ✅ Restrict file upload locations

### Requirement 6: Security Updates

- ✅ **Critical:** Update within 30 days
- ✅ **High:** Update within 90 days
- ✅ **Medium:** Update within 6 months
- ✅ OwnPay auto-notifies of updates

### Requirement 7: Access Control

- ✅ Limit access by role
- ✅ Assign unique user IDs
- ✅ Restrict physical server access
- ✅ Monitor access logs

### Requirement 8: Authentication

- ✅ Unique user IDs
- ✅ Strong passwords (12+ chars, complexity)
- ✅ Two-factor authentication
- ✅ Session management

### Requirement 9: Physical Security

- ✅ Restrict server room access
- ✅ Monitor entry/exit
- ✅ Secure cables
- ✅ CCTV or security guards

### Requirement 10: Logging & Monitoring

- ✅ Log all access
- ✅ Monitor for suspicious activity
- ✅ Protect logs from deletion
- ✅ Retain logs 1 year

### Requirement 11: Testing & Monitoring

- ✅ Run regular security tests
- ✅ Penetration testing annually
- ✅ Vulnerability scanning quarterly
- ✅ Monitor for breaches

### Requirement 12: Policy & Training

- ✅ Maintain security policy
- ✅ Train all staff
- ✅ Document procedures
- ✅ Incident response plan

## GDPR Compliance

### Data Protection

- ✅ **Purpose limitation** - Only store data for stated purpose
- ✅ **Data minimization** - Collect only necessary data
- ✅ **Accuracy** - Keep data current
- ✅ **Storage limitation** - Delete when no longer needed
- ✅ **Integrity & confidentiality** - Secure and encrypted

### User Rights

OwnPay supports GDPR rights:

- ✅ **Access** - Download personal data
- ✅ **Rectification** - Correct inaccurate data
- ✅ **Erasure** - Delete account and data
- ✅ **Restrict processing** - Limit how data is used
- ✅ **Data portability** - Export in machine-readable format

### Implementation

1. Go to **Settings → Compliance**
2. Configure data retention policies
3. Enable audit logs
4. Set up data export/deletion procedures
5. Document privacy policy

### Data Export

1. Go to **Reports → Export Data**
2. Select date range
3. Choose format (CSV, JSON)
4. Download exported data

### Data Deletion

1. **Customer deletion** - Removes customer and transactions
2. **Full deletion** - Erase all personal data permanently
3. **Pseudonymization** - Replace identifiable data with codes

⚠️ **Note:** Some data retained for legal/tax reasons (7 years minimum).

## Data Security Best Practices

### Server Security

```bash
# Update regularly
apt update && apt upgrade

# Secure SSH
- Disable password login
- Use SSH keys only
- Change default port 22
- Restrict IP access

# Firewall
- Allow only necessary ports (80, 443)
- Block all unnecessary inbound
- Monitor outbound traffic

# Backups
- Daily encrypted backups
- Store offsite
- Test restoration monthly
```

### Application Security

- ✅ Keep OwnPay updated
- ✅ Run security patches immediately
- ✅ Monitor for vulnerabilities
- ✅ Use secure passwords for database/admin

### Database Security

```bash
# Strong credentials
- Long random password
- Unique username
- Never use 'root' for app

# Access control
- Restrict database user permissions
- Allow app to read/write only necessary tables
- Disable remote connections

# Encryption
- Enable MySQL encryption
- Use SSL for connections
- Encrypt backups
```

### API Security

- ✅ Rotate API keys quarterly
- ✅ Use separate keys per application
- ✅ Monitor API usage
- ✅ Revoke unused keys
- ✅ Never commit keys to git

### Webhook Security

- ✅ Verify webhook signatures
- ✅ Use HTTPS only
- ✅ Validate webhook source
- ✅ Implement rate limiting
- ✅ Log all webhook activity

## Authentication & Authorization

### Strong Passwords

**Requirements:**

- Minimum 12 characters
- Mix of uppercase & lowercase
- At least one number
- At least one special character (!@#$%^&*)
- Not common words or patterns

**Examples:**

- ✅ MyP@ssw0rd2024Secure
- ❌ password123
- ❌ Password1

### Two-Factor Authentication (2FA)

**Setup:**

1. Go to **Account → Security**
2. Click **Enable Two-Factor**
3. Scan QR code with Google Authenticator, Authy, or Microsoft Authenticator
4. Enter 6-digit code to verify
5. Save backup codes in secure location

**Backup codes:**

- 10 single-use codes
- Use if phone lost
- Store in password manager
- Never share

### Session Management

- **Timeout:** 30 minutes of inactivity
- **Maximum session:** 24 hours
- **Device tracking:** Active sessions shown
- **Logout all:** Revoke all sessions

Go to **Account → Active Sessions** to see and logout devices.

### API Key Security

**Creation:**

1. Go to **Developers → API Keys**
2. Click **Create Key**
3. Copy key (shown once only)
4. Save in password manager
5. Never commit to git

**Rotation:**

```bash
# Every 3 months
1. Create new key
2. Update all applications
3. Test in production
4. Delete old key
5. Verify no errors
```

## Audit & Compliance Reporting

### Audit Logs

**Access:**

1. Go to **Reports → Audit Log**
2. Filter by date, user, action
3. View all activity

**Events logged:**

- Login/logout
- Permission changes
- Data modifications
- Configuration changes
- API usage
- Payment processing

### Security Reports

**Monthly checks:**

- [ ] Review audit logs for suspicious activity
- [ ] Check failed login attempts
- [ ] Verify all users active
- [ ] Check for unusual API usage
- [ ] Review webhook failures

**Quarterly checks:**

- [ ] Rotate API keys
- [ ] Update access list
- [ ] Review user permissions
- [ ] Update security policy
- [ ] Run vulnerability scan

### Compliance Checklist

- [ ] HTTPS enabled on all connections
- [ ] Strong passwords enforced
- [ ] 2FA enabled for admins
- [ ] Backups tested monthly
- [ ] Audit logs retained
- [ ] Data encrypted at rest
- [ ] API keys rotated quarterly
- [ ] Updates applied promptly
- [ ] Intrusion detection enabled
- [ ] Privacy policy documented

## Incident Response

### Security Incident

**Immediate actions:**

1. Isolate affected system
2. Stop data exfiltration
3. Preserve evidence/logs
4. Don't alter compromised files
5. Contact OwnPay security team

### Report Security Issue

```
Email: security@ownpay.org

Include:
- Description of vulnerability
- Steps to reproduce
- Impact assessment
- Your contact information
```

**Responsible disclosure:**

- Don't publish publicly
- Give OwnPay 90 days to fix
- Don't access others' data
- Test only on test accounts

### Data Breach Response

**Within 24 hours:**

1. Assess scope (who/what affected)
2. Notify affected customers
3. Document findings
4. Preserve evidence

**Communication:**

- Transparent about incident
- Explain what happened
- List what data exposed
- Steps being taken
- How to monitor for fraud

## Hardening Guide

### Minimum Security

For small/low-risk deployments:

- ✅ HTTPS enabled
- ✅ Strong admin password
- ✅ Keep software updated
- ✅ Regular backups
- ✅ Monitor logs

### Standard Security

For typical deployments:

- ✅ Everything above, plus:
- ✅ 2FA for all admins
- ✅ Regular security scans
- ✅ Encrypted backups
- ✅ Daily backup verification
- ✅ Audit log review weekly

### High Security

For regulated industries/large data:

- ✅ Everything above, plus:
- ✅ Hardware security key (instead of 2FA)
- ✅ Intrusion detection system (IDS)
- ✅ Web application firewall (WAF)
- ✅ Real-time log monitoring
- ✅ Annual penetration testing
- ✅ Dedicated security engineer
- ✅ Compliance certification

### PCI-Level Security

For full PCI-DSS compliance:

- ✅ Everything above, plus:
- ✅ Quarterly vulnerability scans
- ✅ Annual penetration testing
- ✅ Network segmentation
- ✅ Intrusion prevention (IPS)
- ✅ SIEM (Security Information & Event Management)
- ✅ 24/7 security monitoring
- ✅ Incident response team

## Common Vulnerabilities

### SQL Injection

**How OwnPay prevents:**

- ✅ Parameterized queries everywhere
- ✅ Input validation
- ✅ Escaping special characters

**What you should do:**

- Never use string concatenation for SQL
- Always use parameterized statements
- Validate input lengths and format

### Cross-Site Scripting (XSS)

**How OwnPay prevents:**

- ✅ HTML escaping on output
- ✅ Content-Security-Policy header
- ✅ Input sanitization

**What you should do:**

- Never inject raw user input into HTML
- Use framework template escaping
- Sanitize user-generated content

### CSRF (Cross-Site Request Forgery)

**How OwnPay prevents:**

- ✅ CSRF tokens on all forms
- ✅ SameSite cookie attribute
- ✅ Origin verification

**What you should do:**

- Validate CSRF tokens
- Never allow state-changing requests via GET
- Use POST for modifications

### Man-in-the-Middle (MITM)

**How OwnPay prevents:**

- ✅ HTTPS/TLS 1.2+
- ✅ Webhook signature verification
- ✅ API key authentication

**What you should do:**

- Always use HTTPS
- Verify SSL certificates
- Pin important certificates

## Security Monitoring

### Real-Time Monitoring

**Enable:**

1. Go to **Settings → Security**
2. Click **Enable Monitoring**
3. Set alert email
4. Configure sensitivity

**Alerts for:**

- Multiple failed logins
- Unusual IP access
- API key usage patterns
- Large data exports
- Permission changes

### Log Analysis

```bash
# Search for failed logins
grep "failed login" storage/logs/*.log

# Find deleted users
grep "user deleted" storage/logs/*.log

# Check API usage
grep "API key" storage/logs/*.log
```

## Third-Party Integrations

### Trusted Partners Only

- ✅ Vet all integrations
- ✅ Check security posture
- ✅ Review data sharing
- ✅ Audit periodically

### Payment Gateways

- ✅ Use official, vetted gateways
- ✅ Never pass raw card data to custom services
- ✅ Verify OAuth credentials
- ✅ Monitor gateway security updates

### External Services

- ✅ Limit permissions to necessary scope
- ✅ Use API keys instead of passwords
- ✅ Rotate credentials regularly
- ✅ Disable unused integrations

## Summary

OwnPay security:

- ✅ **PCI-DSS compliant** - Industry standard
- ✅ **GDPR ready** - Data protection built-in
- ✅ **Encrypted** - In transit and at rest
- ✅ **Auditable** - Full activity logs
- ✅ **Updated** - Regular security patches

Security is **everyone's responsibility** - keep software updated, use strong passwords, enable 2FA, monitor logs, and report issues promptly.

**Questions?** → [Enterprise Support](/resources/external-services/enterprise-support.md)
