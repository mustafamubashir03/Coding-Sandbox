import { Socket } from 'socket.io';
import fs from 'fs/promises';
import path from 'path';
const BASE_PROJECTS_PATH = path.join(process.cwd(), 'projects');
export const handleEditorSocketEvents = (socket: Socket) => {
    const resolveSafePath = ({projectId, relativePath}:{projectId:string,relativePath:string}) => {
        // Absolute path to the project folder
        const projectRoot = path.join(BASE_PROJECTS_PATH, projectId);
      
        // Absolute path to the requested file/folder
        const safePath = path.join(projectRoot, relativePath);
      
        // Security check: prevent path traversal outside the project folder
        if (!safePath.startsWith(projectRoot)) {
          throw new Error('Invalid path');
        }
      
        return safePath;
      };
      
  socket.on(
    'writeFile',
    async ({ data, pathToFileFolder }: { data: string; pathToFileFolder: string }) => {
      try {
        const response = await fs.writeFile(pathToFileFolder, data);
        socket.emit('writeFileSuccess', {
          data: 'File written successfully',
        });
      } catch (error) {
        console.log('Error occured while writing file', error);
        socket.emit('writeFileError', {
          data: 'Error occured while writing file',
        });
      }
    },
  );
  socket.on('createFile', async ({ pathToFileFolder }: { pathToFileFolder: string }) => {
    const isFileAlreadyPresent = await fs.stat(pathToFileFolder);
    if (isFileAlreadyPresent!) {
      socket.emit('error', {
        data: 'File already exists',
      });
    }
    try {
      const response = await fs.writeFile(pathToFileFolder , '');
      socket.emit('createFileSuccess', {
        data: 'File has been created successfully',
      });
    } catch (error) {
      console.log('Error occured while creating file', error);
      socket.emit('createFileError', {
        data: 'Error occured while creating file',
      });
    }
  });
  socket.on('readFile', async ({ pathToFileFolder, projectId }) => {
    try {
      const safePath = resolveSafePath({projectId,relativePath:pathToFileFolder});
      const response = await fs.readFile(safePath,'utf-8');
      console.log(response)
      socket.emit('readFileSuccess', { 
        value: response,
        path:pathToFileFolder
      });
    } catch (error) {
      console.log('Error occured reading file', error);
      socket.emit('readFileError', {
        data: 'Error occured while reading file',
      });
    }
  });
  socket.on('deleteFile', async ({ pathToFileFolder }) => {
    try {
      const response = await fs.unlink(pathToFileFolder);
      socket.emit('deleteFileSuccess', {
        data: 'File deleted successfully',
      });
    } catch (error) {
      console.log('Error occured deleting file', error);
      socket.emit('deleteFileError', {
        data: 'Error occured while deleting file',
      });
    }
  });
  socket.on('createFolder', async ({ pathToFileFolder }: { pathToFileFolder: string }) => {
    const isFileAlreadyPresent = await fs.access(pathToFileFolder);
    if (isFileAlreadyPresent!) {
      socket.emit('error', {
        data: 'File already exists',
      });
    }
    try {
      const response = await fs.mkdir(pathToFileFolder);
      socket.emit('createFolderSuccess', {
        data: 'Folder has been created successfully',
      });
    } catch (error) {
      console.log('Error occured while creating folder', error);
      socket.emit('createFolderError', {
        data: 'Error occured while creating folder',
      });
    }
  });
  socket.on('deleteFolder', async ({ pathToFileFolder }: { pathToFileFolder: string }) => {
    try {
      const response = await fs.rmdir(pathToFileFolder);
      socket.emit('deleteFolderSuccess', {
        data: 'Folder has been deleted successfully',
      });
    } catch (error) {
      console.log('Error occured while deleting folder', error);
      socket.emit('deleteFolderError', {
        data: 'Error occured while deleting folder',
      });
    }
  });
};
