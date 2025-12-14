'use client';

import { useState } from 'react';
import { Todo } from '@/types/todo';
import { useRouter } from 'next/navigation';
import TodoEditor from './TodoEditor';

interface TodoListProps {
  todos: Todo[];
}

export default function TodoList({ todos }: TodoListProps) {
  const router = useRouter();
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  // Toggle completion status of a todo
  const toggleTodo = async (id: number, currentStatus: boolean, task: string) => {
    try {
      const response = await fetch(`http://localhost:8000/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          task,
          completed: !currentStatus,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh the page to update the todo list
      router.refresh();
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8000/todos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh the page to update the todo list
      router.refresh();
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  return (
    <>
      {todos.length > 0 ? (
        <div className="space-y-2">
          {todos.map((todo, index) => (
            <div
              key={todo.id}
              className={`glass p-4 rounded-lg flex items-center justify-between transition-all duration-300 ease-in-out ${
                index % 2 === 0 ? 'bg-glass/20' : 'bg-glass/10'
              } ${todo.completed ? 'opacity-70' : ''} task-appear`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => toggleTodo(todo.id, todo.completed, todo.task)}
                  className={`checkbox-toggle flex-shrink-0 ${todo.completed ? 'task-complete' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    readOnly
                    className="cursor-pointer"
                  />
                  <span className="checkmark"></span>
                </button>
                <span
                  className={`text-lg ${todo.completed ? 'line-through text-gray-400' : 'text-white'}`}
                >
                  {todo.task}
                </span>
              </div>
              <div className="flex space-x-3">
                <button
                  className="text-blue-300 hover:text-blue-100 transition-colors duration-200 btn-transition"
                  onClick={() => setEditingTodo(todo)}
                >
                  Edit
                </button>
                <button
                  className="text-red-300 hover:text-red-100 transition-colors duration-200 btn-transition"
                  onClick={() => deleteTodo(todo.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-300 text-lg">No tasks found. Add a new task to get started!</p>
        </div>
      )}
      {editingTodo && (
        <TodoEditor
          todo={editingTodo}
          isOpen={!!editingTodo}
          onClose={() => setEditingTodo(null)}
        />
      )}
    </>
  );
}