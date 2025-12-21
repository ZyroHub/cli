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
		...(projectData.type === 'app' ? ['@zyrohub/core'] : []),
		...(projectData.createDotEnv && projectData.type === 'app' ? ['@dotenvx/dotenvx'] : [])
	];

	if (projectData.createDotEnv) {
		const sEnv = spinner();

		const envFiles = ['.env', '.env.example', '.env.development'];

		sEnv.start('Creating .env files');

		for (const fileName of envFiles) {
			const envFilePath = path.join(targetPath, fileName);

			let envFileCreated = false;

			await fs.writeFile(envFilePath, '').then(() => {
				envFileCreated = true;
			});

			if (!envFileCreated) {
				sEnv.stop();
				throw new Error(`Failed to create ${fileName} file.`);
			}
		}

		sEnv.stop('✅ .env files created successfully.');
	}

	const sInstall = spinner();
	sInstall.start(`Installing dependencies with ${projectData.packageManager}`);

	if (installPackageList.length > 0) {
		const installCommand = getInstallPackageCommand(projectData.packageManager!, installPackageList);

		sInstall.message(`Installing dependencies: ${installPackageList.join(', ')}`);
		let installSuccess = false;
		await execa(installCommand, {
			cwd: targetPath,
			shell: true
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
		cwd: targetPath,
		shell: true
	}).then(() => {
		devInstallSuccess = true;
	});

	if (!devInstallSuccess) {
		sInstall.stop();
		throw new Error('Failed to install devDependencies.');
	}

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

		sGit.message('Setting Git branch to main');
		let gitBranchSuccess = false;
		await execa('git branch -M main', {
			cwd: targetPath
		}).then(() => {
			gitBranchSuccess = true;
		});

		if (!gitBranchSuccess) {
			sGit.stop();
			throw new Error('Failed to set Git branch to main.');
		}

		if (projectData.repository && projectData.repositoryType === 'git') {
			sGit.message('Adding remote repository');

			let gitRemoteSuccess = false;
			await execa('git', ['remote', 'add', 'origin', `${projectData.repository}.git`], {
				cwd: targetPath
			}).then(() => {
				gitRemoteSuccess = true;
			});

			if (!gitRemoteSuccess) {
				sGit.stop();
				throw new Error('Failed to add remote repository.');
			}
		}

		if (projectData.createInitialCommit) {
			const commitMessage = 'feat: add initial project files';

			sGit.message('Creating initial commit');

			let gitAddSuccess = false;
			await execa('git', ['add', '.'], {
				cwd: targetPath
			}).then(() => {
				gitAddSuccess = true;
			});

			if (!gitAddSuccess) {
				sGit.stop();
				throw new Error('Failed to add files to Git.');
			}

			gitAddSuccess = false;

			let gitCommitSuccess = false;
			await execa('git', ['commit', '-m', commitMessage], {
				cwd: targetPath
			}).then(() => {
				gitCommitSuccess = true;
			});

			if (!gitCommitSuccess) {
				sGit.stop();
				throw new Error('Failed to create initial commit.');
			}
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

		sPrettier.message('Creating .prettierignore file');
		const prettierignorePath = path.join(targetPath, '.prettierignore');
		const prettierignoreContent = getPrettierrcIgnoreContent();

		let prettierignoreCreated = false;
		await fs.writeFile(prettierignorePath, prettierignoreContent).then(() => {
			prettierignoreCreated = true;
		});

		if (!prettierignoreCreated) {
			sPrettier.stop();
			throw new Error('Failed to create .prettierignore file.');
		}

		sPrettier.stop('✅ Prettier configuration files created successfully.');
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
