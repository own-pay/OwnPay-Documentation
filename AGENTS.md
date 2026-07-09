# Documentation project instructions

## About this project

- This is a documentation site built on [Mintlify](https://mintlify.com)
- Pages are MDX files with YAML frontmatter
- Configuration lives in `docs.json`
- Use the Mintlify MCP server, `https://mcp.mintlify.com`, to edit content and settings via MCP
- Use the Mintlify docs MCP server, `https://www.mintlify.com/docs/mcp`, to query information about using Mintlify via MCP

## Terminology

- Use "brand" not "merchant" or "store" when referring to OwnPay's multi-tenant concept
- Use "gateway" not "payment provider" or "processor"
- Use "super admin" or "administrator" for the platform owner
- Use "staff" for brand-level users
- Use "checkout" for the customer payment page
- Use "companion app" for the Android mobile application

## Style preferences

- Use active voice and second person ("you")
- Keep sentences concise - one idea per sentence
- Use sentence case for headings
- Bold for UI elements: Click **Settings**
- Code formatting for file names, commands, paths, and code references
- Use callouts (Tip, Warning, Note, Info) for important information
- Use Steps component for multi-step procedures
- Use Tabs component for alternative approaches (e.g., Shared Hosting vs VPS)
- Use CodeGroup for showing code in multiple languages

## Content boundaries

- Document user-facing features, not internal implementation details
- Include code examples for developer-focused content
- Provide troubleshooting sections for complex features
- Keep API reference concise with request/response examples
- Include security warnings for sensitive operations

## Writing guidelines

- Start pages with a clear description of what the page covers
- Use hierarchical headings (H2 > H3 > H4)
- Include prerequisites sections where relevant
- Link to related pages using relative paths
- Keep paragraphs short (3-5 sentences max)
- Use tables for structured data (settings, comparisons, etc.)
- Use mermaid diagrams for architecture and flow visualization
