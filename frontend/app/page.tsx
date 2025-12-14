import GlassForm from "@/components/GlassForm";
import TodoTable from "@/components/TodoTable";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-12">
        {/* Header Section */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent text-white mb-4">
            To-Do App
          </h1>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto">
            Manage your tasks with our modern glassmorphism UI. Add, complete, and organize your to-dos seamlessly.
          </p>
        </header>

        {/* GlassForm Section */}
        <section className="glass rounded-2xl p-6 md:p-8 fade-in">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Add New Task</h2>
          <GlassForm />
        </section>

        {/* TodoTable Section */}
        <section className="glass rounded-2xl p-6 md:p-8 fade-in">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Your Tasks</h2>
          <TodoTable />
        </section>
      </div>
    </div>
  );
}