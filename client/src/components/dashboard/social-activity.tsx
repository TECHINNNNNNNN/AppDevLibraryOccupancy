import React from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface SocialUpdate {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  time: string;
  message: string;
  type: string;
  verifications?: number;
  tags?: string[];
}

interface SocialActivityProps {
  updates: SocialUpdate[];
  newUpdatesCount: number;
  onViewAll: () => void;
  onCreatePost: () => void;
}

const SocialActivity: React.FC<SocialActivityProps> = ({ 
  updates, 
  newUpdatesCount, 
  onViewAll, 
  onCreatePost 
}) => {
  return (
    <Card>
      <CardHeader className="px-4 py-5 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium text-gray-900">Recent Updates</CardTitle>
        <Button 
          size="icon" 
          variant="default" 
          className="rounded-full" 
          onClick={onCreatePost}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent className="px-4 py-3">
        <ScrollArea className="h-80">
          <ul role="list" className="-mb-8">
            {updates.map((update, idx) => (
              <li key={update.id}>
                <div className="relative pb-8">
                  {idx < updates.length - 1 && (
                    <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                  )}
                  <div className="relative flex items-start space-x-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10 ring-8 ring-white">
                        {update.user.avatar ? (
                          <AvatarImage src={update.user.avatar} alt={update.user.name} />
                        ) : (
                          <AvatarFallback>{update.user.name.charAt(0)}</AvatarFallback>
                        )}
                      </Avatar>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div>
                        <div className="text-sm">
                          <a href="#" className="font-medium text-gray-900">{update.user.name}</a>
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500">{update.time}</p>
                      </div>
                      <div className="mt-2 text-sm text-gray-700">
                        <p>{update.message}</p>
                      </div>
                      <div className="mt-2">
                        {update.verifications !== undefined && (
                          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
                            <span className="h-2 w-2 rounded-full bg-green-400 mr-1.5"></span>
                            Verified by {update.verifications} students
                          </Badge>
                        )}
                        {update.tags && update.tags.map(tag => (
                          <Badge 
                            key={tag} 
                            variant="outline" 
                            className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-200"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
      <CardFooter className="bg-gray-50 px-4 py-4">
        <div className="flex items-center w-full">
          <div className="w-0 flex-1 flex items-center text-sm text-gray-500">
            <span className="truncate">{newUpdatesCount} new updates in the last hour</span>
          </div>
          <div className="ml-4 flex-shrink-0">
            <Button 
              variant="link" 
              className="font-medium text-primary hover:text-primary-500"
              onClick={onViewAll}
            >
              View all updates
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SocialActivity;
