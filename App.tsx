import React, { useState } from 'react';
import { useMockData } from './hooks/useMockData';
import type { Question } from './types';
import Dashboard from './components/Dashboard';
import SurveyAnalytics from './components/SurveyAnalytics';

const App: React.FC = () => {
  const { surveys, responses, addSurvey, deleteSurvey } = useMockData();
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);

  const handleAddSurvey = (title: string, description: string, questions: Question[]) => {
    addSurvey({ title, description, questions });
  };

  const selectedSurvey = surveys.find(s => s.id === selectedSurveyId);
  const selectedSurveyResponses = responses.filter(r => r.surveyId === selectedSurveyId);

  return (
    <div className="min-h-screen bg-secondary-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-primary-700">AI-Аналитик</h1>
        </div>
      </header>
      <main>
        {selectedSurvey ? (
          <SurveyAnalytics 
            survey={selectedSurvey}
            responses={selectedSurveyResponses}
            onBack={() => setSelectedSurveyId(null)}
          />
        ) : (
          <Dashboard 
            surveys={surveys}
            onSelectSurvey={setSelectedSurveyId}
            onAddSurvey={handleAddSurvey}
            onDeleteSurvey={deleteSurvey}
          />
        )}
      </main>
    </div>
  );
};

export default App;