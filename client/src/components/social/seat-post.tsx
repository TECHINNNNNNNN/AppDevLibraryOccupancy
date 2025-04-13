import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThumbsUp, ThumbsDown, Clock, Users } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

export interface SeatPostProps {
  post: {
    id: number;
    userId: number;
    userName: string;
    userAvatar?: string;
    location: {
      zone: string;
      seatId?: string;
    };
    imageUrl?: string;
    duration: number;
    endTime: Date;
    groupSize: number;
    message?: string;
    isAnonymous: boolean;
    verifications: {
      positive: number;
      negative: number;
    };
    createdAt: Date;
  };
  onVerify: (postId: number, isPositive: boolean) => void;
}

const SeatPost: React.FC<SeatPostProps> = ({ post, onVerify }) => {
  const timeRemaining = new Date(post.endTime) > new Date() 
    ? formatDistanceToNow(new Date(post.endTime), { addSuffix: true })
    : 'Expired';
  
  const timeElapsed = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {post.imageUrl && (
          <div className="w-full h-48 bg-gray-100">
            <img 
              src={post.imageUrl} 
              alt="Seat area" 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {!post.isAnonymous ? (
                <>
                  <Avatar className="h-8 w-8">
                    {post.userAvatar ? (
                      <AvatarImage src={post.userAvatar} alt={post.userName} />
                    ) : (
                      <AvatarFallback className="bg-primary-100 text-primary-800">
                        {post.userName.charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="ml-2 text-sm font-medium">{post.userName}</span>
                </>
              ) : (
                <>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gray-100 text-gray-600">A</AvatarFallback>
                  </Avatar>
                  <span className="ml-2 text-sm font-medium">Anonymous</span>
                </>
              )}
            </div>
            <Badge variant="outline" className={timeRemaining === 'Expired' ? 'bg-gray-100' : 'bg-green-100 text-green-800'}>
              <Clock className="mr-1 h-3 w-3" />
              {timeRemaining}
            </Badge>
          </div>
          
          <div className="mt-3">
            {post.message && (
              <p className="text-sm text-gray-700 mb-3">{post.message}</p>
            )}
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                {post.location.zone}
                {post.location.seatId && ` - ${post.location.seatId}`}
              </Badge>
              
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                <Users className="mr-1 h-3 w-3" />
                {post.groupSize} {post.groupSize === 1 ? 'person' : 'people'}
              </Badge>
              
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                {Math.floor(post.duration / 60)}h {post.duration % 60 > 0 ? `${post.duration % 60}m` : ''}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t bg-gray-50 px-4 py-3 flex justify-between">
        <div className="text-xs text-gray-500">{timeElapsed}</div>
        
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
            onClick={() => onVerify(post.id, true)}
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            <span className="text-xs">{post.verifications.positive}</span>
          </Button>
          
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => onVerify(post.id, false)}
          >
            <ThumbsDown className="h-4 w-4 mr-1" />
            <span className="text-xs">{post.verifications.negative}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SeatPost;
