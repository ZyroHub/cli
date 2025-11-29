#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { commands } from './commands/commands.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));

const program = new Command();

program.name('zyrohub').description(packageJson.description).version(packageJson.version);

for (const command of commands) {
	command(program);
}

program.parse(process.argv);
