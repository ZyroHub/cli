export const getPrettierrcContent = () => {
	return [
		"import { prettierConfig } from '@zyrohub/config-prettier';",
		'',
		'export default {',
		'\t...prettierConfig',
		'};'
	].join('\n');
};
