#!/usr/bin/env node
import { Command } from 'commander';

import packageJson from '../package.json' with { type: 'json' };
import { commands } from './commands/commands.js';

const program = new Command();

program.name('zyrohub').description(packageJson.description).version(packageJson.version);

for (const command of commands) {
	command(program);
}

program.parse(process.argv);
