import React, { useState, useCallback, useRef } from 'react';
import { ProjectFile } from '../types';
import { UploadCloudIcon } from './icons';

interface FileUploaderProps {
  onFilesLoaded: (files: ProjectFile[]) => void;
  setLoading: (loading: boolean) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFilesLoaded, setLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (selectedFiles: FileList) => {
    setLoading(true);
    const filePromises = Array.from(selectedFiles).map(file => {
      return new Promise<ProjectFile>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          resolve({
            name: file.name,
            // @ts-ignore - webkitRelativePath is non-standard but widely used
            path: file.webkitRelativePath || file.name,
            content: content,
          });
        };
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
      });
    });

    try {
      const results = await Promise.all(filePromises);
      onFilesLoaded(results);
    } catch (error) {
      console.error("Error reading files:", error);
      // Handle error state in parent component by resetting the loader.
      setLoading(false);
    }
  }, [onFilesLoaded, setLoading]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`w-full max-w-2xl p-8 border-2 ${dragActive ? 'border-primary' : 'border-dashed border-border-color'} rounded-2xl text-center transition-all duration-300 bg-surface/50 flex flex-col items-center justify-center space-y-4`}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        multiple
        // @ts-ignore - webkitdirectory is non-standard but useful
        webkitdirectory="true"
        directory="true"
        onChange={handleChange}
      />
      <div className="p-4 rounded-full bg-primary/10">
        <UploadCloudIcon className="h-12 w-12 text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-text-primary">Select your project folder</h2>
      <p className="text-text-secondary">
        Drag & drop your project folder here, or click to select files.
      </p>
      <p className="text-xs text-border-color max-w-md">
        Your files are processed locally in your browser and are not uploaded to any server until you generate the README.
      </p>
      <button
        onClick={onButtonClick}
        className="mt-4 px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary"
      >
        Select Folder
      </button>
    </div>
  );
};

export default FileUploader;