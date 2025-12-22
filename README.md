# User & Team Security Documentation Generator

<p align="center">
  <img src="icon/user-team-security_small.png" alt="User & Team Security Logo">
</p>

<p align="center">
  A Power Platform Tool Box (PPTB) tool for viewing and documenting Dynamics 365 user and team security configurations. This tool provides an intuitive interface to explore security roles, team memberships, and export documentation in multiple formats.
</p>

## Screenshots

### Dark Theme

![User & Team Security - Dark Theme](screenshots/main_dark.png)

### Light Theme

![User & Team Security - Light Theme](screenshots/main_light.png)

## Features

### Core Capabilities

- � **User & Team Browser** - View all system users and teams in your Dynamics 365 environment
- 🔐 **Security Role Details** - Display directly assigned security roles for users and teams
- 👔 **Team Membership** - View all team memberships for system users
- 🔍 **Advanced Filtering**:
  - Filter by entity type (System Users / Teams)
  - Filter users by status (All / Enabled / Disabled)
  - Filter users by type (All / Users / Applications) - defaults to regular users
  - Filter by business unit
  - Real-time text search across names and domains
- 📊 **Interactive Data Grid**:
  - Single-row selection to view details
  - Sortable columns with default sorting by name
  - Resizable columns
- 📱 **Detail Side Panel** - Displays selected user/team with:
  - All directly assigned security roles
  - Team memberships (for users)
  - Business unit information
  - Managed role indicators
- 📤 **Multiple Export Formats**:
  - **CSV Matrix Export** - Roles and teams as columns, users as rows, 'X' marks assignments
  - **Markdown Export** - Copy formatted documentation to clipboard
- 📢 **Visual Notifications** - Toast notifications for successful exports
- 🎨 **Theme Support** - Automatic light/dark theme switching based on PPTB settings

### Technical Stack

```
- ✅ user-security-utility/
  ├── src/
  │ ├── components/
  │ │ ├── DataGridView.tsx # Data grid for users/teams with selection
  │ │ ├── Filter.tsx # Entity type, status, user type, and business unit filtering
  │ │ ├── Overview.tsx # Main container component with export functionality
  │ │ └── SecurityRolesPanel.tsx # Side panel displaying roles and team memberships
  │ ├── hooks/
  │ │ ├── useConnection.ts # Dataverse connection management
  │ │ ├── useToolboxAPI.ts # Toolbox API hook
  │ │ └── useToolboxEvents.ts # PPTB event subscription
  │ ├── services/
  │ │ ├── dataverseService.ts # Dataverse API queries for users, teams, and roles
  │ │ └── loggerService.ts # Centralized logging singleton
  │ ├── types/
  │ │ ├── systemUser.ts # System user type definitions
  │ │ ├── team.ts # Team type definitions
  │ │ └── securityRole.ts # Security role type definitions
  │ ├── App.tsx # Main application component
  │ ├── main.tsx # Entry point
  │ └── index.css # Global styling
  ├── icon/ # Application icons
  ├── screenshots/ # Screenshots for documentationep data to models
  ├── index.html
  ├── package.json
  ├── tsconfig.json
  └── vite.config.ts

```

## Installation

### Prerequisites

- Node.js >= 18.0.0
- npm oruser-security-utility
- Power Platform Toolbox installed

### Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd pptb-plugin-documentation-generator
```

2. Install dependencies:

```bash
npm install
```

## Development

### Development Server

Start development server with HMR:

```bash
npm run dev
```

The tool will be available at `http://localhost:5173`

### Watch Mode

Build the tool in watch mode for continuous updates:

```bash
npm run watch
```

### Production Build

Build the optimized production version:

```bash
npm run build
```

The output will be in the `dist/` directory.

### Preview Build

Preview the production build locally:

```bash
npm run preview
```

## Usage

### In Power Platform Toolbox

1. Build the tool:

   ```bash
   npm run build
   ```

2. Package the tool (creates npm-shrinkwrap.json):
   tool to view users and teams

### User Interface

#### Filter Section

- **Entity Type Dropdown**: Switch between System Users and Teams
- **Status Filter** (Users only): All / Enabled / Disabled
- **User Type Filter** (Users only): All / Users / Applications (defaults to Users)
- **Business Unit Dropdown**: Filter by business unit
- **Search Box**: Real-time search across user/team names, domain names, and business units

#### Export Buttons (Users only)

- **Export to CSV**: Downloads a matrix-style CSV where:
  - Rows represent users
  - Columns represent security roles and team memberships
  - 'X' marks indicate assignments
  - Includes user details (name, domain, business unit, status)
- **Copy as Markdown**: Copies detailed report to clipboard with:
  - Hierarchical structure per user
  - Security roles with managed status and business unit
  - Team memberships with type and default indicators

#### Data Grid

- Click any row to select and view details
- Selected row is highlighted
- Click column headers to sort (default: sorted by name)
- Supports both System Users and Teams views

#### Security Details Panel

Appears on the right when a user or team is selected:

- **Header**: Shows user/team name
- **Security Roles Section**: Lists all directly assigned security roles with:
  - Role name
  - "Managed" badge for managed roles
  - Business unit information
- **Team Memberships Section** (Users only): Lists all team memberships with:
  - Team name
  - Team type (Owner/Access)
  - "Default" badge for default teams
  - Business unit information
- Click column headers to sort
- Drag column borders to resize
- View tooltips on hover for full text content

#### Evensystem users

const users = await window.dataverseAPI.queryData(
"systemusers?$select=systemuserid,fullname,domainname,isdisabled,applicationid&$expand=businessunitid($select=businessunitid,name)&$orderby=fullname"
);

// Query teams
const teams = await window.dataverseAPI.queryData(
"teams?$select=teamid,name,teamtype,isdefault&$expand=businessunitid($select=businessunitid,name)&$orderby=name"
);

// Query security roles for a user
const roles = await window.dataverseAPI.queryData(
`systemusers(${userId})/systemuserroles_association?$select=roleid,name,ismanaged&$expand=businessunitid($select=businessunitid,name)`
);

// Query teams for a user
const userTeams = await window.dataverseAPI.queryData(
`systemusers(${userId})/teammembership_association?$select=teamid,name,teamtype,isdefault&$expand=businessunitid($select=businessunitid,name)
The tool demonstrates various Power Platform Toolbox and Dataverse API features:

### Connection Management

```typescript
// Get current connection
const connection = await window.toolboxAPI.getConnection();
console.log(connection.connectionUrl);

// Listen for connection changes
window.toUser security data has been exported to CSV successfully."ata with new connection
  }
});
```

### Dataverse Queries

```typescript
// Query plugin assemblies
const assemblies = await window.dataverseAPI.executeQuery(
  `pluginassemblies?$select=name,versio
  "user-security-export-2025-12-23.csv",
  csvContent
);

// Copy to clipboard
await window.toolboxAPI.utils.copyToClipboard(markdownC
const steps = await window.dataverseAPI.executeQuery(
  `sdkmessageprocessingsteps?$select=...&$filter=...&$expand=...`
);
```

### Notifications

```typescript
await window.toolboxAPI.utils.showNotification({
  title: "Export Successful",
  body: "Exported 15 plugin assembly steps",
  type: "success",
  duration: 3000,
});
```

### File Operations

```typescript
// Save file
await window.toolboxAPI.utils.saveFile("plugin_steps.csv", csvContent);

// Copy to clipboard
await window.toolboxAPI.utils.copyToClipboard(content);
```

### Theme Management

```typescript
// Get current theme
const theme = await window.toolboxAPI.utils.getCurrentTheme();
// Returns 'light' or 'dark'

// Listen for theme changes
window.toolboxAPI.onToolboxEvent((event) => {
  if (event === "settings:updated") {
    updateThemeBasedOnSettings();
  }
});
```

### EveToolboxAPI\*\*: Provides access to Toolbox API utilities

### Services

- **loggerService**: Singleton service for centralized logging

  - Methods: `info()`, `success()`, `warning()`, `error()`
  - Eliminates prop drilling for logging across components

- **dataverseService**: Handles all Dataverse API queries
  - Queries system users, teams, security roles, and team memberships
  - Implements paging for large data sets
  - Maps raw API responses to typed models

### Components

- **Overview**: Main container with state management for filtering, selection, and export
- **Filter**: Provides all filtering controls (entity type, status, user type, business unit, search)
- **DataGridView**: Sortable, selectable data grid using Fluent UI DataGrid with single-row selection
- **SecurityRolesPanel**: Side panel displaying security roles and team memberships

### Export Features

- **CSV Export**: Creates a matrix format with users as rows and roles/teams as columns
  - Collects all unique roles and teams across filtered users
  - Marks assignments with 'X'
  - Includes user metadata (name, domain, business unit, status)
  - Progress indicator during export
- **Markdown Export**: Generates hierarchical documentation
  - Section per user with full details
  - Nested lists for security roles and team memberships
  - Includes metadata like managed status, team types, default indicators
  - Copies to clipboard with success notification

## Architecture

### Custom Hooks

- **useConnection**: Manages Dataverse connection state and refresh logic
- **useToolboxEvents**: Subscribes to PPTB events and handles callbacks
- \*\*SystemUser

```typescript
{
  systemuserid: string;
  fullname: string;
  domainname: string;
  businessunitid?: {
    businessunitid: string;
    name: string;
  };
  isdisabled: boolean;
  applicationid: string | null; // Populated for application users
}
```

### Team

```typescript
{
  teamid: string;
  name: string;
  teamtype: number; // 0 = Owner, 1 = Access
  businessunitid?: {
    businessunitid: string;
    name: string;
  };
  isdefault: boolean;
}
```

### SecurityRole

````typescript
{
  roleid: string;
  name: string;
  businessunitid?: {
  Verify permissions to read system user, team, and security role data
- Check console logs for API errors
  };
  ismanaged: boolean

Full TypeScript coverage with:

- Interface definitions for all data models
- Type-safe API responses
- Strongly typed component props
- PPTB API types from `@pptb/types` package

## Configuration

### Vite Build Configuration

The tool uses a custom Vite configuration for PPTB compatibility:

- **IIFE format**: Bundles as Immediately Invoked Function Expression for iframe compatibility
- **Single bundle**: Uses `inlineDynamicImports` to avoid module loading issues with file:// URLs
- **HTML transformation**: Custom plugin removes `type="module"` and moves scripts to end of body
- **Chunk size limit**: Set to 1000 kB to accommodate Fluent UI bundle size

## Data Models

### PluginAssembly

```typescript
{
  pluginassemblyid: string;
  name: string;
  version: string;
}
````

### PluginAssemblyStep

```typescript
{
  id: string;
  name: string;
  sdkMessage: string;
  mode: string; // Sync/Async
  stage: string; // PreValidation/PreOperation/PostOperation
  rank: number; // Execution order
  eventHandler: string; // Full type name
  filteringattributes: string;
}
```

## Troubleshooting

### Build Issues

If you encounter chunk size warnings:

- The tool uses IIFE format which requires a single bundle
- Chunk size limit is configured in `vite.config.ts`
- This is expected for Fluent UI components

### Connection Issues

- Ensure you're connected to a Dataverse environment in PPTB
- Check the Event Log for connection-related errors
- Verify permissions to read plugin assembly data

### Theme Not Updating

- The tool automatically syncs with PPTB theme settings
- Check console for theme update events
- Verify PPTB version supports theme API

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes with appropriate TypeScript types
4. Test the build process
5. Submit a pull request

### GitHub Actions

The project includes automated CI/CD workflows:

#### CI Workflow (`.github/workflows/ci.yml`)

Runs on every push and pull request to `main` and `develop` branches:

- **Build and Test**:

  - Tests on Node.js 18.x and 20.x
  - TypeScript type checking
  - Build verification
  - Uploads build artifacts

- **Lint Check**:

  - Runs ESLint if configured
  - Validates code quality

- **Security Audit**:

  - Checks for npm package vulnerabilities
  - Fails on critical vulnerabilities
  - Warns on high-severity issues

- **Package Validation**:
  - Validates package.json structure
  - Creates npm-shrinkwrap.json
  - Verifies all required fields

#### Release Workflow (`.github/workflows/release.yml`)

Triggered when pushing a version tag (e.g., `v1.0.0`):

- Builds the project
- Creates distribution packages (tar.gz and zip)
- Creates GitHub release with auto-generated notes
- Attaches build artifacts to release

**To create a release:**

```bash
# Update version in package.json
npm version patch  # or minor, major

# Push with tags
git push origin main --tags
```

## License

MIT - See LICENSE file for details

## Author

Lars Hildebrandt
