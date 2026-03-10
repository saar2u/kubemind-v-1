import React, { Component, ErrorInfo, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './components/layout/DashboardLayout';
import ChatInterface from './components/chat/ChatInterface';
import ConnectionsView from './pages/dashboard/ConnectionsView';
import OverviewView from './pages/dashboard/OverviewView';
import FeedbackView from './pages/dashboard/FeedbackView';
import ProfileView from './pages/dashboard/ProfileView';

interface Props { children: ReactNode; }
interface State { hasError: boolean; errorMsg: string; }

class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, errorMsg: "" };
  public static getDerivedStateFromError(error: Error): State { return { hasError: true, errorMsg: error.toString() }; }
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error("Uncaught error:", error, errorInfo); }
  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full border border-red-100">
            <h1 className="text-2xl font-bold text-red-600 mb-4">React UI Crashed</h1>
            <div className="bg-slate-900 text-red-400 p-4 rounded-lg font-mono text-sm overflow-auto">{this.state.errorMsg}</div>
            <button onClick={() => { localStorage.clear(); window.location.href='/'; }} className="mt-6 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800">Clear Storage & Go Home</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const userEmail = localStorage.getItem('kubemind-user-email');
  return userEmail ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
            <Route index element={
              <div className="h-full flex flex-col">
                <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Agent Kube</h1>
                <p className="text-slate-500 mb-6">Ask Kubemind to manage your connected cloud resources.</p>
                <div className="flex-1 min-h-0 pb-2"><ErrorBoundary><ChatInterface /></ErrorBoundary></div>
              </div>
            } />
            <Route path="overview" element={<ErrorBoundary><OverviewView /></ErrorBoundary>} />
            <Route path="connections" element={<ErrorBoundary><ConnectionsView /></ErrorBoundary>} />
            <Route path="feedback" element={<ErrorBoundary><FeedbackView /></ErrorBoundary>} />
            <Route path="profile" element={<ErrorBoundary><ProfileView /></ErrorBoundary>} />
          </Route>
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
