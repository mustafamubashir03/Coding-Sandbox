import path from 'node:path';
const BASE_PROJECTS_PATH = path.join(process.cwd(), 'projects');
export const resolveSafePath = ({
  projectId,
  relativePath,
}: {
  projectId: string;
  relativePath: string;
}) => {
  // Absolute path to the project folder
  const projectRoot = path.join(BASE_PROJECTS_PATH, projectId);

  // Absolute path to the requested file/folder
  const safePath = path.join(projectRoot, relativePath);

  // prevent path traversal outside the project folder
  if (!safePath.startsWith(projectRoot)) {
    throw new Error('Invalid path');
  }

  return safePath;
};
