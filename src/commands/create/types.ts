import { PackageManager, ProjectType } from '@/types/types.js';

export interface CreateProjectData {
	type?: ProjectType;
	useCluster?: boolean;
	
	name?: string;
	description?: string;
	
	repository?: string;
	packageManager?: PackageManager;

	usePrettier?: boolean;
}
