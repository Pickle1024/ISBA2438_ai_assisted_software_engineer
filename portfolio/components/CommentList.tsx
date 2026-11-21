"use client";

import CommentItem from "@/components/CommentItem";

export type Comment = {
  id: string;
  cardId: string;
  name: string;
  message: string;
  createdAt: string;
  updatedAt?: string;
};

type CommentErrors = {
  name?: string;
  message?: string;
};

type CommentListProps = {
  // The fetched data, passed down from CommentSection as props.
  comments: Comment[];
  onEdit: (id: string, values: { name: string; message: string }) => Promise<CommentErrors | null>;
  onDelete: (id: string) => Promise<void>;
};

// Renders the comments it receives through props and reports every change
// back up through the two callbacks. Holds no data of its own.
export default function CommentList({ comments, onEdit, onDelete }: CommentListProps) {
  if (comments.length === 0) {
    return <p className="comment-empty">No comments yet. Start the conversation.</p>;
  }

  return (
    <div className="comment-list">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
