/**
 * Maps file extensions to Monaco Editor / VS Code compatible language IDs
 * Used for editor defaultLanguage & dynamic language switching
 */

const extensionToLanguageMap: Record<string, string> = {

    js: 'javascript',
    mjs: 'javascript',
    cjs: 'javascript',
    jsx: 'javascriptreact',
    ts: 'typescript',
    tsx: 'typescriptreact',
    json: 'json',
    jsonc: 'json',
    lock: 'json',
    html: 'html',
    htm: 'html',
    xml: 'xml',
    css: 'css',
    scss: 'scss',
    sass: 'sass',
    less: 'less',
    env: 'dotenv',
    sh: 'shell',
    bash: 'shell',
    md: 'markdown',
    markdown: 'markdown',
    yml: 'yaml',
    yaml: 'yaml',
    toml: 'toml',
    py: 'python',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    cs: 'csharp',
    go: 'go',
    rs: 'rust',
    php: 'php',
    rb: 'ruby',
    swift: 'swift',
    kt: 'kotlin',
    vue: 'vue',
    svelte: 'svelte',
    sql: 'sql',
    graphql: 'graphql',
    gql: 'graphql'
  }

  export const extensionToFiletype = (extension?: string): string | undefined => {
    if (!extension) return undefined
  
    const cleanExt = extension.replace('.', '').toLowerCase()
  
    return extensionToLanguageMap[cleanExt] ?? undefined
  }
  