import React, { useState } from 'react';
import type { Survey, Question } from '../types';
import Button from './ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from './ui/Card';
import SurveyCreator from './SurveyCreator';
import Modal from './ui/Modal';

interface DashboardProps {
  surveys: Survey[];
  onSelectSurvey: (surveyId: string) => void;
  onAddSurvey: (title: string, description: string, questions: Question[]) => void;
  onDeleteSurvey: (surveyId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ surveys, onSelectSurvey, onAddSurvey, onDeleteSurvey }) => {
    const [isCreatorOpen, setIsCreatorOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [surveyToDeleteId, setSurveyToDeleteId] = useState<string | null>(null);

    const openDeleteModal = (surveyId: string) => {
        setSurveyToDeleteId(surveyId);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setSurveyToDeleteId(null);
        setIsDeleteModalOpen(false);
    };

    const handleDeleteConfirm = () => {
        if (surveyToDeleteId) {
            onDeleteSurvey(surveyToDeleteId);
        }
        closeDeleteModal();
    };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-secondary-900">Панель опросов</h1>
        <Button onClick={() => setIsCreatorOpen(true)}>+ Создать опрос</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {surveys.length > 0 ? surveys.map(survey => (
          <Card key={survey.id}>
            <CardHeader>
              <CardTitle>{survey.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-secondary-600 text-sm h-16 overflow-hidden text-ellipsis">{survey.description}</p>
              <div className="mt-4 pt-4 border-t border-secondary-200 flex justify-between items-center">
                 <div className="text-xs text-secondary-500">
                    <p>{survey.questions.length} вопросов</p>
                    <p>Создан: {new Date(survey.createdAt).toLocaleDateString()}</p>
                 </div>
                 <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={() => onSelectSurvey(survey.id)}>Аналитика</Button>
                    <Button variant="ghost" className="text-red-600 hover:bg-red-100 px-2" onClick={() => openDeleteModal(survey.id)} aria-label="Удалить опрос">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm2 3a1 1 0 00-1 1v2a1 1 0 102 0v-2a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )) : (
            <div className="col-span-full text-center py-12">
                <h3 className="text-xl font-semibold text-secondary-700">Опросов пока нет</h3>
                <p className="text-secondary-500 mt-2">Начните с создания нового опроса, чтобы собрать мнения.</p>
                <Button className="mt-4" onClick={() => setIsCreatorOpen(true)}>Создать первый опрос</Button>
            </div>
        )}
      </div>

      <SurveyCreator 
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
        onSave={onAddSurvey}
      />

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        title="Подтвердите удаление"
        footer={
            <>
                <Button onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">Удалить</Button>
                <Button variant="secondary" onClick={closeDeleteModal}>Отмена</Button>
            </>
        }
      >
        <p>Вы уверены, что хотите удалить этот опрос? Все связанные с ним ответы также будут удалены. Это действие необратимо.</p>
      </Modal>
    </div>
  );
};

export default Dashboard;