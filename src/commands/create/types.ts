import { PackageManager, ProjectType } from '@/types/types.js';

export type RepositoryType = 'git';

export interface CreateProjectData {
	type?: ProjectType;
	useCluster?: boolean;
	addLibraryFields?: boolean;
	createDotEnv?: boolean;

	name?: string;
	description?: string;

	author?: string;

	repository?: string;
	repositoryType?: RepositoryType;

	createInitialCommit?: boolean;

	initGit?: boolean;

	packageManager?: PackageManager;

	usePrettier?: boolean;
}
