<div align="center">
    <img src="https://i.imgur.com/KVVR2dM.png">
</div>

## ZyroHub - CLI

<p>A CLI Utility using the ZyroHub Ecosystem, designed to streamline project creation and management.</p>

## Table of Contents

- [ZyroHub - CLI](#zyrohub---cli)
- [Table of Contents](#table-of-contents)
- [Getting Started](#getting-started)
- [Commands](#commands)
    - [Create Project](#create-project)

## Getting Started

To install the CLI globally, use one of the following package managers:

[NPM Repository](https://www.npmjs.com/package/@zyrohub/cli)

```bash
# npm
npm install -g @zyrohub/cli
# yarn
yarn global add @zyrohub/cli
# pnpm
pnpm add -g @zyrohub/cli
# bun
bun add -g @zyrohub/cli
```

## Commands

### Create Project

Scaffolds a new project with the ZyroHub ecosystem structure, handling all necessary configurations automatically.

```bash
zyrohub create [projectName]
```

The CLI will interactively ask for the following configurations:

- **Project Type**: Application, Module, or Other.
- **Features**: Cluster support, DotEnv, Library fields (exports/publishConfig).
- **Metadata**: Name, Description, Author, Repository.
- **Git**: Automatic initialization (\`git init\`).
- **Package Manager**: NPM, Yarn, PNPM, or Bun.
- **Formatting**: Prettier configuration.
