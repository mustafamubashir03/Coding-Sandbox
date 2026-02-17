import uuid4 from 'uuid4';
import fs from 'fs/promises';
import { REACT_PROJECT_COMMAND } from '../config/serverConfig.js';
import { execPromisified } from '../utils/execPromisifiedUtility.js';
import directoryTree from 'directory-tree';
import path from 'path';

const PROJECTS_ROOT = path.resolve('./projects');

export const createProjectService = async () => {
  const projectId = uuid4();
  console.log('New project id is ', projectId);
  await fs.mkdir(`./projects/${projectId}`, { recursive: true });
  const response = await execPromisified(REACT_PROJECT_COMMAND, {
    cwd: `./projects/${projectId}`,
  });
  return projectId;
};

export const getProjectTreeService = async (projectId: string) => {
  const projectPath = path.join(PROJECTS_ROOT, projectId);
  const tree = directoryTree(projectPath);
  const toPosix = (p: string) => p?.split(path.sep).join('/');
  const normalize = (node: any) => ({
    name: node?.name,
    relativePath: toPosix(path?.relative(projectPath, node?.path)),
    children: node.children?.map(normalize),
  });

  return normalize(tree);
};
