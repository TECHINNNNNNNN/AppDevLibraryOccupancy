import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThumbsUp, ThumbsDown, Clock, Users, MapPin, MessageSquare, Share2 } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface SeatPostProps {
  post: {
    id: number;
    userId: number;
    userName: string;
    userAvatar?: string;
    location: {
      zone: string;
      seatId?: string;
      coordinates?: {
        x: number;
        y: number;
      };
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
    status: 'active' | 'expired' | 'removed';
    createdAt: Date;
  };
  onVerify: (postId: number, isPositive: boolean) => void;
  onShare?: (postId: number) => void;
}

const SeatPost: React.FC<SeatPostProps> = ({ post, onVerify, onShare }) => {
  const [verifying, setVerifying] = useState<boolean>(false);
  
  const timeRemaining = new Date(post.endTime) > new Date() 
    ? formatDistanceToNow(new Date(post.endTime), { addSuffix: true })
    : 'Expired';
  
  const timeElapsed = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
  
  const isExpired = post.status === 'expired' || new Date(post.endTime) <= new Date();
  
  const handleVerify = (isPositive: boolean) => {
    setVerifying(true);
    onVerify(post.id, isPositive);
    setTimeout(() => setVerifying(false), 1000);
  };
  
  return (
    <Card className={`overflow-hidden ${isExpired ? 'opacity-60' : ''}`}>
      <CardHeader className="p-3 pb-0">
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className={isExpired ? 'bg-gray-100' : 'bg-green-100 text-green-800'}>
                  <Clock className="mr-1 h-3 w-3" />
                  {timeRemaining}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Posted {timeElapsed}</p>
                {!isExpired && <p>Seat claimed until {new Date(post.endTime).toLocaleTimeString()}</p>}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
        
      <CardContent className="p-3">
        {post.imageUrl && (
          <div className="w-full mb-3 rounded overflow-hidden">
            <img 
              src={post.imageUrl} 
              alt="Seat area" 
              className="w-full h-48 object-cover"
            />
          </div>
        )}
        
        <div className="space-y-2">
          {post.message && (
            <div className="flex items-start">
              <MessageSquare className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
              <p className="text-sm text-gray-700">{post.message}</p>
            </div>
          )}
          
          <div className="flex items-start">
            <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {post.location.zone}
                {post.location.seatId && ` - Seat ${post.location.seatId}`}
              </p>
              {post.location.coordinates && (
                <p className="text-xs text-gray-500">
                  Coordinates: {post.location.coordinates.x}, {post.location.coordinates.y}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              <Users className="mr-1 h-3 w-3" />
              {post.groupSize} {post.groupSize === 1 ? 'person' : 'people'}
            </Badge>
            
            <Badge variant="outline" className="bg-purple-50 text-purple-700">
              {Math.floor(post.duration / 60)}h {post.duration % 60 > 0 ? `${post.duration % 60}m` : ''}
            </Badge>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t bg-gray-50 px-4 py-3 flex justify-between">
        <Button
          size="sm"
          variant="ghost"
          className="text-gray-600"
          onClick={() => onShare && onShare(post.id)}
        >
          <Share2 className="h-4 w-4 mr-1" />
          <span className="text-xs">Share</span>
        </Button>
        
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={() => handleVerify(true)}
                  disabled={verifying || isExpired}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  <span className="text-xs">{post.verifications.positive}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Confirm seat is occupied</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleVerify(false)}
                  disabled={verifying || isExpired}
                >
                  <ThumbsDown className="h-4 w-4 mr-1" />
                  <span className="text-xs">{post.verifications.negative}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Report seat as actually available</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SeatPost;
