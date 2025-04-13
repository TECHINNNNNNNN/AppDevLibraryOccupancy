import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';

interface MicrosoftLoginButtonProps {
  onClick: () => void;
  loading?: boolean;
}

const MicrosoftLoginButton: React.FC<MicrosoftLoginButtonProps> = ({ 
  onClick, 
  loading = false 
}) => {
  return (
    <Button
      variant="outline"
      type="button"
      disabled={loading}
      className="w-full bg-white hover:bg-gray-50 text-black border border-gray-300"
      onClick={onClick}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
          <path d="M9.5 9.5V0H0V9.5H9.5Z" fill="#F25022"/>
          <path d="M20 9.5V0H10.5V9.5H20Z" fill="#7FBA00"/>
          <path d="M9.5 20V10.5H0V20H9.5Z" fill="#00A4EF"/>
          <path d="M20 20V10.5H10.5V20H20Z" fill="#FFB900"/>
        </svg>
      )}
      {loading ? "Signing in..." : "Sign in with Microsoft"}
    </Button>
  );
};

export default MicrosoftLoginButton;
