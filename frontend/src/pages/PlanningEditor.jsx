import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { planningAPI, eventAPI, frenchToDay } from '../api/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ChevronLeft, ChevronRight, Download, Trash2, Edit2 } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import html2canvas from 'html2canvas';
import StreamEventDialog from '../components/StreamEventDialog';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export default function PlanningEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const planningRef = useRef(null);

  const [planning, setPlanning] = useState(null);
  const [events, setEvents] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [weekStart, setWeekStart] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [preselectedDay, setPreselectedDay] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchPlanning();
      fetchEvents();
    }
  }, [user, id]);

  const fetchPlanning = async () => {
    try {
      const data = await planningAPI.getById(id);
      setPlanning(data);
      const start = new Date(data.start_date);
      setWeekStart(startOfWeek(start, { weekStartsOn: 1 }));
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Planning introuvable',
        variant: 'destructive',
      });
      navigate('/plannings');
    }
  };

  const fetchEvents = async () => {
    try {
      const data = await eventAPI.getByPlanning(id);
      setEvents(data);
      setFetching(false);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les événements',
        variant: 'destructive',
      });
      setFetching(false);
    }
  };

  const updatePlanningTitle = async (newTitle) => {
    try {
      await planningAPI.update(id, { title: newTitle });
      setPlanning({ ...planning, title: newTitle });
      toast({ title: 'Succès', description: 'Titre modifié' });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };

  const deleteEvent = async (eventId) => {
    if (!window.confirm('Supprimer cet événement ?')) return;

    try {
      await eventAPI.delete(eventId);
      setEvents((prev) => prev.filter((e) => e.id_stream_events !== eventId));
      toast({ title: 'Succès', description: 'Événement supprimé' });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };

  const handleExportPNG = async () => {
    if (!planningRef.current) return;

    setExporting(true);
    toast({ title: 'Export en cours...', description: 'Veuillez patienter' });

    try {
      const el = planningRef.current;

      const rect = el.getBoundingClientRect();
      const width = Math.ceil(rect.width);
      const height = Math.ceil(rect.height);

      const canvas = await html2canvas(el, {
        backgroundColor: '#1e293b',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: false,

        scrollX: 0,
        scrollY: -window.scrollY,

        width,
        height,
        windowWidth: document.documentElement.clientWidth,
        windowHeight: document.documentElement.clientHeight,
      });

      canvas.toBlob((blob) => {
        if (!blob) {
          setExporting(false);
          toast({ title: 'Erreur', description: "Blob invalide", variant: 'destructive' });
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${planning?.title || 'planning'}-${format(new Date(), 'yyyy-MM-dd')}.png`;
        link.click();
        URL.revokeObjectURL(url);

        toast({ title: 'Succès', description: 'Planning exporté en PNG' });
        setExporting(false);
      });
    } catch (error) {
      console.error('Erreur export PNG:', error);
      toast({
        title: 'Erreur',
        description: "Impossible d'exporter le planning",
        variant: 'destructive',
      });
      setExporting(false);
    }
  };

  const openCreateDialog = (dayIndex) => {
    setEditingEvent(null);
    setPreselectedDay(dayIndex);
    setDialogOpen(true);
  };

  const openEditDialog = (event) => {
    setEditingEvent(event);
    setPreselectedDay(null);
    setDialogOpen(true);
  };

  const handleEventSaved = async () => {
    setDialogOpen(false);
    setEditingEvent(null);
    setPreselectedDay(null);
    
    // ✅ CORRECTION : Recharger les événements après sauvegarde
    await fetchEvents();
  };

  const getEventsForDay = (dayName) => {
    return events.filter((e) => e.day_of_week === dayName);
  };

  const navigateWeek = (direction) => {
    setWeekStart((prev) => addDays(prev, direction * 7));
  };

  
  const formatWeekRange = () => {
    if (!weekStart || !(weekStart instanceof Date) || isNaN(weekStart.getTime())) {
      return 'Date invalide';
    }
    const end = endOfWeek(weekStart, { weekStartsOn: 1 });
    return `${format(weekStart, 'd', { locale: fr })} → ${format(end, 'd MMMM', { locale: fr })}`;
  };

  if (fetching || !planning) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-10">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex-1">
            <Input
              value={planning.title}
              onChange={(e) => setPlanning({ ...planning, title: e.target.value })}
              onBlur={(e) => updatePlanningTitle(e.target.value)}
              className="text-2xl font-bold bg-transparent border-none text-white focus:border-purple-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => navigateWeek(-1)}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="text-sm text-gray-400 min-w-[150px] text-center">
                {formatWeekRange()}
              </span>
              <Button variant="ghost" size="icon" onClick={() => navigateWeek(1)}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <Button
              onClick={handleExportPNG}
              disabled={exporting}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Download className="mr-2 h-4 w-4" />
              {exporting ? 'Export...' : 'Export PNG'}
            </Button>
          </div>
        </div>

        {/* Planning Grid */}
        <div
          ref={planningRef}
          className="rounded-lg border border-gray-800 bg-gradient-to-br from-slate-900 to-slate-800 p-6"
        >
          {/* Title for export */}
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {planning.title}
            </h2>
            <p className="text-sm text-gray-400 mt-1">{formatWeekRange()}</p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-3">
            {DAYS.map((day, dayIndex) => {
              const dayEvents = getEventsForDay(day);
              const currentDate = addDays(weekStart, dayIndex);

              return (
                <div key={day} className="flex flex-col">
                  {/* Day header */}
                  <div className="mb-2 text-center">
                    <div className="text-sm font-semibold text-gray-300">{day}</div>
                    <div className="text-xs text-gray-500">
                      {format(currentDate, 'd MMM', { locale: fr })}
                    </div>
                  </div>

                  {/* Add button */}
                  <button
                    onClick={() => openCreateDialog(dayIndex)}
                    className="mb-2 rounded-lg border-2 border-dashed border-gray-700 py-3 text-gray-500 transition-colors hover:border-purple-500 hover:text-purple-400"
                  >
                    <span className="text-xl">+</span>
                  </button>

                  {/* Events */}
                  <div className="space-y-2 flex-1">
                    {dayEvents.length === 0 ? (
                      <div className="rounded-lg bg-gray-800/50 p-4 text-center text-xs text-gray-600">
                        OFF
                      </div>
                    ) : (
                      dayEvents.map((event) => (
                        <div
                          key={event.id_stream_events}
                          className="group relative cursor-pointer rounded-lg border border-gray-700 bg-gradient-to-br from-slate-800 to-slate-900 p-3 transition-all hover:border-purple-500"
                          onClick={() => openEditDialog(event)}
                        >
                          {/* Time */}
                          <div className="absolute top-2 left-2 rounded bg-cyan-500 px-2 py-0.5 text-xs font-bold text-white">
                            {event.start_time.slice(0, 5)}
                          </div>

                          {/* Image */}
                          {event.game_image_url && (
                            <img
                              src={event.game_image_url}
                              alt={event.game_name}
                              className="h-32 w-full rounded object-cover mb-2"
                              crossOrigin="anonymous"
                            />
                          )}

                          {/* Game name */}
                          <div className="mt-8 rounded bg-cyan-500/90 px-2 py-1 text-center">
                            <p className="text-xs font-semibold text-white truncate">
                              {event.game_name}
                            </p>
                          </div>

                          {/* Hover actions */}
                          <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditDialog(event);
                              }}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteEvent(event.id_stream_events);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* User info for export */}
          {user?.display_name && (
            <div className="mt-6 text-center text-sm text-gray-500">
              Planning by {user.display_name}
            </div>
          )}
        </div>
      </div>

      {/* Dialog */}
      <StreamEventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        planningId={id}
        editingEvent={editingEvent}
        preselectedDay={preselectedDay}
        onSaved={handleEventSaved}
      />
    </div>
  );
}