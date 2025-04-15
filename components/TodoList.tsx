'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TodoItem, updateTodo, deleteTodo } from '@/lib/db-operations';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

type TodoListProps = {
  initialTodos: TodoItem[];
};

export default function TodoList({ initialTodos }: TodoListProps) {
  const [todos, setTodos] = useState(initialTodos);
  const router = useRouter();

  const handleToggleTodo = async (id: string, completed: boolean) => {
    try {
      await updateTodo(id, { completed });
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, completed } : todo
        )
      );
      router.refresh();
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await deleteTodo(id);
      setTodos(todos.filter((todo) => todo.id !== id));
      router.refresh();
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  if (todos.length === 0) {
    return <p className="text-center text-muted-foreground">No todos yet. Add one above!</p>;
  }

  return (
    <ul className="space-y-2">
      {todos.map((todo) => (
        <li 
          key={todo.id} 
          className="flex items-center justify-between p-3 border rounded-md"
        >
          <div className="flex items-center gap-2">
            <Checkbox
              checked={todo.completed}
              onCheckedChange={(checked) => 
                handleToggleTodo(todo.id!, checked as boolean)
              }
              id={`todo-${todo.id}`}
            />
            <label 
              htmlFor={`todo-${todo.id}`}
              className={`${todo.completed ? 'line-through text-muted-foreground' : ''}`}
            >
              {todo.title}
            </label>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteTodo(todo.id!)}
            aria-label="Delete todo"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </li>
      ))}
    </ul>
  );
} 