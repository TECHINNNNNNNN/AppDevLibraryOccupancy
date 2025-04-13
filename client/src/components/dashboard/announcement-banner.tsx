import React from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface AnnouncementBannerProps {
  message: string;
}

const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ message }) => {
  if (!message) return null;
  
  return (
    <Alert className="rounded-md bg-amber-50 border border-amber-200">
      <AlertCircle className="h-5 w-5 text-amber-400" />
      <AlertTitle className="text-sm font-medium text-amber-800">Attention</AlertTitle>
      <AlertDescription className="mt-2 text-sm text-amber-700">
        {message}
      </AlertDescription>
    </Alert>
  );
};

export default AnnouncementBanner;
