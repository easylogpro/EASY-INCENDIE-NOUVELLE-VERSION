// src/pages/LoginPage.jsx
// Easy Sécurité - Page de connexion SUPABASE

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Flame, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, CheckCircle2
} from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn, resetPassword } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  // Connexion
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signIn(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Erreur connexion:', err);
      
      // Messages d'erreur Supabase traduits
      if (err.message?.includes('Invalid login credentials')) {
        setError('Email ou mot de passe incorrect');
      } else if (err.message?.includes('Email not confirmed')) {
        setError('Veuillez confirmer votre email avant de vous connecter');
      } else if (err.message?.includes('Too many requests')) {
        setError('Trop de tentatives. Réessayez plus tard.');
      } else {
        setError('Erreur de connexion. Vérifiez vos identifiants.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Mot de passe oublié
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!formData.email) {
      setError('Veuillez entrer votre email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await resetPassword(formData.email);
      setSuccess('Email de réinitialisation envoyé ! Vérifiez votre boîte mail.');
      setShowForgotPassword(false);
    } catch (err) {
      console.error('Erreur reset:', err);
      setError('Erreur lors de l\'envoi. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  // Logo animé
  const AnimatedLogo = () => (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="w-12 h-12 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
          <span className="text-white font-black text-xl">E</span>
          <span className="text-white font-black text-xl animate-pulse">S</span>
        </div>
        <div className="absolute -top-2 -right-2">
          <Flame className="w-6 h-6 text-orange-500 animate-bounce" style={{ animationDuration: '1s' }} />
        </div>
      </div>
      <div>
        <span className="text-2xl font-black text-white">Easy</span>
        <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400"> Sécurité</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex">
      {/* Colonne gauche - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 via-transparent to-orange-900/30" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="relative z-10 flex flex-col justify-center px-12">
          <AnimatedLogo />
          
          <h1 className="text-4xl font-bold text-white mt-12 mb-4">
            Bon retour sur <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Easy Sécurité</span>
          </h1>
          
          <p className="text-gray-400 text-lg mb-8">
            Connectez-vous pour accéder à votre espace de gestion.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-300">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span>Rapports SSI, DSF, BAES, Extincteurs</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span>Planning et interventions</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span>Application mobile synchronisée</span>
            </div>
          </div>
        </div>
      </div>

      {/* Colonne droite - Formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden flex justify-center mb-8">
            <AnimatedLogo />
          </div>

          <h2 className="text-3xl font-bold text-white text-center mb-2">
            {showForgotPassword ? 'Mot de passe oublié' : 'Connexion'}
          </h2>
          <p className="text-gray-400 text-center mb-8">
            {showForgotPassword 
              ? 'Entrez votre email pour recevoir un lien de réinitialisation'
              : 'Accédez à votre espace Easy Sécurité'
            }
          </p>

          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Message de succès */}
          {success && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 mb-6 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={showForgotPassword ? handleForgotPassword : handleLogin}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="vous@entreprise.fr"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              {!showForgotPassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mot de passe oublié */}
            {!showForgotPassword && (
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}

            {/* Bouton */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-3 rounded-lg font-bold transition-all shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {showForgotPassword ? 'Envoi...' : 'Connexion...'}
                </>
              ) : showForgotPassword ? (
                'Envoyer le lien'
              ) : (
                'Se connecter'
              )}
            </button>

            {/* Retour connexion */}
            {showForgotPassword && (
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setError('');
                  setSuccess('');
                }}
                className="w-full mt-4 text-gray-400 hover:text-white transition-colors"
              >
                ← Retour à la connexion
              </button>
            )}
          </form>

          {/* Lien inscription */}
          {!showForgotPassword && (
            <p className="text-center text-gray-400 mt-8">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-red-400 hover:text-red-300 font-medium">
                Créer un compte
              </Link>
            </p>
          )}

          {/* Retour accueil */}
          <div className="text-center mt-6">
            <Link to="/" className="text-gray-500 hover:text-gray-300 text-sm">
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
