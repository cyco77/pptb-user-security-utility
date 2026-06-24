# User & Team Security Documentation Generator

![User & Team Security](https://raw.githubusercontent.com/cyco77/pptb-user-security-utility/HEAD/icon/user-team-security_small.png)

A Power Platform Toolbox (PPTB) tool for viewing and documenting Dynamics 365 user and team security configurations. This tool provides an intuitive interface to explore security roles, team memberships, and export documentation in multiple formats.

## Screenshots

### Dark Theme

![User & Team Security - Dark Theme](https://raw.githubusercontent.com/cyco77/pptb-user-security-utility/HEAD/screenshots/main_dark.png)

### Light Theme

![User & Team Security - Light Theme](https://raw.githubusercontent.com/cyco77/pptb-user-security-utility/HEAD/screenshots/main_light.png)

## Features

### Core Capabilities

- 👥 **User & Team Browser** - View all system users and teams in your Dynamics 365 environment
- 🔐 **Security Role Details** - Display directly assigned security roles for users and teams
- 👔 **Team Membership** - View all team memberships for system users
- 👥 **Team Members** - View all system users assigned to a selected team
- 📬 **Queue Memberships** - View all queue assignments for system users
- 🔍 **Advanced Filtering**:
  - Filter by entity type (System Users / Teams)
  - Filter users by status (All / Enabled / Disabled)
  - Filter users by type (All / Users / Applications) - defaults to regular users
  - Filter by business unit
  - Real-time text search across names and domains
  - Filter team members in the details panel
- 📊 **Interactive Data Grid**:
  - Single-row selection to view details
  - Sortable columns with default sorting by name
  - Resizable columns for both users and teams
  - Tooltips on hover for full text content
- 📱 **Detail Side Panel** - Displays selected user/team with:
  - All directly assigned security roles with managed status indicators
  - Team memberships (for users) with team type and default team badges
  - Team members (for teams) with searchable/filterable list
  - Queue memberships (for users) with queue type information
  - Business unit information
- 📤 **Multiple Export Formats**:
  - **CSV Matrix Export** - Roles, teams, and queues as columns, users as rows, 'X' marks assignments
  - **Markdown Export** - Copy formatted documentation to clipboard with full details
  - UTF-8 encoding with BOM for proper character support (German umlauts, etc.)
  - Windows-style line endings for better Excel compatibility
- 📢 **Visual Notifications** - Toast notifications for successful exports and errors
- 🎨 **Theme Support** - Automatic light/dark theme switching based on PPTB settings

## License

MIT - See LICENSE file for details

## Author

Lars Hildebrandt
