import { spinner } from '@clack/prompts';
import { Ansi } from '@zyrohub/utilities';
import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'node:path';

import { getGitignoreContent } from './components/gitignore.js';
import { getMainContent } from './components/main.js';
import { getModuleContent } from './components/module.js';
import { getInstallPackageCommand, getPackageJson } from './components/package.js';
import { getPrettierrcContent } from './components/prettier.js';
import { getTSConfigJson } from './components/tsconfig.js';
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

	const sTSConfig = spinner();
	sTSConfig.start('Creating tsconfig.json');

	const tsconfigPath = path.join(targetPath, 'tsconfig.json');
	const tsconfigData = getTSConfigJson(projectData);

	let tsconfigCreated = false;
	await fs.writeFile(tsconfigPath, tsconfigData).then(() => {
		tsconfigCreated = true;
	});

	if (!tsconfigCreated) {
		sTSConfig.stop();
		throw new Error('Failed to create tsconfig.json file.');
	}

	sTSConfig.stop('✅ tsconfig.json created successfully.');

	const installPackageList = [
		...(projectData.createDotEnv && projectData.type === 'app' ? ['@dotenvx/dotenvx'] : [])
	];

	const sInstall = spinner();
	sInstall.start(`Installing dependencies with ${projectData.packageManager}`);

	if (installPackageList.length > 0) {
		const installCommand = getInstallPackageCommand(projectData.packageManager!, installPackageList);

		sInstall.message(`Installing dependencies: ${installPackageList.join(', ')}`);
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
	}

	const devInstallPackageList = [
		'typescript',
		'tsc-alias',
		...(projectData.type === 'app' ? ['tsx'] : []),
		...(projectData.usePrettier ? ['@zyrohub/config-prettier'] : [])
	];

	const devInstallCommand = getInstallPackageCommand(projectData.packageManager!, devInstallPackageList, true);

	let devInstallSuccess = false;

	sInstall.message(`Installing devDependencies: ${devInstallPackageList.join(', ')}`);
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

		const prettierrcPath = path.join(targetPath, '.prettierrc.js');
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

	const sSrc = spinner();
	sSrc.start('Creating files structure');

	sSrc.message('Creating src directory');
	await fs.mkdir(path.join(targetPath, 'src'));

	sSrc.message('Creating src/index.ts file');
	const indexPath = path.join(targetPath, 'src', 'index.ts');
	const mainContent = getMainContent(projectData);

	let indexCreated = false;
	await fs.writeFile(indexPath, mainContent).then(() => {
		indexCreated = true;
	});

	if (!indexCreated) {
		sSrc.stop();
		throw new Error('Failed to create src/index.ts file.');
	}

	if (projectData.type === 'module') {
		sSrc.message('Creating src/Module.ts file');

		const modulePath = path.join(targetPath, 'src', 'Module.ts');
		const moduleContent = getModuleContent(projectData);

		let moduleCreated = false;
		await fs.writeFile(modulePath, moduleContent).then(() => {
			moduleCreated = true;
		});

		if (!moduleCreated) {
			sSrc.stop();
			throw new Error('Failed to create src/Module.ts file.');
		}
	}

	sSrc.stop('✅ Files structure created successfully.');

	return;
};
