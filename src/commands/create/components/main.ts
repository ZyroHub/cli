import { CreateProjectData } from '../types.js';

export const getMainContent = (projectData: CreateProjectData) => {
	let mountedScript = '';

	if (projectData.type === 'app') {
		const middleContent = (
			!projectData.useCluster
				? ['const core = new Core({', '\tmodules: []', '});']
				: ['const core = new ClusteredCore({', '\tcore: {', '\t\tmodules: []', '\t},', '});']
		).join('\n');

		mountedScript += [
			`import { ${projectData.useCluster ? 'ClusteredCore' : 'Core'} } from '@zyrohub/core';`,
			'',
			middleContent,
			'',
			'await core.init();'
		].join('\n');
	}

	if (projectData.type === 'module') {
		mountedScript += "export * from './Module.js';";
	}

	mountedScript += '\n';

	return mountedScript;
};
