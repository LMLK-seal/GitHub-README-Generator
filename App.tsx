import React, { useState, useCallback } from 'react';
import { ProjectFile, AppState } from './types';
import FileUploader from './components/FileUploader';
import ReadmeDisplay from './components/ReadmeDisplay';
import Loader from './components/Loader';
import { generateReadme } from './services/geminiService';
import { BotIcon, FileIcon, CoffeeIcon } from './components/icons';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [readmeContent, setReadmeContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleFilesLoaded = (loadedFiles: ProjectFile[]) => {
    setFiles(loadedFiles);
    setAppState(AppState.FILES_LOADED);
  };

  const handleGenerate = useCallback(async () => {
    if (files.length === 0) {
      setError("Please select files before generating a README.");
      setAppState(AppState.ERROR);
      return;
    }
    setAppState(AppState.GENERATING);
    setError(null);
    try {
      const content = await generateReadme(files);
      setReadmeContent(content);
      setAppState(AppState.SUCCESS);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
      setAppState(AppState.ERROR);
    }
  }, [files]);

  const handleReset = () => {
    setFiles([]);
    setReadmeContent('');
    setError(null);
    setAppState(AppState.IDLE);
  };

  const renderFileList = () => (
    <div className="w-full max-w-2xl bg-surface p-6 rounded-2xl border border-border-color">
        <h3 className="text-xl font-bold text-text-primary mb-4">Project Files Loaded</h3>
        <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
            {files.map((file, index) => (
                <div key={index} className="flex items-center bg-background/50 p-2 rounded-md">
                    <FileIcon className="h-5 w-5 text-text-secondary mr-3 flex-shrink-0" />
                    <span className="text-sm text-text-secondary truncate">{file.path}</span>
                </div>
            ))}
        </div>
         <button
          onClick={handleGenerate}
          className="w-full mt-6 px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary flex items-center justify-center"
        >
          <BotIcon className="h-5 w-5 mr-2" />
          Generate README
        </button>
         <button
          onClick={handleReset}
          className="w-full mt-3 px-6 py-2 bg-secondary text-text-primary font-medium rounded-lg hover:bg-zinc-600 transition-colors"
        >
          Back
        </button>
    </div>
  );

  const renderContent = () => {
    switch (appState) {
      case AppState.IDLE:
        return <FileUploader onFilesLoaded={handleFilesLoaded} setLoading={(loading) => setAppState(loading ? AppState.LOADING_FILES : AppState.IDLE)} />;
      case AppState.LOADING_FILES:
        return <Loader text="Reading files..." />;
      case AppState.FILES_LOADED:
        return renderFileList();
      case AppState.GENERATING:
        return <Loader text="AI is crafting your README..." />;
      case AppState.SUCCESS:
        return <ReadmeDisplay content={readmeContent} onReset={handleReset} />;
      case AppState.ERROR:
        return (
          <div className="text-center p-8 bg-surface rounded-2xl border border-red-500/50">
            <h2 className="text-2xl font-bold text-red-400">Generation Failed</h2>
            <p className="text-text-secondary mt-2 mb-4">{error}</p>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors"
            >
              Try Again
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
       <header className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
          GitHub README Generator
        </h1>
        <p className="mt-3 text-lg text-text-secondary max-w-2xl mx-auto">
          Let AI create a professional README for your project. Just select your project folder to get started.
        </p>
      </header>
      <main className="w-full flex items-center justify-center">
        {renderContent()}
      </main>
      <footer className="text-center mt-12 space-y-4">
          <a
            href="https://buymeacoffee.com/yaniv1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 bg-bmac-yellow text-black font-bold rounded-lg shadow-md hover:bg-bmac-yellow-hover transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-bmac-yellow"
          >
            <CoffeeIcon className="h-5 w-5 mr-2" />
            <span>Support me on Buy Me a Coffee</span>
          </a>
          <p className="text-sm text-border-color">Powered by Google Gemini & React</p>
      </footer>
    </div>
  );
};

export default App;