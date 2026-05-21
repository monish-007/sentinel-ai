import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Chat from './pages/Chat.jsx';
import Incidents from './pages/Incidents.jsx';
import AuditLog from './pages/AuditLog.jsx';
import Analytics from './pages/Analytics.jsx';
import Memory from './pages/Memory.jsx';

export default function App() {
  return (
    <div className="flex h-screen bg-sentinel-dark">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/audit" element={<AuditLog />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/memory" element={<Memory />} />
        </Routes>
      </main>
    </div>
  );
}
