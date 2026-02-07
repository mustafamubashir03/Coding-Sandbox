import { Request, Response } from 'express';
import { createProjectService, getProjectTreeService } from '../services/projectService.js';

export const createProjectController = async (req: Request, res: Response) => {
  const projectId = await createProjectService();
  return res.status(200).json({ success: true, message: 'Project created', data: projectId });
};

export const getProjectTreeController = async (req: Request, res: Response) => {
  const tree = await getProjectTreeService(String(req.params.projectId));
  return res.status(200).json({ success: true, message: 'Project Tree Fetched', data: tree });
};
