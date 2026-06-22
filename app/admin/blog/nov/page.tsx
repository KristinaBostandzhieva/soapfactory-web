import PostForm from '@/components/admin/PostForm';
import { createPost } from '@/app/admin/actions';

export default function NewPostPage() {
  return <PostForm action={createPost} heading="Нова статия" />;
}
