import * as esbuild from 'esbuild'
import { typecheckPlugin } from '@jgoz/esbuild-plugin-typecheck'
import clean from '@akrc/esbuild-plugin-clean'

await esbuild.build({
	entryPoints: ['src/main.ts'],
	bundle: true,
	platform: 'node',
	target: 'node20',
	sourcemap: true,
	logLevel: 'info',
	plugins: [clean(), typecheckPlugin()],
	outfile: 'dist/main.js',
})
