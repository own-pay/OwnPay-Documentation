# Version Registry & Updates

The OwnPay Version Registry provides access to all OwnPay releases, version information, and update management.

**Website:** [update.ownpay.org](https://update.ownpay.org)

## About Version Registry

The Version Registry is a centralized hub for:
- **Latest releases** and version history
- **Release notes** and changelog
- **Download links** for all versions
- **Update notifications** and alerts
- **Upgrade guides** and migration paths

## Current Release

The latest stable version of OwnPay is available for download and installation.

### What's New in Latest Version
- Bug fixes and security patches
- Performance improvements
- New features and capabilities
- Plugin and theme updates
- Dependency updates

See [Changelog](/user-guide/changelog) for detailed list of changes.

## Version History

### Latest Versions
- **v2.x.x** - Current stable release
- **v1.x.x** - Previous stable release
- **Beta/Dev** - Development versions (for testing only)

### Download Versions
All OwnPay versions are available for download from [update.ownpay.org](https://update.ownpay.org):

1. Go to [update.ownpay.org](https://update.ownpay.org)
2. Select desired version
3. Download the ZIP file
4. Follow [Installation Guide](/getting-started/installation)

## Update Management

### Check for Updates
In your OwnPay admin panel:
1. Go to **System → System Update**
2. Click "Check for Updates"
3. See available versions
4. View update notes

### Update Your Installation
**From admin panel:**
1. Go to **System → System Update**
2. Click "Update Now"
3. Follow on-screen instructions
4. Review backup notifications
5. Confirm update

**Manual update:**
1. Backup your installation
2. Download new version
3. Extract files
4. Run installer at `/install`
5. Follow wizard

## Release Schedule

- **Major versions** (v2.0, v3.0) - Yearly or as needed
- **Minor versions** (v2.1, v2.2) - Quarterly
- **Patch versions** (v2.1.1, v2.1.2) - As needed for bugs/security

## Release Types

### Stable Releases
- **Recommended** for production
- Thoroughly tested
- Long-term support
- Download from registry

### Beta Releases
- **For testing only** - not production
- Early access to new features
- May contain bugs
- Feedback appreciated

### Development Releases
- **For developers only**
- Bleeding edge features
- Unstable and untested
- Use only in dev environment

## Update Checklist

Before updating:
- [ ] **Backup your database** - Full database dump
- [ ] **Backup your files** - Copy entire installation
- [ ] **Test in staging** - Update staging first
- [ ] **Review changelog** - Check what's changing
- [ ] **Check plugin compatibility** - Verify plugins support new version
- [ ] **Notify users** - Let admins know about maintenance window
- [ ] **Plan rollback** - Have restore procedure ready

During update:
- [ ] **Follow update wizard** - Don't skip steps
- [ ] **Monitor process** - Watch for errors
- [ ] **Check admin panel** - Verify it loads
- [ ] **Test key features** - Payments, reporting, etc.
- [ ] **Review logs** - Check for errors

After update:
- [ ] **Update plugins** - Check for plugin updates
- [ ] **Update themes** - Check for theme updates
- [ ] **Clear cache** - Full cache clear if needed
- [ ] **Monitor** - Watch for issues in logs
- [ ] **Notify users** - Update complete, system online

## Troubleshooting Updates

### Update Failed?
1. Check [System Requirements](/getting-started/requirements)
2. Verify file permissions (storage/logs writable)
3. Check PHP version (8.3+)
4. Check disk space (1GB+)
5. Review error logs
6. Restore from backup if critical

### Issues After Update?
1. Check [Troubleshooting](/advanced-topics/troubleshooting)
2. Clear application cache
3. Disable problematic plugins
4. Check [Changelog](/user-guide/changelog) for known issues
5. Contact [Enterprise Support](/resources/external-services/enterprise-support)

## Staying Updated

### Email Notifications
Enable update notifications:
1. Go to [update.ownpay.org](https://update.ownpay.org)
2. Create account
3. Add your installations
4. Enable notifications
5. Receive email on new versions

### RSS Feed
Subscribe to release feed at [update.ownpay.org](https://update.ownpay.org/rss)

### Community Forum
Join discussions at [GitHub Discussions](https://github.com/own-pay/OwnPay/discussions)

## Version Support Policy

| Version | Released | Support Until | Status |
|---------|----------|----------------|--------|
| v2.x.x | Jan 2024 | Jan 2026 | Current |
| v1.x.x | Jan 2023 | Jan 2025 | Maintenance |
| v0.x.x | 2022 | 2023 | End of Life |

- **Current** - Full support, regular updates
- **Maintenance** - Critical fixes only
- **End of Life** - No support, no updates

We recommend upgrading to the latest version for security and features.

## Security Updates

Critical security updates are released as soon as available, regardless of version schedule.

Subscribe to security alerts at [update.ownpay.org](https://update.ownpay.org) to stay informed.

---

**Check for updates:** [update.ownpay.org](https://update.ownpay.org)

**Need help updating?** See [System Update Guide](/user-guide/system/system-update) or contact [Enterprise Support](/resources/external-services/enterprise-support)
