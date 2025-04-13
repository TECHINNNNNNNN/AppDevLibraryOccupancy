import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { MousePointer } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface RecentEntriesProps {
  count: number;
  timeFrame: string;
  percentChange: number;
  compareText: string;
  users: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  additionalUsers: number;
}

const RecentEntriesCard: React.FC<RecentEntriesProps> = ({ 
  count, 
  timeFrame, 
  percentChange, 
  compareText,
  users,
  additionalUsers
}) => {
  return (
    <Card>
      <CardContent className="px-4 py-5">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
            <MousePointer className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Recent Entries
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">{count}</div>
              <div className="ml-2 flex items-baseline text-sm font-semibold text-blue-600">
                <span>{timeFrame}</span>
              </div>
            </dd>
          </div>
        </div>
        <div className="mt-5">
          <div className="flex items-center space-x-2">
            {users.map(user => (
              <Avatar key={user.id} className="h-8 w-8 border border-white">
                {user.avatar ? (
                  <AvatarImage src={user.avatar} alt={user.name} />
                ) : (
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                )}
              </Avatar>
            ))}
            {additionalUsers > 0 && (
              <div className="h-8 w-8 rounded-full bg-gray-100 flex justify-center items-center text-xs font-medium text-gray-500">
                +{additionalUsers}
              </div>
            )}
          </div>
          <div className="mt-3 text-sm text-gray-500">
            <span className="font-medium text-blue-600">+{percentChange}%</span> {compareText}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentEntriesCard;
