import { Todo } from '@/types/todo';
import TodoList from './TodoList';

async function fetchTodos(): Promise<Todo[]> {
  try {
    const response = await fetch('http://localhost:8000/todos', {
      cache: 'no-store', // Disable caching to always fetch fresh data
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching todos:', error);
    return [];
  }
}

export default async function TodoTable() {
  const todos = await fetchTodos();

  return (
    <div className="overflow-x-auto rounded-xl">
      <TodoList todos={todos} />
    </div>
  );
}