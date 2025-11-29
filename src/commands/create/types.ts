import { PackageManager, ProjectType } from '@/types/types.js';

export interface CreateProjectData {
	type?: ProjectType;
	useCluster?: boolean;
	addLibraryFields?: boolean;
	createDotEnv?: boolean;

	name?: string;
	description?: string;

	author?: string;

	repository?: string;
	repositoryType?: string;

	initGit?: boolean;

	packageManager?: PackageManager;

	usePrettier?: boolean;
}
