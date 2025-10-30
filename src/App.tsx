// top-level React import not required with the new JSX transform
import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { AppRouter } from '@/routes/AppRouter';
import { queryClient } from '@/lib/queryClient';
import { seedDatabase } from '@/lib/seed';
import './index.css';

function App() {
  useEffect(() => {
    // Seed the database when the app starts
    seedDatabase();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
