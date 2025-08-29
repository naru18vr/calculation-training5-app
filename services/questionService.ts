
import type { Topic, Question, Difficulty } from '../types';
import { generateG4Question } from './grade4';
import { generateG5Question } from './grade5';
import { generateG6Question } from './grade6';
import { generateM1Question } from './middle1';
import { generateM2Question } from './middle2';
import { generateM3Question } from './middle3';


const generateQuestion = (topic: Topic, index: number, difficulty: Difficulty | null): Question => {
  let q: Omit<Question, 'id'>;
  const topicPrefix = topic.id.substring(0, 2);

  switch (topicPrefix) {
    case 'g4':
      q = generateG4Question(topic, difficulty || '標準');
      break;
    case 'g5':
      q = generateG5Question(topic, difficulty || '標準');
      break;
    case 'g6':
      q = generateG6Question(topic, difficulty || '標準');
      break;
    case 'm1':
      q = generateM1Question(topic, difficulty || '標準');
      break;
    case 'm2':
      q = generateM2Question(topic, difficulty || '標準');
      break;
    case 'm3':
      q = generateM3Question(topic, difficulty || '標準');
      break;
    default:
      q = { text: `「${topic.name}」の問題は準備中です。`, answer: '', explanation: '' };
  }
  
  return { id: index, ...q };
};

export const generateQuestions = (topic: Topic, numQuestions: number, difficulty: Difficulty | null): Question[] => {
  const questions = Array.from({ length: numQuestions }, (_, i) => generateQuestion(topic, i, difficulty));
  
  // Check if the generator returned a "not ready" message
  if (questions.some(q => q.id === undefined && q.text.includes('準備中です'))) {
      return [{ id: -1, text: `「${topic.name}」の問題は準備中です。`, answer: '', explanation: '' }];
  }
  
  return questions;
};