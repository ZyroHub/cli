export const getPrettierrcIgnoreContent = () => {
	return ['dist', 'node_modules', '**/*.min.js'].join('\n') + '\n';
};
