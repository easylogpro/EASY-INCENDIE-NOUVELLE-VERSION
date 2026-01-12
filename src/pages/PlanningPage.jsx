// src/pages/PlanningPage.jsx
// Easy Sécurité - Planning des interventions

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import { Card, Badge } from '../components/ui';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const PlanningPage = () => {
  const { orgId } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [interventions, setInterventions] = useState([]);
  const [techniciens, setTechniciens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [orgId]);

  const loadData = async () => {
    if (!orgId) return;
    try {
      const [interRes, techRes] = await Promise.all([
        supabase.from('sav').select('*, sites(nom), techniciens(nom, prenom, couleur_planning)').eq('organisation_id', orgId).not('date_prevue', 'is', null),
        supabase.from('techniciens').select('*').eq('organisation_id', orgId).eq('actif', true)
      ]);
      setInterventions(interRes.data || []);
      setTechniciens(techRes.data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysOfWeek = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay() + 1);
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      return day;
    });
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const formatDate = (date) => date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });

  const getInterventionsForDay = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return interventions.filter(i => i.date_prevue === dateStr);
  };

  const days = getDaysOfWeek();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planning</h1>
          <p className="text-gray-500">Semaine du {days[0].toLocaleDateString('fr-FR')} au {days[6].toLocaleDateString('fr-FR')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigateWeek(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-medium">
            Aujourd'hui
          </button>
          <button onClick={() => navigateWeek(1)} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Légende techniciens */}
      <div className="flex flex-wrap gap-2">
        {techniciens.map(tech => (
          <div key={tech.id} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tech.couleur_planning }} />
            <span className="text-sm">{tech.prenom} {tech.nom}</span>
          </div>
        ))}
      </div>

      {/* Grille */}
      <Card padding="none">
        <div className="grid grid-cols-7 border-b">
          {days.map((day, i) => {
            const isToday = day.toDateString() === new Date().toDateString();
            return (
              <div key={i} className={`p-3 text-center border-r last:border-r-0 ${isToday ? 'bg-red-50' : ''}`}>
                <p className={`text-sm font-medium ${isToday ? 'text-red-600' : 'text-gray-500'}`}>{formatDate(day)}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-7 min-h-[400px]">
          {days.map((day, i) => {
            const dayInterventions = getInterventionsForDay(day);
            const isToday = day.toDateString() === new Date().toDateString();
            
            return (
              <div key={i} className={`p-2 border-r last:border-r-0 ${isToday ? 'bg-red-50/50' : ''}`}>
                {dayInterventions.map(inter => (
                  <div
                    key={inter.id}
                    className="mb-2 p-2 rounded-lg text-white text-sm"
                    style={{ backgroundColor: inter.techniciens?.couleur_planning || '#3B82F6' }}
                  >
                    <p className="font-medium truncate">{inter.sites?.nom}</p>
                    <p className="text-xs opacity-80">{inter.domaine?.toUpperCase()}</p>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </Card>

      {interventions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Aucune intervention planifiée</p>
        </div>
      )}
    </div>
  );
};

export default PlanningPage;
