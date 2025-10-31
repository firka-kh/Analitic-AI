
import React, { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import type { Question } from '../types';
import { QuestionType } from '../types';
import { suggestQuestions } from '../services/geminiService';

interface SurveyCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, description: string, questions: Question[]) => void;
}

const QuestionTypeLabels: Record<QuestionType, string> = {
    [QuestionType.Radio]: "Один вариант",
    [QuestionType.Checkbox]: "Несколько вариантов",
    [QuestionType.Scale]: "Шкала (1-10)",
    [QuestionType.Text]: "Открытый ответ",
};

const SurveyCreator: React.FC<SurveyCreatorProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [aiTopic, setAiTopic] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAddQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      text: '',
      type,
      options: type === QuestionType.Radio || type === QuestionType.Checkbox ? [''] : undefined,
    };
    setQuestions([...questions, newQuestion]);
  };
  
  const handleQuestionChange = (index: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[index].text = text;
    setQuestions(newQuestions);
  };
  
  const handleOptionChange = (qIndex: number, oIndex: number, text: string) => {
    const newQuestions = [...questions];
    if (newQuestions[qIndex].options) {
        newQuestions[qIndex].options[oIndex] = text;
        setQuestions(newQuestions);
    }
  };

  const handleAddOption = (qIndex: number) => {
    const newQuestions = [...questions];
    if (newQuestions[qIndex].options) {
        newQuestions[qIndex].options.push('');
        setQuestions(newQuestions);
    }
  };
  
  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };
  
  const handleRemoveOption = (qIndex: number, oIndex: number) => {
      const newQuestions = [...questions];
      if (newQuestions[qIndex].options) {
        newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== oIndex);
        setQuestions(newQuestions);
      }
  };

  const handleGenerateQuestions = async () => {
    if (!aiTopic) return;
    setIsAiLoading(true);
    try {
        const suggested = await suggestQuestions(aiTopic);
        const newQuestions = suggested.map(q => ({...q, id: `q-${Date.now()}-${Math.random()}`}));
        setQuestions(prev => [...prev, ...newQuestions]);
    } catch (error) {
        alert((error as Error).message);
    } finally {
        setIsAiLoading(false);
    }
  };
  
  const handleSave = () => {
    onSave(title, description, questions);
    setTitle('');
    setDescription('');
    setQuestions([]);
    setAiTopic('');
    onClose();
  };

  return (
    <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title="Создание нового опроса"
        footer={
            <>
                <Button onClick={handleSave} disabled={!title || questions.length === 0}>Сохранить опрос</Button>
                <Button variant="secondary" onClick={onClose}>Отмена</Button>
            </>
        }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700">Название опроса</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700">Описание</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"></textarea>
        </div>
        
        <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
            <h4 className="font-semibold text-primary-800">✨ Помощник по вопросам (AI)</h4>
            <p className="text-sm text-primary-700 mt-1">Опишите тему, и AI предложит релевантные вопросы.</p>
            <div className="flex gap-2 mt-3">
                <input type="text" value={aiTopic} onChange={e => setAiTopic(e.target.value)} placeholder="Например: Удовлетворенность столовой" className="flex-grow block w-full rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"/>
                <Button onClick={handleGenerateQuestions} isLoading={isAiLoading} disabled={!aiTopic}>Сгенерировать</Button>
            </div>
        </div>

        <div>
            <h4 className="font-semibold text-secondary-800 mb-2">Вопросы</h4>
            {questions.map((q, qIndex) => (
                <div key={q.id} className="p-4 border rounded-md mb-4 bg-secondary-50">
                    <div className="flex justify-between items-start">
                        <div className="flex-grow">
                             <label className="block text-sm font-medium text-secondary-700">Вопрос {qIndex + 1} ({QuestionTypeLabels[q.type]})</label>
                            <input type="text" value={q.text} onChange={e => handleQuestionChange(qIndex, e.target.value)} className="mt-1 block w-full rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                        </div>
                        <Button variant="ghost" onClick={() => handleRemoveQuestion(qIndex)} className="ml-2 text-red-500 hover:bg-red-100">&times;</Button>
                    </div>
                    {(q.type === QuestionType.Radio || q.type === QuestionType.Checkbox) && q.options && (
                        <div className="mt-2 pl-4">
                            {q.options.map((opt, oIndex) => (
                                <div key={oIndex} className="flex items-center gap-2 mb-1">
                                    <input type="text" value={opt} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} className="flex-grow block w-full rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                                    <Button variant="ghost" onClick={() => handleRemoveOption(qIndex, oIndex)} className="text-red-500 hover:bg-red-100">&times;</Button>
                                </div>
                            ))}
                            <Button variant="secondary" onClick={() => handleAddOption(qIndex)} className="mt-2 text-xs">+ Добавить вариант</Button>
                        </div>
                    )}
                </div>
            ))}
            <div className="flex gap-2 mt-4">
                <Button variant="secondary" onClick={() => handleAddQuestion(QuestionType.Radio)}>+ Один вариант</Button>
                <Button variant="secondary" onClick={() => handleAddQuestion(QuestionType.Checkbox)}>+ Несколько</Button>
                <Button variant="secondary" onClick={() => handleAddQuestion(QuestionType.Scale)}>+ Шкала</Button>
                <Button variant="secondary" onClick={() => handleAddQuestion(QuestionType.Text)}>+ Текст</Button>
            </div>
        </div>
      </div>
    </Modal>
  );
};

export default SurveyCreator;
