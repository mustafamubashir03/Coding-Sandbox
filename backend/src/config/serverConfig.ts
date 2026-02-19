import dotenv from 'dotenv';
dotenv.config();

export const PORT: number = Number(process.env.PORT) || 3000;
export const REACT_PROJECT_COMMAND: string = String(process.env.REACT_PROJECT_COMMAND);
export const TERMINAL_PORT: number = Number(process.env.TERMINAL_PORT) || 4000;
