import { getTodos } from '@/lib/db-operations';
import TodoForm from '@/components/TodoForm';
import TodoList from '@/components/TodoList';

export default async function SupabaseExamplePage() {
  const todos = await getTodos();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Supabase Todo Example</h1>
      <div className="space-y-8">
        <TodoForm />
        <TodoList initialTodos={todos} />
      </div>
    </div>
  );
} 