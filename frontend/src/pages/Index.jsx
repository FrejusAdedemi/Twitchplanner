import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { CalendarDays, Zap, Download } from 'lucide-react';

export default function Index() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-gray-950" />
        <div className="relative container mx-auto px-4 py-32 text-center">
          <div className="animate-fade-in">
            <CalendarDays className="mx-auto mb-6 h-16 w-16 text-purple-600" />
            <h1 className="mb-6 text-5xl font-bold md:text-7xl">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                TwitchPlanner
              </span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-xl text-gray-400 md:text-2xl">
              Crée et partage tes plannings de stream en quelques clics.
              Organise ta semaine, informe ta communauté.
            </p>
            <div className="flex justify-center gap-4">
              {user ? (
                <Link to="/plannings">
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 text-lg">
                    Mes plannings
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/auth?mode=signup">
                    <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 text-lg">
                      Commencer gratuitement
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button size="lg" variant="outline" className="px-8 text-lg">
                      Se connecter
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-24">
        <h2 className="mb-16 text-center text-3xl font-bold text-white">
          Tout ce dont tu as besoin
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              icon: CalendarDays,
              title: 'Planning hebdomadaire',
              desc: 'Vue semaine complète avec tous tes streams organisés jour par jour.',
            },
            {
              icon: Zap,
              title: 'Rapide & simple',
              desc: 'Ajoute tes streams en quelques secondes avec le nom du jeu, l\'heure et l\'image.',
            },
            {
              icon: Download,
              title: 'Export en image',
              desc: 'Exporte ton planning en PNG pour le partager sur tes réseaux sociaux.',
            },
          ].map((f, i) => (
            <div
              key={i}
              className="rounded-lg border border-gray-800 bg-gray-900 p-8 transition-colors hover:border-purple-600/50"
            >
              <f.icon className="mb-4 h-10 w-10 text-purple-600" />
              <h3 className="mb-2 text-xl font-semibold text-white">{f.title}</h3>
              <p className="text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          © 2026 TwitchPlanner. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
