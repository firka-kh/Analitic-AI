import { useState } from 'react';
import type { Survey, SurveyResponse } from '../types';
import { QuestionType } from '../types';

const initialSurveys: Survey[] = [
  {
    id: 'survey-1',
    title: 'Оценка качества питания в столовой',
    description: 'Пожалуйста, поделитесь вашим мнением о качестве еды, обслуживания и чистоты в нашей столовой.',
    createdAt: new Date('2023-10-26T10:00:00Z').toISOString(),
    questions: [
      { id: 'q1-1', text: 'Как часто вы посещаете столовую?', type: QuestionType.Radio, options: ['Каждый день', '2-3 раза в неделю', 'Раз в неделю', 'Редко'] },
      { id: 'q1-2', text: 'Оцените качество еды по 10-балльной шкале.', type: QuestionType.Scale },
      { id: 'q1-3', text: 'Что вам нравится в столовой? (можно выбрать несколько вариантов)', type: QuestionType.Checkbox, options: ['Разнообразие меню', 'Вкус блюд', 'Скорость обслуживания', 'Чистота', 'Цены'] },
      { id: 'q1-4', text: 'Что можно было бы улучшить? Ваши предложения.', type: QuestionType.Text },
    ],
  },
   {
    id: 'survey-2',
    title: 'Удовлетворенность корпоративным тренингом',
    description: 'Оцените недавно пройденный тренинг по "Эффективным коммуникациям".',
    createdAt: new Date('2023-11-05T14:00:00Z').toISOString(),
    questions: [
      { id: 'q2-1', text: 'Насколько полезным был для вас тренинг?', type: QuestionType.Scale },
      { id: 'q2-2', text: 'Какие темы были наиболее интересными?', type: QuestionType.Checkbox, options: ['Активное слушание', 'Невербальная коммуникация', 'Работа с возражениями', 'Публичные выступления'] },
      { id: 'q2-3', text: 'Что вы думаете о квалификации тренера?', type: QuestionType.Text },
    ],
  },
];

const initialResponses: SurveyResponse[] = [
    {
        id: 'resp-1-1',
        surveyId: 'survey-1',
        submittedAt: new Date().toISOString(),
        answers: {
            'q1-1': 'Каждый день',
            'q1-2': 8,
            'q1-3': ['Разнообразие меню', 'Скорость обслуживания'],
            'q1-4': 'Хотелось бы больше вегетарианских блюд. Иногда супы бывают пересолены. В остальном все отлично, спасибо!',
        },
    },
    {
        id: 'resp-1-2',
        surveyId: 'survey-1',
        submittedAt: new Date().toISOString(),
        answers: {
            'q1-1': '2-3 раза в неделю',
            'q1-2': 6,
            'q1-3': ['Чистота', 'Цены'],
            'q1-4': 'Цены хорошие, но еда часто холодная. Особенно вторые блюда. И кофемашина часто ломается.',
        },
    },
    {
        id: 'resp-1-3',
        surveyId: 'survey-1',
        submittedAt: new Date().toISOString(),
        answers: {
            'q1-1': 'Раз в неделю',
            'q1-2': 7,
            'q1-3': ['Вкус блюд'],
            'q1-4': 'В целом нормально, но выбор салатов очень скудный. Хотелось бы видеть больше свежих овощей.',
        },
    },
     {
        id: 'resp-2-1',
        surveyId: 'survey-2',
        submittedAt: new Date().toISOString(),
        answers: {
            'q2-1': 9,
            'q2-2': ['Активное слущание', 'Работа с возражениями'],
            'q2-3': 'Тренер был очень харизматичным и приводил много примеров из реальной жизни. Отличный специалист.',
        },
    },
    {
        id: 'resp-2-2',
        surveyId: 'survey-2',
        submittedAt: new Date().toISOString(),
        answers: {
            'q2-1': 7,
            'q2-2': ['Публичные выступления'],
            'q2-3': 'Материал был полезный, но подача немного сухая. Не хватило практических заданий и интерактива.',
        },
    },
];

export const useMockData = () => {
    const [surveys, setSurveys] = useState<Survey[]>(initialSurveys);
    const [responses, setResponses] = useState<SurveyResponse[]>(initialResponses);

    const addSurvey = (survey: Omit<Survey, 'id' | 'createdAt'>) => {
        const newSurvey: Survey = {
            ...survey,
            id: `survey-${Date.now()}`,
            createdAt: new Date().toISOString(),
        };
        setSurveys(prev => [...prev, newSurvey]);
    };

    const deleteSurvey = (surveyId: string) => {
        setSurveys(prev => prev.filter(s => s.id !== surveyId));
        setResponses(prev => prev.filter(r => r.surveyId !== surveyId));
    };
    
    return { surveys, responses, addSurvey, deleteSurvey };
};