"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function UploadArea() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    setUploadedFiles(prev => [...prev, ...files]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...files]);
    }
  };

  const handleProcess = async () => {
    if (uploadedFiles.length === 0) return;

    setIsProcessing(true);

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsProcessing(false);
    alert(`Successfully processed ${uploadedFiles.length} file(s)!`);
  };

  return (
    <div className="flex-1 p-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">Upload Documents</h2>

      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          isDragging
            ? "border-swiftr-brand bg-swiftr-brand-light"
            : "border-slate-300 bg-white"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-slate-900 mb-2">
          Drop your files here or click to browse
        </p>
        <p className="text-sm text-slate-600 mb-4">
          Support for PDF, DOC, DOCX, TXT files
        </p>

        <input
          type="file"
          id="file-upload"
          className="hidden"
          multiple
          onChange={handleFileSelect}
          accept=".pdf,.doc,.docx,.txt"
        />

        <label htmlFor="file-upload" className="btn-secondary cursor-pointer">
          Select Files
        </label>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Uploaded Files</h3>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-swiftr-100"
              >
                <FileText className="h-5 w-5 text-swiftr-brand" />
                <span className="text-sm text-slate-700">{file.name}</span>
                <span className="text-xs text-slate-500">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
                <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
              </div>
            ))}
          </div>

          <Button
            onClick={handleProcess}
            disabled={isProcessing}
            className="btn-primary w-full mt-4"
          >
            {isProcessing ? "Processing..." : "Generate Notes"}
          </Button>
        </div>
      )}

      <div className="mt-8 p-4 bg-swiftr-brand-light rounded-xl">
        <h3 className="font-semibold text-swiftr-brand mb-2">Pro Tip</h3>
        <p className="text-sm text-slate-600">
          Upgrade to Pro to unlock YouTube to notes and podcast transcription features!
        </p>
      </div>
    </div>
  );
}