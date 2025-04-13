import React from "react";

interface CuLogoProps {
  className?: string;
}

const CuLogo = ({ className = "h-8 w-8" }: CuLogoProps): JSX.Element => {
  return (
    <div className={`rounded bg-primary flex items-center justify-center text-white font-bold ${className}`}>
      CU
    </div>
  );
};

export default CuLogo;
