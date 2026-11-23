import { Injectable } from '@nestjs/common';

export type EpistemologyTier =
  | 'TIER_1_CORE_FACT'
  | 'TIER_2_HISTORICAL_CONTEXT'
  | 'TIER_3_INTERPRETIVE_DOCTRINAL';

export interface QuestionPreview {
  id: string;
  category: string;
  epistemologyTier: EpistemologyTier;
  questionText: string;
  bibleBook: string;
  chapter: number;
  verse: string;
  bibleTranslation: string;
  editorialStatus: 'PUBLISHED';
  correctAnswer?: string;
  distractors?: string[];
  perspectives?: Array<{ tradition: string; summary: string }>;
  explanation: string;
}

@Injectable()
export class ContentService {
  private readonly sampleQuestions: QuestionPreview[] = [
    {
      id: 'q-fact-001',
      category: 'OLD_TESTAMENT',
      epistemologyTier: 'TIER_1_CORE_FACT',
      questionText:
        'Which prophet confronted King David with a parable about a rich man taking a poor man’s only lamb?',
      correctAnswer: 'Nathan',
      distractors: ['Elijah', 'Samuel', 'Isaiah'],
      bibleBook: '2 Samuel',
      chapter: 12,
      verse: '1-7',
      bibleTranslation: 'KJV',
      editorialStatus: 'PUBLISHED',
      explanation:
        'In 2 Samuel 12:1-7, the prophet Nathan told King David the parable of the rich man and the ewe lamb to reveal David’s sin.',
    },
    {
      id: 'q-interp-001',
      category: 'BIBLICAL_WISDOM',
      epistemologyTier: 'TIER_3_INTERPRETIVE_DOCTRINAL',
      questionText: 'Why did Joseph test his brothers before revealing his identity in Egypt?',
      bibleBook: 'Genesis',
      chapter: 42,
      verse: '9-24',
      bibleTranslation: 'KJV',
      editorialStatus: 'PUBLISHED',
      perspectives: [
        {
          tradition: 'Repentance & Transformation View',
          summary:
            'Many commentators suggest Joseph tested whether his brothers had genuinely repented and would protect Benjamin unlike how they treated him.',
        },
        {
          tradition: 'Prudence & Family Safety View',
          summary:
            'Other scholars emphasize Joseph’s need to verify his father Jacob’s and Benjamin’s well-being before bringing the whole family to Egypt.',
        },
      ],
      explanation:
        'Genesis 42–44 records Joseph’s tests without stating a single explicit motive; Christian traditions highlight both testing their character and ensuring family safety.',
    },
  ];

  getSampleCatalog(): QuestionPreview[] {
    return this.sampleQuestions;
  }
}

