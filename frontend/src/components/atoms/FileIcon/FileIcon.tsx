import React, { type JSX } from 'react';
import {
  FaJs,
  FaHtml5,
  FaCss3Alt,
  FaPython,
  FaReact,
  FaNodeJs,
  FaFileAlt,
  FaPhp,
  FaJava,
  FaDatabase,
  FaSass,
  FaGitAlt,
  FaDocker,
  FaMarkdown,
  FaFolder, // <-- added folder icon
} from 'react-icons/fa';
import {
  SiTypescript,
  SiMongodb,
  SiSharp,
  SiRubyonrails,
  SiGo,
  SiGraphql,
  SiYarn,
  SiNpm,
  SiRedux,
  SiNextdotjs,
  SiPostcss,
  SiVite,
  SiJson,
  SiDotenv,
  SiGit,
  SiEslint,
  SiSvg,
} from 'react-icons/si';

interface FileIconProps {
  extension: string;
  size?: number;
}

const FileIcon: React.FC<FileIconProps> = ({ extension, size = 20 }) => {
  const ext = extension.toLowerCase();

  const iconMap: Record<string, { icon: JSX.Element; color: string }> = {
    folder: { icon: <FaFolder size={size} />, color: '#5A7DA6' },
    js: { icon: <FaJs size={size} />, color: '#e6c84f' },
    jsx: { icon: <FaReact size={size} />, color: '#7ecfff' },
    ts: { icon: <SiTypescript size={size} />, color: '#5a9fd4' },
    tsx: { icon: <SiTypescript size={size} />, color: '#5a9fd4' },
    html: { icon: <FaHtml5 size={size} />, color: '#e06c50' },
    css: { icon: <FaCss3Alt size={size} />, color: '#4d82e6' },
    scss: { icon: <FaSass size={size} />, color: '#c57ca5' },
    sass: { icon: <FaSass size={size} />, color: '#c57ca5' },
    postcss: { icon: <SiPostcss size={size} />, color: '#d26a3a' },
    react: { icon: <FaReact size={size} />, color: '#7ecfff' },
    redux: { icon: <SiRedux size={size} />, color: '#8865b5' },
    next: { icon: <SiNextdotjs size={size} />, color: '#bbbbbb' },
    node: { icon: <FaNodeJs size={size} />, color: '#4ba03a' },
    graphql: { icon: <SiGraphql size={size} />, color: '#d273a3' },
    mongo: { icon: <SiMongodb size={size} />, color: '#5da86b' },
    db: { icon: <FaDatabase size={size} />, color: '#5b82a1' },
    py: { icon: <FaPython size={size} />, color: '#5d8abf' },
    java: { icon: <FaJava size={size} />, color: '#c08c58' },
    php: { icon: <FaPhp size={size} />, color: '#99a6c8' },
    csharp: { icon: <SiSharp size={size} />, color: '#4b8c61' },
    rb: { icon: <SiRubyonrails size={size} />, color: '#c55650' },
    go: { icon: <SiGo size={size} />, color: '#3db0d9' },
    md: { icon: <FaMarkdown size={size} />, color: '#5b7bbd' },
    docker: { icon: <FaDocker size={size} />, color: '#4aa0e6' },
    git: { icon: <FaGitAlt size={size} />, color: '#e08f76' },
    gitignore: { icon: <SiGit size={size} />, color: '#f07171' },
    eslint: { icon: <SiEslint size={size} />, color: '#4b8bbe' },
    dotenv: { icon: <SiDotenv size={size} />, color: '#6dbf78' },
    json: { icon: <SiJson size={size} />, color: '#f2c94c' },
    'package.json': { icon: <SiNpm size={size} />, color: '#cb3837' },
    'vite.config.js': { icon: <SiVite size={size} />, color: '#7b7cff' },
    svg: { icon: <SiSvg size={size} />, color: '#6cb0e8' },
    yarn: { icon: <SiYarn size={size} />, color: '#4a90c2' },
    npm: { icon: <SiNpm size={size} />, color: '#c75a54' },
    vite: { icon: <SiVite size={size} />, color: '#7b7cff' },
  };

  if (iconMap[ext]) return <span style={{ color: iconMap[ext].color }}>{iconMap[ext].icon}</span>;

  // fallback generic file icon
  return <FaFileAlt size={size} color="#9e9e9e" />;
};

export default FileIcon;
