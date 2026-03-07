'use client'
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from './login/page';
import { Sidebar } from '@/components/sidebar';
import { 
  Users, 
  ShieldCheck, 
  ClipboardList, 
  MessageSquareText, 
  CircleDot, 
  Mail
} from 'lucide-react';

export default function HomePage() {
  const [adminCount, setAdminCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [habitCount, setHabitCount] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);  
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  
  // Actual Server Status State
  const [responseTime, setResponseTime] = useState('0ms');
  const [dbStatus, setDbStatus] = useState('Checking...');

  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    const startTime = performance.now();

    const fetchAllData = async () => {
      try {
        // 1. Fetch Counts
        const endpoints = [
          { url: 'adminusers/count', setter: setAdminCount },
          { url: 'users/count', setter: setUserCount },
          { url: 'habits/count', setter: setHabitCount },
          { url: 'userfeedback/count', setter: setFeedbackCount }, // Removed leading slash
        ];

        await Promise.all(endpoints.map(endpoint => 
          fetch(`http://localhost:3001/api/${endpoint.url}`)
            .then(res => res.json())
            .then(data => endpoint.setter(data.count ?? 0))
        ));

        // 2. Fetch Recent Feedbacks
        const feedbackRes = await fetch('http://localhost:3001/api/userfeedback');
        const feedbackData = await feedbackRes.json();
        setFeedbacks(Array.isArray(feedbackData) ? feedbackData : []);

        // Calculate actual response time
        const endTime = performance.now();
        setResponseTime(`${Math.round(endTime - startTime)}ms`);
        setDbStatus('Optimal');

      } catch (err) {
        console.error('System Fetch Error:', err);
        setDbStatus('Disconnected');
        setResponseTime('Timeout');
      }
    };

    if (isAuthenticated) fetchAllData();
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-gray-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return <LoginPage />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 dark:bg-[#0B0F1A] dark:text-white font-sans">
      <Sidebar />
      
      <div className="pl-64">
        <main className="p-8 max-w-7xl mx-auto">
          
          <div className="mb-10 flex items-center justify-between border-b border-slate-200 pb-6 dark:border-gray-800">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Admin Dashboard</h1>
              <p className="text-slate-500 text-sm">Session: {user?.email || 'root@system'}</p>
            </div>
            <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${dbStatus === 'Optimal' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'}`}>
              <CircleDot size={12} className={dbStatus === 'Optimal' ? "animate-pulse" : ""} />
              {dbStatus === 'Optimal' ? 'SYSTEM ONLINE' : 'SYSTEM OFFLINE'}
            </div>
          </div>

          <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Users" value={userCount} icon={<Users />} color="blue" />
            <StatCard label="Admin Privileges" value={adminCount} icon={<ShieldCheck />} color="purple" />
            <StatCard label="Global Habits" value={habitCount} icon={<ClipboardList />} color="amber" />
            <StatCard label="Feedback" value={feedbackCount} icon={<MessageSquareText />} color="rose" />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-gray-800">
                  <h3 className="font-bold text-lg">Recent Feedbacks</h3>
                </div>
                <div className="p-0">
                  {feedbacks.length > 0 ? (
                    feedbacks.map((f) => (
                      <div key={f.id} className="flex items-center justify-between border-b border-slate-50 p-6 last:border-0 dark:border-gray-800/50 hover:bg-slate-50 dark:hover:bg-gray-800/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="rounded-full bg-slate-100 p-2 dark:bg-gray-800">
                            <Mail size={18} className="text-slate-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{f.email || 'Anonymous'}</p>
                            <p className="text-sm text-slate-500 italic">"{f.feedbackmsg}"</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-medium text-slate-400 uppercase">
                          {f.created_at ? new Date(f.created_at).toLocaleDateString() : 'Today'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center text-slate-500">No feedback entries found.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h3 className="mb-6 font-bold text-lg">Server Status</h3>
                <div className="space-y-6">
                  <ServerMetric 
                    label="Database Connection" 
                    status={dbStatus} 
                    isError={dbStatus !== 'Optimal'} 
                  />
                  <ServerMetric 
                    label="API Response Time" 
                    status={responseTime} 
                  />
                  <ServerMetric 
                    label="Auth Service" 
                    status={isAuthenticated ? "Authenticated" : "Waiting"} 
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: any) {
  const colors: any = {
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
    amber: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
    rose: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20',
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`rounded-xl p-3 ${colors[color]}`}>{icon}</div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{label}</p>
          <h2 className="text-2xl font-black">{value}</h2>
        </div>
      </div>
    </div>
  );
}

function ServerMetric({ label, status, isError }: { label: string, status: string, isError?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</span>
      <span className={`text-xs font-bold ${isError ? 'text-rose-500' : 'text-indigo-600 dark:text-indigo-400'}`}>
        {status}
      </span>
    </div>
  );
}