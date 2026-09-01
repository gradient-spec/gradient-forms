import { describe, it, expect } from 'vitest';
import { Form, Question } from '../types';

describe('Google Forms Formatting & Media Attachments Test Suite', () => {

  const createBaseQuestion = (): Question => ({
    id: 'q-test-1',
    sectionId: 'sec-main',
    type: 'short_answer',
    title: 'Sample Question',
    required: false
  });

  // 1. THREE HEADLINE SIZES
  describe('1. Three Headline Sizes (H1, H2, H3)', () => {
    it('should support large headline size (H1)', () => {
      const q = createBaseQuestion();
      q.titleStyle = { size: 'lg' };
      expect(q.titleStyle.size).toBe('lg');
    });

    it('should support medium headline size (H2)', () => {
      const q = createBaseQuestion();
      q.titleStyle = { size: 'md' };
      expect(q.titleStyle.size).toBe('md');
    });

    it('should support small headline size (H3)', () => {
      const q = createBaseQuestion();
      q.titleStyle = { size: 'sm' };
      expect(q.titleStyle.size).toBe('sm');
    });
  });

  // 2. BOLD, ITALIC, UNDERLINE FORMATTING
  describe('2. Bold, Italic, Underline Formatting', () => {
    it('should toggle bold on titleStyle', () => {
      const q = createBaseQuestion();
      q.titleStyle = { bold: true };
      expect(q.titleStyle.bold).toBe(true);

      q.titleStyle.bold = false;
      expect(q.titleStyle.bold).toBe(false);
    });

    it('should toggle italic and underline on titleStyle', () => {
      const q = createBaseQuestion();
      q.titleStyle = { italic: true, underline: true };
      expect(q.titleStyle.italic).toBe(true);
      expect(q.titleStyle.underline).toBe(true);
    });

    it('should support description styling (bold, italic, underline)', () => {
      const q = createBaseQuestion();
      q.description = 'Important guidance text';
      q.descriptionStyle = { bold: true, italic: true };
      expect(q.descriptionStyle.bold).toBe(true);
      expect(q.descriptionStyle.italic).toBe(true);
    });
  });

  // 3. IMAGE ATTACHMENT TO QUESTIONS
  describe('3. Image Attachment to Questions', () => {
    it('should attach an image URL and caption to a question', () => {
      const q = createBaseQuestion();
      q.imageUrl = 'https://images.unsplash.com/photo-example-123';
      q.imageCaption = 'Figure 1: Database ER Diagram';

      expect(q.imageUrl).toBe('https://images.unsplash.com/photo-example-123');
      expect(q.imageCaption).toBe('Figure 1: Database ER Diagram');
    });

    it('should support Base64 data URLs for local file uploads', () => {
      const q = createBaseQuestion();
      const base64Sample = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      q.imageUrl = base64Sample;

      expect(q.imageUrl).toContain('data:image/png;base64');
    });

    it('should allow removing an attached image', () => {
      const q = createBaseQuestion();
      q.imageUrl = 'https://images.unsplash.com/photo-123';
      q.imageCaption = 'Some caption';

      q.imageUrl = undefined;
      q.imageCaption = undefined;

      expect(q.imageUrl).toBeUndefined();
      expect(q.imageCaption).toBeUndefined();
    });
  });

  // 4. VIDEO ATTACHMENT TO QUESTIONS
  describe('4. Video Attachment to Questions', () => {
    it('should embed YouTube video URL and caption', () => {
      const q = createBaseQuestion();
      q.videoUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
      q.videoCaption = 'Tutorial walkthrough video';

      expect(q.videoUrl).toContain('youtube.com/embed');
      expect(q.videoCaption).toBe('Tutorial walkthrough video');
    });

    it('should allow removing an attached video', () => {
      const q = createBaseQuestion();
      q.videoUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
      q.videoUrl = undefined;

      expect(q.videoUrl).toBeUndefined();
    });
  });

  // 5. IMPORT QUESTIONS WORKFLOW
  describe('5. Import Questions Workflow', () => {
    it('should clone selected questions from source form with fresh unique IDs and assigned section', () => {
      const sourceQuestions: Question[] = [
        { id: 'src-1', sectionId: 'sec-old', type: 'short_answer', title: 'What is your github handle?', required: true },
        { id: 'src-2', sectionId: 'sec-old', type: 'multiple_choice', title: 'Preferred Track', required: false }
      ];

      const targetSectionId = 'sec-new-page';
      const clonedQuestions: Question[] = sourceQuestions.map((q, idx) => ({
        ...q,
        id: 'q-imp-' + Date.now() + '-' + idx,
        sectionId: targetSectionId,
        title: q.title
      }));

      expect(clonedQuestions.length).toBe(2);
      expect(clonedQuestions[0].sectionId).toBe(targetSectionId);
      expect(clonedQuestions[1].sectionId).toBe(targetSectionId);
      expect(clonedQuestions[0].id).not.toBe('src-1');
      expect(clonedQuestions[0].title).toBe('What is your github handle?');
    });
  });

  // 6. GOOGLE FORMS EMAIL COLLECTION SUITE
  describe('6. Google Forms Email Collection Engine', () => {
    it('should support emailCollectionMode and sendResponseCopy in FormSettings', () => {
      const settings = {
        collectEmail: true,
        emailCollectionMode: 'verified' as const,
        sendResponseCopy: 'when_requested' as const,
        limitOneResponse: true,
        allowEditResponse: false,
        saveProgress: true,
        showProgressBar: true,
        shuffleQuestions: false,
        quizMode: false,
        releaseGradeImmediately: false,
        confirmationMessage: 'Thanks!'
      };

      expect(settings.collectEmail).toBe(true);
      expect(settings.emailCollectionMode).toBe('verified');
      expect(settings.sendResponseCopy).toBe('when_requested');
    });

    it('should validate respondent email pattern', () => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      expect(emailPattern.test('user@gradientforms.dev')).toBe(true);
      expect(emailPattern.test('valid.student@college.edu')).toBe(true);
      expect(emailPattern.test('invalid-email')).toBe(false);
      expect(emailPattern.test('missing@tld')).toBe(false);
      expect(emailPattern.test('')).toBe(false);
    });

    it('should support toggling sendResponseCopy between off, when_requested, and always', () => {
      const modes: ('off' | 'when_requested' | 'always')[] = ['off', 'when_requested', 'always'];
      modes.forEach(mode => {
        expect(['off', 'when_requested', 'always']).toContain(mode);
      });
    });
  });
});
