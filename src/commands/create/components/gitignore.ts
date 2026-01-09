import { CreateProjectData } from '../types.js';

export const getGitignoreContent = (projectData: CreateProjectData) => {
	return (
		(
			[
				'node_modules',
				'dist',
				...(projectData.createDotEnv ? ['', '# Environment', '.env', '.env.*', '!.env.example'] : []),
				'',
				'# Misc',
				'.npmrc'
			] as string[]
		).join('\n') + '\n'
	);
};
