
import React from 'react';
import { Download, File, FileCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileItemProps {
  name: string;
  size: string;
  type: 'upload' | 'download';
  status?: 'pending' | 'complete' | 'error';
  onDownload?: () => void;
}

export function FileItem({ name, size, type, status = 'complete', onDownload }: FileItemProps) {
  return (
    <div className="flex items-center justify-between p-2 rounded-md bg-secondary/30 hover:bg-secondary/40 transition-colors mb-2">
      <div className="flex items-center space-x-2">
        {status === 'complete' ? (
          <FileCheck size={18} className="text-green-400" />
        ) : (
          <File size={18} className="text-iso-purple" />
        )}
        <div>
          <p className="text-sm font-medium truncate max-w-[200px]">{name}</p>
          <p className="text-xs text-muted-foreground">{size}</p>
        </div>
      </div>
      
      {type === 'download' && (
        <button 
          onClick={onDownload}
          className="p-1 hover:text-iso-blue transition-colors"
        >
          <Download size={16} />
        </button>
      )}
    </div>
  );
}

interface FileTransferProps {
  files: {
    id: string;
    name: string;
    size: string;
    type: 'upload' | 'download';
    status?: 'pending' | 'complete' | 'error';
  }[];
  onDownload: (fileId: string) => void;
}

export function FileTransfer({ files, onDownload }: FileTransferProps) {
  const uploads = files.filter(file => file.type === 'upload');
  const downloads = files.filter(file => file.type === 'download');
  
  if (files.length === 0) return null;
  
  return (
    <div className="mt-4 mb-2">
      {uploads.length > 0 && (
        <div className="mb-3">
          <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">Uploaded Files</h4>
          <div>
            {uploads.map(file => (
              <FileItem 
                key={file.id}
                name={file.name}
                size={file.size}
                type={file.type}
                status={file.status}
              />
            ))}
          </div>
        </div>
      )}
      
      {downloads.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">Files to Download</h4>
          <div>
            {downloads.map(file => (
              <FileItem 
                key={file.id}
                name={file.name}
                size={file.size}
                type={file.type}
                status={file.status}
                onDownload={() => onDownload(file.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
