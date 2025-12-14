'use client';

import { useState, useEffect } from 'react';
import { Todo } from '@/types/todo';
import { useRouter } from 'next/navigation';

interface TodoEditorProps {
  todo: Todo;
  isOpen: boolean;
  onClose: () => void;
}

export default function TodoEditor({ todo, isOpen, onClose }: TodoEditorProps) {
  const router = useRouter();
  const [editedTask, setEditedTask] = useState(todo.task);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEditedTask(todo.task);
  }, [todo.task]);

  const handleSave = async () => {
    if (!editedTask.trim()) {
      setError('Task cannot be empty');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8000/todos/${todo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: todo.id,
          task: editedTask.trim(),
          completed: todo.completed,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update todo');
      }

      // Close modal and refresh the page to update the todo list
      onClose();
      router.refresh();
    } catch (err) {
      console.error('Error updating todo:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedTask(todo.task); // Reset to original value
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative glass rounded-2xl p-6 md:p-8 w-full max-w-md z-10">
        <h2 className="text-2xl font-bold text-white mb-4">Edit Task</h2>
        
        {error && (
          <div className="glass p-4 rounded-lg text-red-300 bg-red-500/10 border border-red-500/30 mb-4">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label htmlFor="edit-task" className="block text-sm font-medium text-gray-300 mb-2">
            Task Description
          </label>
          <input
            type="text"
            id="edit-task"
            value={editedTask}
            onChange={(e) => setEditedTask(e.target.value)}
            className="glass w-full px-4 py-3 rounded-lg text-white input-focus"
            placeholder="Edit your task here..."
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                handleCancel();
              } else if (e.key === 'Enter' && !isSaving) {
                handleSave();
              }
            }}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="glass px-6 py-2 rounded-lg font-medium text-gray-300 hover:bg-gray-700/50 transition-all duration-300 btn-transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`glass px-6 py-2 rounded-lg font-medium text-white transition-all duration-300 btn-transition ${
              isSaving
                ? 'opacity-70 cursor-not-allowed'
                : 'hover:opacity-90 hover:shadow-lg'
            }`}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}