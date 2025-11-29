export const projectNameToPascalCase = (moduleName: string) => {
	return moduleName
		.replace(/^app-/, '')
		.replace(/^module-/, '')
		.replace(/(^|-)(\w)/g, (match, _, char) => char.toUpperCase());
};
