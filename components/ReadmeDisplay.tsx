import React, { useState, useEffect } from 'react';
import { CopyIcon, DownloadIcon, CheckIcon } from './icons';

interface ReadmeDisplayProps {
  content: string;
  onReset: () => void;
}

// Basic Markdown to HTML converter to show a preview
const MarkdownPreview: React.FC<{ markdown: string }> = ({ markdown }) => {
    const renderMarkdown = (text: string) => {
        let html = text
            // Headers
            .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-6 mb-4">$1</h1>')
            .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-5 mb-3">$1</h2>')
            .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>')
            // Bold and Italic
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Lists
            .replace(/^\* (.*$)/gim, '<li class="ml-6 list-disc">$1</li>')
            .replace(/^\s*\d+\.\s(.*$)/gim, '<li class="ml-6 list-decimal">$1</li>')
            // Links and Images
            .replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="$2" class="my-4 rounded-lg max-w-full h-auto">')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">$1</a>')
            // Code blocks
            .replace(/```(\w+)?\n([\s\S]*?)\n```/g, '<pre class="bg-zinc-900 p-4 rounded-lg my-4 overflow-x-auto"><code class="text-sm font-mono">$2</code></pre>')
            // Inline code
            .replace(/`(.*?)`/g, '<code class="bg-zinc-700 text-orange-300 px-1.5 py-0.5 rounded-md">$1</code>')
             // Paragraphs
            .replace(/\n\n/g, '<br/><br/>')
            .replace(/\n/g, '<br/>');

        // Wrap list items in <ul> or <ol>
        html = html.replace(/(<li class="ml-6 list-disc">[\s\S]*?<\/li>)/g, '<ul>$1</ul>');
        html = html.replace(/(<li class="ml-6 list-decimal">[\s\S]*?<\/li>)/g, '<ol>$1</ol>');
        html = html.replace(/<\/ul>\s*<ul>/g, '');
        html = html.replace(/<\/ol>\s*<ol>/g, '');

        return { __html: html };
    };

    return <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={renderMarkdown(markdown)} />;
};

const ReadmeDisplay: React.FC<ReadmeDisplayProps> = ({ content, onReset }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col">
      <div className="bg-surface rounded-t-xl border border-b-0 border-border-color p-3 flex justify-between items-center">
        <div>
            <span className="text-sm font-medium text-text-primary border-b-2 border-primary px-3 py-2">README.md</span>
        </div>
        <div className="flex items-center space-x-1">
           <button
            onClick={handleCopy}
            title={copied ? "Copied!" : "Copy Markdown"}
            className="p-2 rounded-md hover:bg-white/10 text-text-secondary transition-colors"
            aria-label="Copy Markdown"
          >
            {copied ? <CheckIcon className="h-5 w-5 text-green-400" /> : <CopyIcon className="h-5 w-5" />}
          </button>
          <button
            onClick={handleDownload}
            title="Download .md file"
            className="p-2 rounded-md hover:bg-white/10 text-text-secondary transition-colors"
            aria-label="Download .md file"
          >
            <DownloadIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="bg-background/80 p-6 rounded-b-xl border border-border-color h-[60vh] overflow-y-auto">
        <MarkdownPreview markdown={content} />
      </div>
       <button 
        onClick={onReset}
        className="mt-6 px-6 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover transition-colors self-center"
        >
            Back to Start
        </button>
    </div>
  );
};

export default ReadmeDisplay;