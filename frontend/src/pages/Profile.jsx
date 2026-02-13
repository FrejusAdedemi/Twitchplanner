import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { userAPI } from '../api/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { useToast } from '../hooks/useToast';
import { ArrowLeft } from 'lucide-react';

export default function Profile() {
  const { user, loading, updateUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    display_name: '',
    email: '',
    password: '',
    twitch_url: '',
    logo_url: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      setFormData({
        display_name: user.display_name || '',
        email: user.email || '',
        password: '',
        twitch_url: user.twitch_url || '',
        logo_url: user.logo_url || '',
      });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const dataToSend = {};
      
      if (formData.display_name !== user.display_name) {
        dataToSend.display_name = formData.display_name;
      }
      if (formData.email !== user.email) {
        dataToSend.email = formData.email;
      }
      if (formData.password) {
        dataToSend.password = formData.password;
      }
      if (formData.twitch_url !== user.twitch_url) {
        dataToSend.twitch_url = formData.twitch_url;
      }
      if (formData.logo_url !== user.logo_url) {
        dataToSend.logo_url = formData.logo_url;
      }

      if (Object.keys(dataToSend).length === 0) {
        toast({ title: 'Info', description: 'Aucune modification à sauvegarder' });
        setSubmitting(false);
        return;
      }

      const response = await userAPI.updateProfile(dataToSend);
      
      // ✅ CORRECTION : Mettre à jour le contexte utilisateur
      if (response.user) {
        updateUser(response.user);
      }

      toast({ title: 'Succès', description: 'Profil mis à jour avec succès' });
      
      // ✅ CORRECTION : Rediriger vers /plannings après sauvegarde
      setTimeout(() => {
        navigate('/plannings');
      }, 500);
      
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.error || 'Une erreur est survenue',
        variant: 'destructive',
      });
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-10">
        <Button
          variant="ghost"
          onClick={() => navigate('/plannings')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux plannings
        </Button>

        <div className="mx-auto max-w-2xl">
          <h1 className="mb-8 text-3xl font-bold text-white">Mon profil</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="display_name">Pseudo / Nom d'affichage</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) =>
                      setFormData({ ...formData, display_name: e.target.value })
                    }
                    placeholder="Ton pseudo"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="password">Nouveau mot de passe (optionnel)</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Laisser vide pour ne pas changer"
                  />
                </div>

                <div>
                  <Label htmlFor="twitch_url">URL de la chaîne Twitch</Label>
                  <Input
                    id="twitch_url"
                    value={formData.twitch_url}
                    onChange={(e) =>
                      setFormData({ ...formData, twitch_url: e.target.value })
                    }
                    placeholder="https://twitch.tv/tonpseudo"
                  />
                </div>

                <div>
                  <Label htmlFor="logo_url">Logo (URL)</Label>
                  <Input
                    id="logo_url"
                    value={formData.logo_url}
                    onChange={(e) =>
                      setFormData({ ...formData, logo_url: e.target.value })
                    }
                    placeholder="URL de votre logo"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="mt-6 w-full bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {submitting ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}