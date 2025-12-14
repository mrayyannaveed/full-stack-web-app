'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TodoFormData {
  task: string;
}

export default function GlassForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<TodoFormData>({
    task: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          completed: false, // New todos start as not completed
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create todo');
      }

      const result = await response.json();
      console.log('Todo created:', result);

      // Reset form
      setFormData({
        task: '',
      });

      // Refresh the page to update the todo list
      router.refresh();
    } catch (err) {
      console.error('Error creating todo:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="glass p-4 rounded-lg text-red-300 bg-red-500/10 border border-red-500/30">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="task" className="block text-sm font-medium text-gray-300 mb-2">
          Task Description
        </label>
        <input
          type="text"
          id="task"
          name="task"
          value={formData.task}
          onChange={handleChange}
          required
          className="glass w-full px-4 py-3 rounded-lg text-white input-focus"
          placeholder="Enter your task here..."
        />
      </div>

      <div className="flex justify-center">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`glass w-full md:w-auto px-8 py-3 rounded-lg font-medium text-white transition-all duration-300 btn-transition ${
            isSubmitting
              ? 'opacity-70 cursor-not-allowed'
              : 'hover:opacity-90 hover:shadow-lg transform hover:-translate-y-0.5'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding...
            </span>
          ) : (
            'Add Task'
          )}
        </button>
      </div>
    </form>
  );
}