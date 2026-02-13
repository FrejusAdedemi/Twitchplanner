import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogHeader, DialogTitle } from './ui/Dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { eventAPI, dayToFrench, frenchToDay } from '../api/api';
import { useToast } from '../hooks/useToast';
import { Upload, X } from 'lucide-react';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

// ✅ FONCTION DE COMPRESSION D'IMAGE
const compressImage = (file, maxWidth = 800, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Redimensionner si trop large
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir en base64 avec compression
        canvas.toBlob(
          (blob) => {
            const compressedReader = new FileReader();
            compressedReader.onloadend = () => resolve(compressedReader.result);
            compressedReader.onerror = reject;
            compressedReader.readAsDataURL(blob);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function StreamEventDialog({
  open,
  onOpenChange,
  planningId,
  editingEvent,
  preselectedDay,
  onSaved,
}) {
  const { toast } = useToast();
  const [gameName, setGameName] = useState('');
  const [streamTitle, setStreamTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [startTime, setStartTime] = useState('21:00');
  const [endTime, setEndTime] = useState('23:00');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (editingEvent) {
      setGameName(editingEvent.game_name);
      setStreamTitle(editingEvent.stream_title || '');
      setImageUrl(editingEvent.game_image_url || '');
      setImageBase64('');
      const dayIndex = frenchToDay(editingEvent.day_of_week);
      setSelectedDays([dayIndex]);
      setStartTime(editingEvent.start_time.slice(0, 5));
      setEndTime(editingEvent.end_time.slice(0, 5));
    } else {
      resetForm();
      if (preselectedDay !== null && preselectedDay !== undefined) {
        setSelectedDays([preselectedDay]);
      }
    }
  }, [editingEvent, open, preselectedDay]);

  const resetForm = () => {
    setGameName('');
    setStreamTitle('');
    setImageUrl('');
    setImageBase64('');
    setSelectedDays([]);
    setStartTime('21:00');
    setEndTime('23:00');
  };

  const toggleDay = (i) => {
    setSelectedDays((prev) =>
      prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i]
    );
  };

  // ✅ CORRECTION : Compression automatique
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Erreur',
        description: "L'image ne doit pas dépasser 10 Mo.",
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      // Créer URL blob pour preview
      const blobUrl = URL.createObjectURL(file);
      setImageUrl(blobUrl);

      // Compresser l'image
      const compressedBase64 = await compressImage(file, 800, 0.7);
      setImageBase64(compressedBase64);

      const sizeBefore = (file.size / 1024).toFixed(2);
      const sizeAfter = (compressedBase64.length * 0.75 / 1024).toFixed(2);

      toast({
        title: 'Image compressée',
        description: `${sizeBefore} Ko → ${sizeAfter} Ko`,
      });

      setUploading(false);
    } catch (error) {
      console.error('Erreur compression:', error);
      toast({
        title: 'Erreur',
        description: "Erreur lors de la compression de l'image",
        variant: 'destructive',
      });
      setUploading(false);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!gameName.trim()) {
      toast({ title: 'Erreur', description: 'Le nom du jeu est requis.', variant: 'destructive' });
      return;
    }
    if (selectedDays.length === 0) {
      toast({ title: 'Erreur', description: 'Sélectionne au moins un jour.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);

    try {
      const imageToSend = imageBase64 || imageUrl || null;

      if (editingEvent) {
        await eventAPI.update(editingEvent.id_stream_events, {
          game_name: gameName,
          stream_title: streamTitle || null,
          game_image_url: imageToSend,
          day_of_week: dayToFrench(selectedDays[0]),
          start_time: startTime,
          end_time: endTime,
        });
        toast({ title: 'Succès', description: 'Événement modifié avec succès.' });
      } else {
        for (const dayIndex of selectedDays) {
          await eventAPI.create(planningId, {
            game_name: gameName,
            stream_title: streamTitle || null,
            game_image_url: imageToSend,
            day_of_week: dayToFrench(dayIndex),
            start_time: startTime,
            end_time: endTime,
          });
        }
        toast({ title: 'Succès', description: 'Événement(s) créé(s) avec succès.' });
      }
      onSaved();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    }

    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>
          {editingEvent ? 'Modifier le stream' : 'Créer un stream'}
        </DialogTitle>
      </DialogHeader>

      <div className="mt-4 space-y-4">
        <div className="space-y-2">
          <Label>Nom du jeu / catégorie</Label>
          <Input
            placeholder="Ex: Clair Obscur: Expedition 33"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Titre du stream (optionnel)</Label>
          <Input
            placeholder="Ex: On découvre le jeu !"
            value={streamTitle}
            onChange={(e) => setStreamTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Image du jeu</Label>
          <div className="flex gap-2">
            <Input
              placeholder="URL de l'image ou upload ci-dessous"
              value={imageUrl.startsWith('blob:') ? 'Image uploadée' : imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setImageBase64('');
              }}
              className="flex-1"
              disabled={imageUrl.startsWith('blob:')}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              title="Uploader une image"
              disabled={uploading}
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>
          {uploading && <p className="text-xs text-gray-400">Compression en cours...</p>}
          {imageUrl && (
            <div className="relative inline-block">
              <img
                src={imageUrl}
                alt="Preview"
                className="h-20 w-20 rounded border border-gray-700 object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setImageUrl('');
                  setImageBase64('');
                }}
                className="absolute -right-2 -top-2 rounded-full bg-red-600 p-0.5 text-white hover:bg-red-700"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Jours de stream</Label>
          <p className="text-xs text-gray-400">
            Sélectionne les jours où tu souhaites streamer.
          </p>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day, i) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(i)}
                className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  selectedDays.includes(i)
                    ? 'border-purple-600 bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'border-gray-700 text-gray-400 hover:border-purple-600'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 space-y-2">
            <Label>Début à</Label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label>Fin à</Label>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {submitting ? '...' : 'Enregistrer'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}