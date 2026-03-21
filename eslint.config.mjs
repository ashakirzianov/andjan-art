import { dirname } from 'path'
import { fileURLToPath } from 'url'
import nextPlugin from '@next/eslint-plugin-next'
import reactPlugin from 'eslint-plugin-react'
import hooksPlugin from 'eslint-plugin-react-hooks'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import stylistic from '@stylistic/eslint-plugin'
import parserTs from '@typescript-eslint/parser'


const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const eslintConfig = [
    {
        ignores: ['.next/**', 'node_modules/**'],
    },
    {
        plugins: {
            '@next/next': nextPlugin,
            'react': reactPlugin,
            'react-hooks': hooksPlugin,
            '@typescript-eslint': tsPlugin,
            '@stylistic/ts': stylistic,
        },
        languageOptions: {
            parser: parserTs,
            parserOptions: {
                project: false,
            },
        },
        rules: {
            ...nextPlugin.configs.recommended.rules,
            ...nextPlugin.configs['core-web-vitals'].rules,
            '@stylistic/ts/semi': ['error', 'never'],
            'prefer-const': ['error', {
                destructuring: 'all'
            }],
            'no-iterator': 'off',
            'react/no-children-prop': 'off',
            'quotes': [
                'error',
                'single',
                {
                    'avoidEscape': true,
                    'allowTemplateLiterals': true
                }
            ],
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    ignoreRestSiblings: true,
                    args: 'after-used'
                }
            ],
        }
    },
]

export default eslintConfig
