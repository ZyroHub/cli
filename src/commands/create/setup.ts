import { spinner } from '@clack/prompts';
import { Ansi } from '@zyrohub/utilities';
import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'node:path';

import { getGitignoreContent } from './components/gitignore.js';
import { getInstallPackageCommand, getPackageJson } from './components/package.js';
import { getPrettierrcContent } from './components/prettier.js';
import { CreateProjectData } from './types.js';

export const setupProject = async (projectData: CreateProjectData) => {
	const sFolder = spinner();

	const targetPath = path.join(process.cwd(), projectData.name!);

	sFolder.start('Setting up your project');

	let folderCreated = false;

	await fs.ensureDir(targetPath).then(() => {
		folderCreated = true;
	});

	if (!folderCreated) {
		sFolder.stop();
		throw new Error('Failed to create project directory.');
	}

	sFolder.stop('✅ Project directory created successfully.');

	const sPackageJson = spinner();
	sPackageJson.start('Creating package.json');

	const packageJsonPath = path.join(targetPath, 'package.json');
	const packageJsonData = getPackageJson(projectData);

	let packageJsonCreated = false;

	await fs.writeFile(packageJsonPath, packageJsonData).then(() => {
		packageJsonCreated = true;
	});

	if (!packageJsonCreated) {
		sPackageJson.stop();
		throw new Error('Failed to create package.json file.');
	}

	sPackageJson.stop('✅ package.json created successfully.');

	const sInstall = spinner();
	sInstall.start(`Installing dependencies with ${projectData.packageManager}`);

	const installCommand = getInstallPackageCommand(projectData.packageManager!, [
		...(projectData.createDotEnv ? ['@dotenvx/dotenvx'] : [])
	]);

	let installSuccess = false;

	await execa(installCommand, {
		cwd: targetPath
	}).then(() => {
		installSuccess = true;
	});

	if (!installSuccess) {
		sInstall.stop();
		throw new Error('Failed to install dependencies.');
	}

	const devInstallCommand = getInstallPackageCommand(
		projectData.packageManager!,
		[
			'typescript',
			'tsc-alias',
			...(projectData.type === 'app' ? ['tsx'] : []),
			...(projectData.usePrettier ? ['@zyrohub/config-prettier'] : [])
		],
		true
	);

	let devInstallSuccess = false;

	await execa(devInstallCommand, {
		cwd: targetPath
	}).then(() => {
		devInstallSuccess = true;
	});

	sInstall.stop('✅ Dependencies installed successfully.');

	if (projectData.initGit) {
		const sGit = spinner();
		sGit.start('Initializing Git repository');

		let gitSuccess = false;
		await execa('git init', {
			cwd: targetPath
		}).then(() => {
			gitSuccess = true;
		});

		if (!gitSuccess) {
			sGit.stop();
			throw new Error('Failed to initialize Git repository.');
		}

		sGit.stop('✅ Git repository initialized successfully.');
	}

	const sGitIgnore = spinner();
	sGitIgnore.start('Creating .gitignore file');

	const gitignorePath = path.join(targetPath, '.gitignore');
	const gitignoreContent = getGitignoreContent(projectData);

	let gitignoreCreated = false;

	await fs.writeFile(gitignorePath, gitignoreContent).then(() => {
		gitignoreCreated = true;
	});

	if (!gitignoreCreated) {
		sGitIgnore.stop();
		throw new Error('Failed to create .gitignore file.');
	}

	sGitIgnore.stop('✅ .gitignore file created successfully.');

	if (projectData.usePrettier) {
		const sPrettier = spinner();
		sPrettier.start('Creating Prettier configuration file');

		const prettierrcPath = path.join(targetPath, 'prettierrc.ts');
		const prettierrcContent = getPrettierrcContent();

		let prettierrcCreated = false;
		await fs.writeFile(prettierrcPath, prettierrcContent).then(() => {
			prettierrcCreated = true;
		});

		if (!prettierrcCreated) {
			sPrettier.stop();
			throw new Error('Failed to create Prettier configuration file.');
		}

		sPrettier.stop('✅ Prettier configuration file created successfully.');
	}
};
