import { spinner } from '@clack/prompts';
import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'node:path';

import { getGitignoreContent } from './components/gitignore.js';
import { getMainContent } from './components/main.js';
import { getModuleContent } from './components/module.js';
import { getInstallPackageCommand, getPackageJson } from './components/package.js';
import { getPrettierrcContent } from './components/prettier.js';
import { getPrettierrcIgnoreContent } from './components/prettierignore.js';
import { getTSConfigJson } from './components/tsconfig.js';
import { CreateProjectData } from './types.js';

const runStep = async (
	startMessage: string,
	task: (s: ReturnType<typeof spinner>) => Promise<void>,
	successMessage: string,
	errorMessage: string
) => {
	const s = spinner();
	s.start(startMessage);

	try {
		await task(s);
		s.stop(successMessage);
	} catch (error) {
		s.stop();
		throw new Error(errorMessage, { cause: error });
	}
};

export const setupProject = async (projectData: CreateProjectData) => {
	const targetPath = path.join(process.cwd(), projectData.name!);

	await runStep(
		'Setting up your project',
		async () => {
			await fs.ensureDir(targetPath);
		},
		'✅ Project directory created successfully.',
		'Failed to create project directory.'
	);

	await runStep(
		'Creating package.json',
		async () => {
			const packageJsonData = getPackageJson(projectData);
			await fs.writeFile(path.join(targetPath, 'package.json'), packageJsonData);
		},
		'✅ package.json created successfully.',
		'Failed to create package.json file.'
	);

	await runStep(
		'Creating tsconfig.json',
		async () => {
			const tsconfigData = getTSConfigJson(projectData);
			await fs.writeFile(path.join(targetPath, 'tsconfig.json'), tsconfigData);
		},
		'✅ tsconfig.json created successfully.',
		'Failed to create tsconfig.json file.'
	);

	if (projectData.createDotEnv) {
		await runStep(
			'Creating .env files',
			async () => {
				const envFiles = ['.env', '.env.example', '.env.development'];
				for (const fileName of envFiles) {
					await fs.writeFile(path.join(targetPath, fileName), '');
				}
			},
			'✅ .env files created successfully.',
			'Failed to create .env files.'
		);
	}

	const installPackageList = [
		...(['app', 'module'].includes(projectData.type!) ? ['@zyrohub/core'] : []),
		...(projectData.createDotEnv && projectData.type === 'app' ? ['@dotenvx/dotenvx'] : [])
	];

	if (installPackageList.length > 0) {
		await runStep(
			`Installing dependencies with ${projectData.packageManager}`,
			async s => {
				const installCommand = getInstallPackageCommand(projectData.packageManager!, installPackageList);
				s.message(`Installing dependencies: ${installPackageList.join(', ')}`);

				await execa(installCommand, {
					cwd: targetPath,
					shell: true
				});
			},
			'✅ Dependencies installed successfully.',
			'Failed to install dependencies.'
		);
	}

	const devInstallPackageList = [
		'typescript',
		'tsc-alias',
		'ts-node',
		'@swc/core',
		'@swc/helpers',
		...(projectData.usePrettier ? ['@zyrohub/config-prettier'] : [])
	];

	await runStep(
		`Installing devDependencies with ${projectData.packageManager}`,
		async s => {
			const devInstallCommand = getInstallPackageCommand(
				projectData.packageManager!,
				devInstallPackageList,
				true
			);
			s.message(`Installing devDependencies: ${devInstallPackageList.join(', ')}`);

			await execa(devInstallCommand, {
				cwd: targetPath,
				shell: true
			});
		},
		'✅ devDependencies installed successfully.',
		'Failed to install devDependencies.'
	);

	await runStep(
		'Creating .gitignore file',
		async () => {
			const gitignoreContent = getGitignoreContent(projectData);
			await fs.writeFile(path.join(targetPath, '.gitignore'), gitignoreContent);
		},
		'✅ .gitignore file created successfully.',
		'Failed to create .gitignore file.'
	);

	if (projectData.usePrettier) {
		await runStep(
			'Creating Prettier configuration',
			async s => {
				const prettierrcContent = getPrettierrcContent();
				await fs.writeFile(path.join(targetPath, '.prettierrc.js'), prettierrcContent);

				s.message('Creating .prettierignore file');
				const prettierignoreContent = getPrettierrcIgnoreContent();
				await fs.writeFile(path.join(targetPath, '.prettierignore'), prettierignoreContent);
			},
			'✅ Prettier configuration files created successfully.',
			'Failed to create Prettier configuration files.'
		);
	}

	await runStep(
		'Creating files structure',
		async s => {
			s.message('Creating src directory');
			await fs.mkdir(path.join(targetPath, 'src'));

			s.message('Creating src/index.ts file');
			const mainContent = getMainContent(projectData);
			await fs.writeFile(path.join(targetPath, 'src', 'index.ts'), mainContent);

			if (projectData.type === 'module') {
				s.message('Creating src/Module.ts file');
				const moduleContent = getModuleContent(projectData);
				await fs.writeFile(path.join(targetPath, 'src', 'Module.ts'), moduleContent);
			}
		},
		'✅ Files structure created successfully.',
		'Failed to create files structure.'
	);

	if (projectData.initGit) {
		await runStep(
			'Initializing Git repository',
			async s => {
				await execa('git init', { cwd: targetPath });

				s.message('Setting Git branch to main');
				await execa('git branch -M main', { cwd: targetPath });

				if (projectData.repository && projectData.repositoryType === 'git') {
					s.message('Adding remote repository');
					await execa('git', ['remote', 'add', 'origin', `${projectData.repository}.git`], {
						cwd: targetPath
					});
				}

				if (projectData.createInitialCommit) {
					s.message('Creating initial commit');
					await execa('git', ['add', '.'], { cwd: targetPath });
					await execa('git', ['commit', '-m', 'feat: add initial project files'], { cwd: targetPath });
				}
			},
			'✅ Git repository initialized successfully.',
			'Failed to initialize Git repository.'
		);
	}

	return;
};
