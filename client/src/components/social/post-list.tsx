import React from 'react';
import SeatPost, { SeatPostProps } from '@/components/social/seat-post';

interface PostListProps {
  posts: SeatPostProps['post'][];
  onVerify: (postId: number, isPositive: boolean) => void;
  emptyMessage?: string;
}

const PostList: React.FC<PostListProps> = ({ 
  posts, 
  onVerify,
  emptyMessage = "No posts found"
}) => {
  if (posts.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 border-dashed rounded-lg p-8 text-center">
        <h3 className="text-gray-500 font-medium">{emptyMessage}</h3>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {posts.map(post => (
        <SeatPost 
          key={post.id} 
          post={post} 
          onVerify={onVerify}
        />
      ))}
    </div>
  );
};

export default PostList;
