export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-6">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
            <span className="text-white text-3xl font-bold">S</span>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          SchoolMATE
          <span className="block text-blue-600 text-3xl font-semibold mt-1">
            Student Portal
          </span>
        </h1>

        <p className="text-lg text-gray-600 mb-10">
          Your personalized learning companion. Track progress, discover strengths,
          and chart your path to success.
        </p>

        {/* Status badge */}
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
          Under Development — Coming Soon
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          {[
            { icon: "📊", label: "Grade Analytics" },
            { icon: "🌳", label: "Learning Tree" },
            { icon: "🎯", label: "Goal Tracking" },
            { icon: "🎓", label: "Career Guidance" },
          ].map((f) => (
            <div key={f.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-2xl mb-1">{f.icon}</div>
              <div className="text-sm font-medium text-gray-700">{f.label}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="mt-10 text-xs text-gray-400">
          © {new Date().getFullYear()} SchoolMATE · portal.schoolmate-online.net
        </p>
      </div>
    </main>
  )
}
