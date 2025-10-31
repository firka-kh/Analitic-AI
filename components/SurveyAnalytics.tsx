import React, { useState, useEffect, useMemo } from 'react';
import type { Survey, SurveyResponse, AIAnalysisResult, Question, GroundingSource } from '../types';
import { analyzeTextResponses, editReportSummary } from '../services/geminiService';

import Button from './ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from './ui/Card';
import Spinner from './ui/Spinner';
import SentimentPieChart from './charts/SentimentPieChart';
import QuantitativeBarChart from './charts/QuantitativeBarChart';
import TagCloud from './ui/TagCloud';
import Modal from './ui/Modal';

interface SurveyAnalyticsProps {
  survey: Survey;
  responses: SurveyResponse[];
  onBack: () => void;
}

const SurveyAnalytics: React.FC<SurveyAnalyticsProps> = ({ survey, responses, onBack }) => {
    const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editInstruction, setEditInstruction] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [useSearch, setUseSearch] = useState(false);
    const [groundingSources, setGroundingSources] = useState<GroundingSource[]>([]);
    const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

    const textResponses = useMemo(() => 
        responses.flatMap(response => 
            Object.entries(response.answers)
                .filter(([questionId]) => {
                    const question = survey.questions.find(q => q.id === questionId);
                    return question?.type === 'text';
                })
                .map(([, answer]) => answer as string)
        ).filter(answer => answer && answer.trim() !== ''),
        [responses, survey.questions]
    );

    useEffect(() => {
        const performAnalysis = async () => {
            if (textResponses.length > 0) {
                setIsLoading(true);
                setError(null);
                setGroundingSources([]);
                setSelectedTheme(null);
                try {
                    const result = await analyzeTextResponses(textResponses);
                    setAnalysisResult(result);
                } catch (err) {
                    setError((err as Error).message || 'An unknown error occurred during analysis.');
                } finally {
                    setIsLoading(false);
                }
            }
        };

        performAnalysis();
    }, [textResponses]);
    
    const handleTagClick = (theme: string) => {
        setSelectedTheme(prev => (prev === theme ? null : theme));
    };

    const selectedThemeDetails = useMemo(() => {
        if (!selectedTheme || !analysisResult) return null;
        const themeData = analysisResult.keyThemes.find(t => t.theme === selectedTheme);
        const quotesData = analysisResult.quotes.find(q => q.theme === selectedTheme);
        return {
            description: themeData?.description,
            quotes: quotesData?.quotes,
        };
    }, [selectedTheme, analysisResult]);


    const handleEditSummary = async () => {
        if (!editInstruction || !analysisResult) return;
        setIsEditing(true);
        setError(null);
        try {
            const { text: newSummary, sources } = await editReportSummary(
                analysisResult.summary,
                editInstruction,
                textResponses,
                useSearch
            );
            setAnalysisResult(prev => prev ? { ...prev, summary: newSummary } : null);
            setGroundingSources(sources);
            setIsEditModalOpen(false);
            setEditInstruction('');
            setUseSearch(false);
        } catch (err) {
            setError((err as Error).message || 'Failed to edit summary.');
        } finally {
            setIsEditing(false);
        }
    };
    
    const getQuantitativeData = (question: Question) => {
        const counts: Record<string, number> = {};
        
        responses.forEach(response => {
            const answer = response.answers[question.id];
            if (answer === undefined) return;

            if (question.type === 'radio' || question.type === 'scale') {
                const key = String(answer);
                counts[key] = (counts[key] || 0) + 1;
            } else if (question.type === 'checkbox' && Array.isArray(answer)) {
                answer.forEach(option => {
                    counts[option] = (counts[option] || 0) + 1;
                });
            }
        });
        
        const data = Object.entries(counts).map(([name, value]) => ({ name, 'Ответы': value }));
        if (question.type === 'scale') {
            data.sort((a, b) => Number(a.name) - Number(b.name));
        }
        return data;
    };

    const quantitativeQuestions = survey.questions.filter(q => q.type === 'radio' || q.type === 'checkbox' || q.type === 'scale');

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Button variant="ghost" onClick={onBack} className="mb-2">&larr; Назад к опросам</Button>
                    <h1 className="text-3xl font-bold text-secondary-900">{survey.title}</h1>
                    <p className="text-secondary-600 mt-1">{survey.description}</p>
                    <p className="text-sm text-secondary-500 mt-1">{responses.length} ответов</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Ошибка: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            
            {textResponses.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                         <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>AI Сводка</CardTitle>
                                    <Button variant="secondary" onClick={() => setIsEditModalOpen(true)} disabled={isLoading || !analysisResult}>Редактировать</Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? <Spinner label="Анализируем ответы..." /> :
                                 analysisResult ? (
                                    <>
                                        <p className="text-secondary-700 whitespace-pre-wrap">{analysisResult.summary}</p>
                                        {groundingSources.length > 0 && (
                                            <div className="mt-4 pt-4 border-t">
                                                <h4 className="font-semibold text-sm text-secondary-600">Источники (Google Search):</h4>
                                                <ul className="list-disc pl-5 mt-2 text-sm">
                                                    {groundingSources.map(source => (
                                                        <li key={source.uri}>
                                                            <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">{source.title}</a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </>
                                 ) : <p className="text-secondary-500">Нет данных для анализа.</p>}
                            </CardContent>
                        </Card>
                        {selectedTheme && (
                             <Card className="animate-fade-in">
                                 <CardHeader>
                                    <CardTitle>Детали по теме: "{selectedTheme}"</CardTitle>
                                 </CardHeader>
                                 <CardContent>
                                    {selectedThemeDetails?.description && (
                                        <p className="text-secondary-700 mb-4">{selectedThemeDetails.description}</p>
                                    )}
                                    {selectedThemeDetails?.quotes && selectedThemeDetails.quotes.length > 0 ? (
                                        <div className="space-y-2">
                                            <h4 className="font-semibold text-sm text-secondary-600">Примеры цитат:</h4>
                                            {selectedThemeDetails.quotes.map((quote, index) => (
                                                <blockquote key={index} className="border-l-4 border-secondary-200 pl-4 text-secondary-600 italic">
                                                    "{quote}"
                                                </blockquote>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-secondary-500 italic">Цитаты для этой темы не найдены.</p>
                                    )}
                                 </CardContent>
                             </Card>
                         )}
                    </div>
                    <div className="space-y-6">
                        <Card>
                            <CardHeader><CardTitle>Тональность ответов</CardTitle></CardHeader>
                            <CardContent>
                                {isLoading ? <Spinner /> : 
                                 analysisResult ? <SentimentPieChart data={analysisResult.sentiment} /> : <p className="text-secondary-500">Нет данных.</p>}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Ключевые темы</CardTitle></CardHeader>
                            <CardContent>
                                {isLoading ? <Spinner /> : 
                                 analysisResult && analysisResult.keyThemes.length > 0 ? (
                                    <>
                                        <p className="text-sm text-secondary-500 mb-3">Нажмите на тему, чтобы увидеть детали и цитаты.</p>
                                        <TagCloud 
                                            tags={analysisResult.keyThemes.map(t => t.theme)} 
                                            onTagClick={handleTagClick}
                                            activeTag={selectedTheme}
                                        />
                                    </>
                                ) : <p className="text-secondary-500">Темы не найдены.</p>}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {quantitativeQuestions.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold text-secondary-800 mb-4">Количественный анализ</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {quantitativeQuestions.map(q => (
                             <Card key={q.id}>
                                <CardContent>
                                    <QuantitativeBarChart data={getQuantitativeData(q)} dataKey="Ответы" title={q.text} />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
            
            {responses.length === 0 && (
                <Card><CardContent><p className="text-secondary-600 text-center py-8">Для этого опроса еще нет ответов.</p></CardContent></Card>
            )}

             <Modal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                title="Редактировать AI Сводку"
                footer={
                    <>
                        <Button onClick={handleEditSummary} isLoading={isEditing} disabled={!editInstruction}>Применить</Button>
                        <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>Отмена</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-secondary-700">Ваша инструкция для AI</label>
                        <textarea 
                            value={editInstruction} 
                            onChange={e => setEditInstruction(e.target.value)} 
                            rows={4} 
                            className="mt-1 block w-full rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            placeholder="Например: Сделай сводку более формальной и добавь призыв к действию."
                        />
                    </div>
                    <div className="flex items-center">
                        <input
                            id="use-search"
                            type="checkbox"
                            checked={useSearch}
                            onChange={(e) => setUseSearch(e.target.checked)}
                            className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                        />
                        <label htmlFor="use-search" className="ml-2 block text-sm text-secondary-900">
                           Использовать Google Search для обогащения ответа
                        </html >
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SurveyAnalytics;