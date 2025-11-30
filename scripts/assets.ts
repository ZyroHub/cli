import fs from 'fs-extra';
import path from 'path';

const copyAssets = async () => {
	try {
		await fs.copy(path.join(process.cwd(), 'package.json'), path.join(process.cwd(), 'dist/package.json'));
		console.log('✅ package.json copied to /dist');
	} catch (err) {
		console.error('Error copying assets:', err);
		process.exit(1);
	}
};

copyAssets();
