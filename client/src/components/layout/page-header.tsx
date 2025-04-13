import React, { ReactNode } from 'react';
import { format } from 'date-fns';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  info?: {
    date?: boolean;
    time?: boolean;
    customText?: string;
  };
  actions?: ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle, 
  info = { date: true, time: true }, 
  actions 
}) => {
  return (
    <div className="md:flex md:items-center md:justify-between">
      <div className="flex-1 min-w-0">
        <h2 className="text-2xl font-heading font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        )}
        <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
          {info.date && (
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
            </div>
          )}
          {info.time && (
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{format(new Date(), 'HH:mm')}</span>
              {info.customText ? ` - ${info.customText}` : ' - Library open until 22:00'}
            </div>
          )}
        </div>
      </div>
      {actions && (
        <div className="mt-4 flex md:mt-0 md:ml-4">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
