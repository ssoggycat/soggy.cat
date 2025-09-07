import babelParser from '@babel/eslint-parser';
import html from '@html-eslint/eslint-plugin';
import htmlParser from '@html-eslint/parser';
import htmlInline from 'eslint-plugin-html';
import css from '@eslint/css';

import js from '@eslint/js';
import globals from 'globals';

import stylistic from '@stylistic/eslint-plugin';

const common = {
	ignores: ['**/threejs/**/*', '**/node_modules/**/*', '**/.pages_cache/**/*'],
	languageOptions: {
		parser: babelParser,
		parserOptions: {
			requireConfigFile: false,
			babelOptions: {
				babelrc: false,
				configFile: false,
				presets: ['@babel/preset-env'],
			},
		},
		ecmaVersion: 2022,
		sourceType: 'module',
		globals: {
			...globals.browser,
			...globals.es2022,
		},
	},
	linterOptions: {
		reportUnusedDisableDirectives: true,
	},
};

export default [
	{
		files: ['**/*.js', '**/*.mjs', '**/*.html'],
		...common,
		plugins: {
			js,
			htmlInline,
		},
		rules: {
			...js.configs.recommended.rules,
			'prefer-const': 'error',
			'for-direction': 'error',
			'no-const-assign': 'error',
			'no-constant-binary-expression': 'error',
			'no-dupe-args': 'error',
			'no-dupe-class-members': 'error',
			'no-dupe-keys': 'error',
			'no-duplicate-imports': 'error',
			'no-empty-character-class': 'error',
			'no-empty-pattern': 'error',
			'no-ex-assign': 'error',
			'no-fallthrough': 'error',
			'no-func-assign': 'error',
			'no-import-assign': 'error',
			'no-inner-declarations': 'error',
			'no-invalid-regexp': 'error',
			'no-irregular-whitespace': 'error',
			'no-loss-of-precision': 'error',
			'no-misleading-character-class': 'error',
			'no-new-native-nonconstructor': 'error',
			'no-obj-calls': 'error',
			'no-promise-executor-return': 'error',
			'no-prototype-builtins': 'error',
		},
	},
	{
		files: ['**/*.js', '**/*.mjs'],
		...common,
		plugins: {
			'@stylistic': stylistic,
		},
		rules: {
			...stylistic.configs['disable-legacy'].rules,
			...stylistic.configs.recommended.rules,
			'@stylistic/indent': ['error', 'tab', { SwitchCase: 1 }],
			'@stylistic/indent-binary-ops': ['error', 'tab'],
			'@stylistic/no-tabs': 'off',
			'@stylistic/semi': 'error',
			'@stylistic/semi-style': 'error',
			'@stylistic/no-extra-semi': 'error',
			'@stylistic/switch-colon-spacing': 'error',
			'@stylistic/implicit-arrow-linebreak': 'error',
			'@stylistic/function-call-argument-newline': ['error', 'consistent'],
			'@stylistic/comma-dangle': ['error', {
				arrays: 'always-multiline',
				objects: 'always-multiline',
				imports: 'always-multiline',
				exports: 'always-multiline',
				functions: 'never',
				importAttributes: 'always-multiline',
				dynamicImports: 'never',
			}],
			'@stylistic/function-call-spacing': 'error',
			'@stylistic/wrap-regex': 'off',
			'@stylistic/linebreak-style': ['error', 'unix'], // ENABLE THIS AFTER FINISHING SOGGY.CAT COMMIT
		},
	},
	{ //
		files: ['**/*.html'],

		...html.configs['flat/recommended'],
		ignores: ['**/threejs/**/*', '**/node_modules/**/*', '**/static/other/**/*', '**/.pages_cache/**/*'],
		plugins: {
			'@html-eslint': html,
		},
		languageOptions: {
			parser: htmlParser,
			parserOptions: {},
			ecmaVersion: 2022,
			sourceType: 'module',
			globals: {
				...globals.browser,
				...globals.es2022,
			},
		},
		linterOptions: {
			reportUnusedDisableDirectives: true,
		},
		rules: {
			...html.configs['flat/recommended'].rules,
			'@html-eslint/indent': ['error', 'tab', {
				tagChildrenIndent: {
					html: 0,
				},
			}],
			'@html-eslint/prefer-https': 'error',
			'@html-eslint/use-baseline': ['warn', { available: 'newly' }],
			'@html-eslint/require-meta-description': 'warn',
			'@html-eslint/require-open-graph-protocol': 'off',
			'@html-eslint/require-closing-tags': ['error', { selfClosing: 'never' }],
			'@html-eslint/require-explicit-size': 'error',
			'@html-eslint/require-li-container': 'error',
			'@html-eslint/require-meta-charset': 'error',
			'@html-eslint/attrs-newline': 'off',
			'@html-eslint/no-nested-interactive': 'error',
			'@html-eslint/require-button-type': 'error',
			'@html-eslint/no-target-blank': 'error',
			'@html-eslint/no-obsolete-tags': 'error',
			'@html-eslint/no-duplicate-attrs': 'error',
			'@html-eslint/no-script-style-type': 'error',
			'@html-eslint/require-doctype': 'error',
			'@html-eslint/require-img-alt': 'off',
			'@html-eslint/no-duplicate-id': 'error',
		},
	},
	{
		files: ['**/*.css'],
		ignores: ['**/threejs/**/*', '**/node_modules/**/*', '**/static/other/**/*', '**/.pages_cache/**/*'],
		language: 'css/css',
		linterOptions: {
			reportUnusedDisableDirectives: true,
		},
		...css.configs.recommended,
		rules: {
			...css.configs.recommended.rules,
			'css/no-invalid-at-rules': 'off',
			'css/no-empty-blocks': 'error',
			'css/use-baseline': 'off',
		},
	},
];
