import { isCancel, cancel } from '@clack/prompts';
import { Ansi } from '@zyrohub/utilities';

export const promptParts = {
	optional: Ansi.yellow('(optional)')
};

export const handlePrompt = async <T>(prompt: Promise<T | symbol>, defaultValue?: T): Promise<T> => {
	const result = await prompt;

	if (isCancel(result)) {
		cancel('Operation canceled.');
		process.exit(0);
	}

	if (typeof result === 'string') {
		const trimmed = result.trim();
		if (trimmed === '') return (defaultValue || '') as T;

		return trimmed as T;
	}

	return result as T;
};
