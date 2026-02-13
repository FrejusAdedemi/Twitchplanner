import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/Button';
import { CalendarDays, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  // 🆕 Récupération du pseudo
  const displayName = user?.display_name || user?.email?.split('@')[0] || 'Utilisateur';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <CalendarDays className="h-7 w-7 text-purple-600" />
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            TwitchPlanner
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/plannings">
                <Button variant="ghost" size="sm">
                  {/* 🆕 Affichage du pseudo */}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300">Plannings</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-purple-400 font-medium">{displayName}</span>
                  </div>
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost" size="icon">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm">
                  Connexion
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600">
                  Créer un compte
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}