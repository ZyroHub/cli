import { confirm, intro, select, text } from '@clack/prompts';
import { Ansi } from '@zyrohub/utilities';
import { Command } from 'commander';

import { handlePrompt, promptParts } from '@/utils/commands.js';

import { ProjectType } from '@/types/types.js';

import { CreateProjectData } from './types.js';

const getProjectPrefix = (projectType: ProjectType) => {
	switch (projectType) {
		case 'module':
			return 'module-';
		case 'app':
			return 'app-';
		default:
			return '';
	}
};

const formatName = (projectType: ProjectType, rawName?: string) => {
	let formatted = (rawName || '').trim().replace(/\s+/g, '-').toLowerCase();

	const projectPrefix = getProjectPrefix(projectType);

	if (!formatted.startsWith(projectPrefix)) {
		formatted = `${projectPrefix}${formatted}`;
	}

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
			}

			if (!projectName) {
				const defaultProjectName = `${getProjectPrefix(projectData.type)}my-project`;
				const name = await handlePrompt(
					text({
						message: '📁 Project name:',
						placeholder: defaultProjectName,
						defaultValue: defaultProjectName
					}),
					defaultProjectName
				);

				projectData.name = name;
			}

			projectData.name = formatName(projectData.type, projectData.name);

			console.log(`${Ansi.green('✔')}  📁 Project name: ${Ansi.cyan(projectData.name)}`);

			projectData.description = await handlePrompt(
				text({
					message: `📝 Project description ${promptParts.optional}:`,
					defaultValue: ' '
				})
			);

			projectData.repository = await handlePrompt(
				text({
					message: `🔗 Repository URL ${promptParts.optional}:`,
					defaultValue: ' '
				})
			);

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

			console.log(projectData);
		});
};
