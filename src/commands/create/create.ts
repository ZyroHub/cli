import { confirm, intro, log, select, spinner, text } from '@clack/prompts';
import { Ansi } from '@zyrohub/utilities';
import { Command } from 'commander';
import fs from 'node:fs';
import path from 'node:path';

import { handlePrompt, promptParts } from '@/utils/commands.js';

import { ProjectType } from '@/types/types.js';

import { setupProject } from './setup.js';
import { CreateProjectData } from './types.js';

const formatName = (rawName?: string) => {
	let formatted = (rawName || '').trim().replace(/\s+/g, '-').toLowerCase();

	return formatted;
};

export const commandCreate = (program: Command) => {
	program
		.command('create [projectName]')
		.description('Create a new project')
		.action(async projectName => {
			intro(Ansi.cyan('☕ ZyroHub - Create a new project'));

			const projectData: CreateProjectData = {};

			projectData.type = await handlePrompt(
				select({
					message: '📙 Project type:',
					options: [
						{
							value: 'app',
							label: 'Application',
							hint: 'Generate an application using ZyroHub infrastructure'
						},
						{ value: 'module', label: 'Module', hint: 'Generate a ZyroHub Core module' },
						{
							value: 'other',
							label: 'Other',
							hint: 'Generate a custom project (e.g. projects without a specific structure)'
						}
					]
				})
			);

			if (projectData.type === 'app') {
				projectData.useCluster = await handlePrompt(
					confirm({
						message: '🗄️ Use ZyroHub Core Cluster?'
					})
				);

				projectData.createDotEnv = await handlePrompt(
					confirm({
						message: '📄 Create .env file for environment variables? (also add dotenv in scripts)'
					})
				);
			}

			if ((['module', 'other'] as ProjectType[]).includes(projectData.type)) {
				projectData.addLibraryFields = await handlePrompt(
					confirm({
						message:
							'📦 Add "exports", "publishConfig", and others library fields to package.json? (recommended for modules or libraries)'
					})
				);
			}

			const defaultProjectName = `my-project`;
			const name = await handlePrompt(
				text({
					message: '📁 Project name:',
					placeholder: defaultProjectName,
					initialValue: projectName,
					defaultValue: defaultProjectName,
					validate: value => {
						const checkName = formatName(value);

						if (fs.existsSync(path.join(process.cwd(), checkName))) {
							return 'Directory with this name already exists.';
						}
					}
				}),
				defaultProjectName
			);

			projectData.name = name;

			projectData.name = formatName(projectData.name);

			log.message(`📁 Project name: ${Ansi.cyan(projectData.name)}`, { symbol: Ansi.green('✔') });

			projectData.description = await handlePrompt(
				text({
					message: `📝 Project description ${promptParts.optional}:`,
					defaultValue: ' '
				})
			);

			projectData.author = await handlePrompt(
				text({
					message: `👤 Author ${promptParts.optional}:`,
					defaultValue: ' '
				})
			);

			projectData.repository = await handlePrompt(
				text({
					message: `🔗 Repository URL ${promptParts.optional}:`,
					defaultValue: ' ',
					validate: value => {
						if (value) {
							try {
								new URL(value);
							} catch {
								return 'Please enter a valid URL.';
							}
						}
					}
				})
			);

			if (projectData.repository) {
				projectData.repositoryType = 'git';

				if (projectData.repository.endsWith('.git')) {
					projectData.repository = projectData.repository.slice(0, -4);
				}
			}

			projectData.initGit = await handlePrompt(
				confirm({
					message: '🔧 Initialize a Git repository? (git init)'
				})
			);

			if (projectData.initGit) {
				projectData.createInitialCommit = await handlePrompt(
					confirm({
						message: '🔖 Commit initial project files after creation?'
					})
				);
			}

			projectData.packageManager = await handlePrompt(
				select({
					message: '📦 Package manager:',
					options: [
						{ value: 'npm', label: 'NPM' },
						{ value: 'yarn', label: 'Yarn' },
						{ value: 'pnpm', label: 'PNPM' },
						{ value: 'bun', label: 'Bun' }
					]
				})
			);

			projectData.usePrettier = await handlePrompt(
				confirm({
					message: '🎨 Use ZyroHub Prettier default configuration for code formatting?'
				})
			);

			try {
				await setupProject(projectData);

				console.log('');
				console.log(Ansi.green('✔  Project created successfully!'));
				console.log('');
				console.log(Ansi.magenta('➡  Next steps:'));
				console.log('');
				console.log(`\t- ${Ansi.cyan('cd')} ${projectData.name}`);
				console.log(`\t- ${Ansi.cyan('Start coding your project! ☕')}`);
			} catch (error) {
				console.error(Ansi.red('✖  Failed to create the project:'), error);

				const folderCreated = fs.existsSync(path.join(process.cwd(), projectData.name!));
				if (folderCreated) {
					const sCleanup = spinner();
					sCleanup.start('Cleaning up created files');

					await fs.promises
						.rm(path.join(process.cwd(), projectData.name!), { recursive: true, force: true })
						.then(() => {
							sCleanup.stop(' Created files cleaned up successfully.');
						});
				}
			}
		});
};
