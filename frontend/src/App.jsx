import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { useToast } from './hooks/useToast';
import { Toast } from './components/ui/Toast';
import Navbar from './components/Navbar';
import Index from './pages/Index';
import Auth from './pages/Auth';
import Plannings from './pages/Plannings';
import PlanningEditor from './pages/PlanningEditor';
import Profile from './pages/Profile';

const App = () => {
  const { toasts } = useToast();

  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/plannings" element={<Plannings />} />
          <Route path="/planning/:id" element={<PlanningEditor />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <Toast toasts={toasts} />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
