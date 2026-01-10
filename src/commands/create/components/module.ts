import { projectNameToPascalCase } from '@/utils/utils.js';

import { CreateProjectData } from '../types.js';

export const getModuleContent = (projectData: CreateProjectData) => {
	const projectNamePascal = projectNameToPascalCase(projectData.name!);

	return (
		[
			"import { Core, BaseModule, Module } from '@zyrohub/core';",
			'',
			`export interface ${projectNamePascal}ModuleOptions {};`,
			'',
			'@Module()',
			`export class ${projectNamePascal}Module extends BaseModule {`,
			`\tstatic options: ${projectNamePascal}ModuleOptions;`,
			'',
			'\tconstructor() {',
			`\t\tsuper();`,
			'\t}',
			'',
			`\tasync init(data: { core: Core, options: ${projectNamePascal}ModuleOptions }) {`,
			'',
			'\t}',
			'}'
		].join('\n') + '\n'
	);
};
