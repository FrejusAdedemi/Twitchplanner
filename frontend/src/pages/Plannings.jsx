import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { planningAPI } from '../api/api';
import { Button } from '../components/ui/Button';
import { Plus, Trash2, Edit, CalendarDays } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Plannings() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plannings, setPlannings] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) fetchPlannings();
  }, [user]);

  const fetchPlannings = async () => {
    try {
      const data = await planningAPI.getAll();
      setPlannings(data);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les plannings',
        variant: 'destructive',
      });
    }
    setFetching(false);
  };

  const createPlanning = async () => {
    try {
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const newPlanning = await planningAPI.create({
        title: 'Planning de stream',
        start_date: format(now, 'yyyy-MM-dd'),
        end_date: format(nextWeek, 'yyyy-MM-dd'),
      });
      
      navigate(`/planning/${newPlanning.id_plannings}`);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };

  const deletePlanning = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce planning ?')) {
      return;
    }

    try {
      await planningAPI.delete(id);
      setPlannings((p) => p.filter((pl) => pl.id_plannings !== id));
      toast({ title: 'Succès', description: 'Planning supprimé' });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };

  const formatRange = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    return `${format(s, 'd', { locale: fr })} → ${format(e, 'd MMMM', { locale: fr })}`;
  };

  if (fetching) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Mes plannings</h1>
          <Button onClick={createPlanning} className="bg-gradient-to-r from-purple-600 to-pink-600">
            <Plus className="mr-2 h-4 w-4" /> Nouveau planning
          </Button>
        </div>

        {plannings.length === 0 ? (
          <div className="py-20 text-center">
            <CalendarDays className="mx-auto mb-4 h-16 w-16 text-gray-600" />
            <p className="mb-4 text-lg text-gray-400">Aucun planning pour le moment.</p>
            <Button onClick={createPlanning} className="bg-gradient-to-r from-purple-600 to-pink-600">
              Créer mon premier planning
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plannings.map((p) => (
              <div
                key={p.id_plannings}
                className="group rounded-xl border border-gray-800 bg-gray-900 p-6 transition-colors hover:border-purple-500"
              >
                <h3 className="mb-1 text-lg font-semibold text-white">{p.title}</h3>
                <p className="mb-4 text-sm text-gray-400">
                  {formatRange(p.start_date, p.end_date)}
                </p>
                <div className="flex gap-2">
                  <Link to={`/planning/${p.id_plannings}`} className="flex-1">
                    <Button variant="secondary" className="w-full" size="sm">
                      <Edit className="mr-1 h-3.5 w-3.5" /> Modifier
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deletePlanning(p.id_plannings)}
                    className="text-red-500 hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}