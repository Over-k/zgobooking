import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";

interface ErrorDisplayProps {
  title?: string;
  message: string;
  retryText?: string;
  retryLink?: string;
  className?: string;
}

export default function ErrorDisplay({
  title = "Something went wrong",
  message,
  retryText = "Try again",
  retryLink,
  className = "",
}: ErrorDisplayProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full mb-4">
        <AlertTriangle className="h-8 w-8 text-red-500 dark:text-red-400" />
      </div>
      
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
        {title}
      </h2>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
        {message}
      </p>

      {retryLink ? (
        <Link href={retryLink} passHref>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            {retryText}
          </Button>
        </Link>
      ) : (
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {retryText}
        </Button>
      )}

      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
        <p>If the problem persists, please contact support.</p>
      </div>
    </div>
  );
}