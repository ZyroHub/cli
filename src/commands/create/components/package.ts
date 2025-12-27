import { CreateProjectData } from '../types.js';

export const getPackageJson = (projectData: CreateProjectData) => {
	const dotenvxPrefix = (envFile: string = '.env') =>
		projectData.createDotEnv ? `dotenvx run -f ${envFile} -- ` : '';

	const packageJsonData = {
		name: projectData.name,

		version: '1.0.0',
		author: projectData.author || undefined,
		type: 'module',
		description: projectData.description || undefined,

		main: './dist/index.js',
		types: './dist/index.d.ts',

		...(projectData.addLibraryFields && {
			exports: {
				'.': {
					import: './dist/index.js',
					types: './dist/index.d.ts'
				}
			}
		}),

		scripts: {
			start: `${dotenvxPrefix()}node ./dist/index.js`,
			dev: `${dotenvxPrefix('.env.development')}node --watch --no-warnings --loader ts-node/esm src/index.ts`,
			build: 'rimraf dist && tsc && tsc-alias'
		},

		...(projectData.repository && {
			repository: {
				type: 'git',
				url: `${projectData.repository}.git`
			}
		}),

		...(projectData.addLibraryFields && {
			publishConfig: {
				access: 'public'
			},
			files: ['/dist']
		}),

		keywords: [],
		license: 'MIT',

		dependencies: {},
		devDependencies: {}
	};

	return JSON.stringify(packageJsonData, null, 4) + '\n';
};

export const getInstallPackageCommand = (packageManager: string, packages: string[], isDev: boolean = false) => {
	const npmCommand = `npm install${isDev ? ' --save-dev' : ''} ${packages.join(' ')}`;

	switch (packageManager) {
		case 'npm':
			return npmCommand;
		case 'yarn':
			return `yarn add${isDev ? ' --dev' : ''} ${packages.join(' ')}`;
		case 'pnpm':
			return `pnpm add${isDev ? ' -D' : ''} ${packages.join(' ')}`;
		case 'bun':
			return `bun add${isDev ? ' -d' : ''} ${packages.join(' ')}`;
		default:
			return npmCommand;
	}
};
