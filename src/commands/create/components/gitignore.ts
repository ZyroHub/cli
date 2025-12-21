import { CreateProjectData } from '../types.js';

export const getGitignoreContent = (projectData: CreateProjectData) => {
	return (
		['node_modules', 'dist', '', '# Environment', '.env', '.env.*', '!.env.example', '', '# Misc', '.npmrc'].join(
			'\n'
		) + '\n'
	);
};
