import { useSelector } from 'react-redux'

export default function ScoreCard({ score = 0 }) {
  const checklist = useSelector((state) => state.preparedness.checklist)
  const checklistCompleted = useSelector((state) => state.preparedness.checklistCompleted)
  
  const getChecklistStats = () => {
    if (!Array.isArray(checklist) || checklist.length === 0) {
      return { total: 0, completed: 0 }
    }
    const total = checklist.length
    const completed = Object.values(checklistCompleted).filter(Boolean).length
    return { total, completed }
  }

  const { total, completed } = getChecklistStats()

  const getStatus = () => {
    if (score >= 90) return { text: 'Excellent!', color: 'from-emerald-500 to-green-600', textColor: 'text-emerald-600 dark:text-emerald-400' }
    if (score >= 70) return { text: 'Well Prepared', color: 'from-blue-500 to-cyan-600', textColor: 'text-blue-600 dark:text-blue-400' }
    if (score >= 50) return { text: 'Getting There', color: 'from-amber-500 to-orange-600', textColor: 'text-amber-600 dark:text-amber-400' }
    return { text: 'Needs Attention', color: 'from-red-500 to-rose-600', textColor: 'text-red-600 dark:text-red-400' }
  }

  const status = getStatus()
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-100 dark:border-slate-700">
      <h4 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
        <span className="text-xl">📊</span> Preparedness Score
      </h4>
      
      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32 shrink-0">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-slate-200 dark:text-slate-700"
            />
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" className="text-emerald-400" style={{ stopColor: 'currentColor' }} />
                <stop offset="100%" className="text-cyan-500" style={{ stopColor: 'currentColor' }} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-black bg-linear-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {score}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">/ 100</div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className={`text-xl font-bold mb-2 ${status.textColor}`}>
            {status.text}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
            {score === 0 
              ? 'Generate your checklist and start checking off items to improve your preparedness score.'
              : `You've completed ${completed} of ${total} checklist items.`}
          </p>
          {total > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>Checklist Progress</span>
                <span>{completed}/{total} items</span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-linear-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          )}
          {score > 0 && score < 100 && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              💡 Check off more items in your checklist to reach 100%
            </p>
          )}
          {score === 100 && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              🎉 Congratulations! You're fully prepared!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
