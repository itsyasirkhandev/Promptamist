
import React from 'react';
import { Button } from './button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './alert';

interface ServerBusyRetryProps {
  onRetry: () => void;
  message?: string;
  className?: string;
}

export function ServerBusyRetry({ 
  onRetry, 
  message = "server is busy please click on the retry button to retry",
  className
}: ServerBusyRetryProps) {
  return (
    <div className={className}>
      <Alert variant="destructive" className="flex flex-col sm:flex-row items-center gap-4 bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950 dark:border-amber-900 dark:text-amber-200">
        <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="mb-0 text-amber-800 dark:text-amber-300">Timeout reached</AlertTitle>
        </div>
        <AlertDescription className="flex-1 text-center sm:text-left">
          {message}
        </AlertDescription>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry}
          className="bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-900 dark:bg-amber-900 dark:hover:bg-amber-800 dark:border-amber-700 dark:text-amber-100"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </Alert>
    </div>
  );
}
