import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

import Landing from '@/pages/Landing';
import Auth from '@/pages/Auth';
import CreateRoom from '@/pages/CreateRoom';
import JoinRoom from '@/pages/JoinRoom';
import Lobby from '@/pages/Lobby';
import Game from '@/pages/Game';
import History from '@/pages/History';
import Profile from '@/pages/Profile';
import Rules from '@/pages/Rules';

const queryClient = new QueryClient();

// Protected Route Wrapper
function ProtectedRoute({ component: Component, ...rest }: any) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-12 h-12 text-primary animate-spin" /></div>;
  }
  
  if (!user) {
    // Return redirect directly but wouter handles this by redirecting via hook or link.
    // simpler: just render Auth if not logged in
    return <Auth />;
  }
  
  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/auth" component={Auth} />
      <Route path="/rules" component={Rules} />
      
      {/* Protected Routes */}
      <Route path="/create">
        {() => <ProtectedRoute component={CreateRoom} />}
      </Route>
      <Route path="/join">
        {() => <ProtectedRoute component={JoinRoom} />}
      </Route>
      <Route path="/lobby/:roomCode">
        {() => <ProtectedRoute component={Lobby} />}
      </Route>
      <Route path="/game/:roomCode">
        {() => <ProtectedRoute component={Game} />}
      </Route>
      <Route path="/history">
        {() => <ProtectedRoute component={History} />}
      </Route>
      <Route path="/profile">
        {() => <ProtectedRoute component={Profile} />}
      </Route>

      <Route>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center text-white">
          <h1 className="text-6xl font-black text-primary mb-4">404</h1>
          <p className="text-white/50 uppercase tracking-widest font-bold">Page Not Found</p>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
