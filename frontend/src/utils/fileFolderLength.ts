import type { fileFolderDataType } from "../components/molecules/EditorComponent/Tree/TreeNode";

export const fileFolderLengthCompute = (file: fileFolderDataType | null) => {
    if (!file) return '';

    const name = file.name || '';

    // Special files first — keys must match iconMap
    if (name === '.gitignore') return 'gitignore';
    if (name === 'package.json') return 'package.json';
    if (name === 'vite.config.js') return 'vite.config.js';
    if (name === 'eslint.config.js') return 'eslint';

    if (name.startsWith('.') && !name.includes('.', 1)) return name;

    if (file.children && file.children.length >= 0) return 'folder';

    const parts = name.split('.');
    if (parts.length > 1) return parts[parts.length - 1];

    return '';
  };