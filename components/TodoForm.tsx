'use client';

import { useState } from 'react';
import { addTodo } from '@/lib/db-operations';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function TodoForm() {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await addTodo({
        title: title.trim(),
        completed: false,
      });
      setTitle('');
      router.refresh();
    } catch (error) {
      console.error('Failed to add todo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new todo..."
          className="flex-1"
          disabled={isSubmitting}
        />
        <Button type="submit" disabled={isSubmitting || !title.trim()}>
          {isSubmitting ? 'Adding...' : 'Add Todo'}
        </Button>
      </div>
    </form>
  );
} 