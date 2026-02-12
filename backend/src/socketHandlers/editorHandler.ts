import { Namespace, Socket } from 'socket.io';
import fs from 'fs/promises';
import { resolveSafePath } from '../utils/resolveSafePath.js';
import path from 'path';
export const handleEditorSocketEvents = (socket: Socket, editorNamespace: Namespace) => {
  socket.on(
    'writeFile',
    async ({
      data,
      pathToFileFolder,
      projectId,
    }: {
      data: string;
      pathToFileFolder: string;
      projectId: string;
    }) => {
      try {
        const safePath = resolveSafePath({ projectId, relativePath: pathToFileFolder });
        await fs.writeFile(safePath, data);
        editorNamespace.emit('writeFileSuccess', {
          data: 'File written successfully',
          path: pathToFileFolder,
        });
      } catch (error) {
        console.log('Error occured while writing file', error);
        socket.emit('writeFileError', {
          data: 'Error occured while writing file',
        });
      }
    },
  );
  socket.on('createFile', async ({ pathToFileFolder, projectId, fileName }: { pathToFileFolder: string , projectId:string, fileName:string}) => {

      const safePath = resolveSafePath({ projectId, relativePath: pathToFileFolder });
      const newFilePath = path.join(safePath,fileName)
      await fs.mkdir(safePath, { recursive: true });
      try{
        const isFileAlreadyPresent = await fs.stat(newFilePath);
        if (isFileAlreadyPresent!) {
          socket.emit('error', {
            data: 'File already exists',
          });
          return
        }
      }catch{
      }
      try {
        const response = await fs.writeFile(newFilePath, '');
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
  socket.on('renameFile', async ({ pathToFileFolder, projectId, newFileName }: { pathToFileFolder: string, projectId:string, newFileName:string }) => {
    const oldPath = resolveSafePath({ projectId, relativePath: pathToFileFolder });
    console.log("old path",oldPath)
    const isFileAlreadyPresent = await fs.stat(oldPath);
    console.log("is file already present",isFileAlreadyPresent)
    if (isFileAlreadyPresent!) {
      try {
        const newPath = path.join(path.dirname(oldPath),newFileName)
        console.log("new path",newPath)
        await fs.rename(oldPath, newPath);
        socket.emit('renameFileSuccess', {
          data: 'File has been renamed successfully',
        });
      } catch (error) {
        console.log('Error occured while renaming file', error);
        socket.emit('renameFileError', {
          data: 'Error occured while renaming file',
        });
      }
    }
  });
  socket.on(
    'readFile',
    async ({ pathToFileFolder, projectId }: { pathToFileFolder: string; projectId: string }) => {
      try {
        const safePath = resolveSafePath({ projectId, relativePath: pathToFileFolder });
        const response = await fs.readFile(safePath, 'utf-8');
        socket.emit('readFileSuccess', {
          value: response,
          path: pathToFileFolder,
        });
      } catch (error) {
        console.log('Error occured reading file', error);
        socket.emit('readFileError', {
          data: 'Error occured while reading file',
        });
      }
    },
  );
  socket.on(
    'deleteFile',
    async ({ pathToFileFolder, projectId }: { pathToFileFolder: string; projectId: string }) => {
      try {
        const safePath = resolveSafePath({ projectId, relativePath: pathToFileFolder });
        const response = await fs.unlink(safePath);
        socket.emit('deleteFileSuccess', {
          data: 'File deleted successfully',
        });
      } catch (error) {
        console.log('Error occured deleting file', error);
        socket.emit('deleteFileError', {
          data: 'Error occured while deleting file',
        });
      }
    },
  );
  socket.on('createFolder', async ({ pathToFileFolder, projectId,folderName }: { pathToFileFolder: string, projectId:string, folderName:string }) => {
    const safePath = resolveSafePath({ projectId, relativePath: pathToFileFolder });
    const newFolderPath = path.join(safePath,folderName)
    await fs.mkdir(safePath, { recursive: true });
    try{
      const isFolderAlreadyPresent = await fs.access(newFolderPath);
      if (isFolderAlreadyPresent!) {
        socket.emit('error', {
          data: 'Folder already exists',
        });
        return
      }

    }catch{
    }
    try {
      const response = await fs.mkdir(newFolderPath);
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
 