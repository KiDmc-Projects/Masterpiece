# /git-push Command for Masterpiece Quiz

## Overview

Automated release workflow for the Masterpiece Quiz project. This command handles version bumping, release notes generation, git operations, and Cloudflare Pages deployment.

## Usage

```bash
/git-push [patch|minor|major] [--dry-run]
```

## Workflow Steps

### 1. Pre-flight Checks

- Verify git status (ensure clean working directory or only staged changes)
- Ensure we're on the main branch
- Run quality gates: `npm run lint`, `npm run check`, `npm run build`

### 2. Version Management

- Parse current version from package.json (currently v0.5.1)
- Auto-detect suggested version type based on conventional commits:
  - **patch**: fix:, docs:, style:, refactor:, test:, chore:
  - **minor**: feat:, feat!:
  - **major**: BREAKING CHANGE, feat!: with breaking changes
- Allow override with command parameter
- Confirm version with user: "Current: v0.5.1 → Proposed: v0.5.2"
- Update package.json version field

### 3. Conventional Commit Analysis

Parse commits since last tag for:

- **feat**: New features
- **fix**: Bug fixes
- **docs**: Documentation changes
- **style**: Formatting, CSS changes
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding/updating tests
- **chore**: Maintenance tasks
- **ci**: CI/CD changes
- **build**: Build system changes

### 4. Release Notes Generation

- Add new version section to RELEASE_NOTES.md
- Generate content based on conventional commits
- Use project-specific formatting matching existing style
- Include date stamp and version number
- Categorize changes appropriately

### 5. Git Operations

- Stage all changes (package.json, RELEASE_NOTES.md, any other modified files)
- Create commit: "Release v{version}: {auto-generated summary}"
- Create annotated git tag: v{version}
- Push commits and tags to origin

### 6. Cloudflare Pages Deployment

- Execute: `wrangler pages deploy .svelte-kit/output/static --project-name=masterpiece-quiz-pages`
- Monitor deployment status
- Report deployment URL and status

## Implementation

This is a project-specific command tailored for the Masterpiece Quiz application with:

- SvelteKit 5 build system
- Tailwind CSS styling
- Supabase backend
- Cloudflare Pages deployment
- Semantic versioning (0.x.y format)
- Comprehensive release notes in established format

## Error Handling

- Rollback on any step failure
- Preserve working directory state
- Clear error messages for each failure point
- Option to continue on non-critical errors

## Security

- No sensitive information in commit messages
- Verify deployment target before executing
- Confirm destructive operations with user

---

## Command Implementation

When you receive `/git-push [args]`, execute this complete workflow automatically with user confirmations only for version bumping and final execution.
