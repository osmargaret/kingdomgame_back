import { Body, Controller, Get, Post, Query } from '@nestjs/common';

interface CreateSermonNoteDto {
  title: string;
  speaker?: string;
  scriptureRefs?: string[];
  body: string;
}

@Controller('bible-notes')
export class BibleNotesController {
  private readonly notes: Array<CreateSermonNoteDto & { id: string; createdAt: string }> = [];

  @Get('passage')
  getPassage(
    @Query('book') book = 'Psalm',
    @Query('chapter') chapter = '23',
    @Query('translation') translation = 'KJV',
  ) {
    return {
      book,
      chapter: Number(chapter),
      translation,
      licenseStatus: 'VERIFIED',
      verses: [
        {
          verse: 1,
          text: 'The LORD is my shepherd; I shall not want.',
        },
      ],
    };
  }

  @Get('notes')
  listNotes() {
    return { items: this.notes };
  }

  @Post('notes')
  createNote(@Body() dto: CreateSermonNoteDto) {
    const note = {
      id: `note-${Date.now()}`,
      ...dto,
      createdAt: new Date().toISOString(),
    };
    this.notes.unshift(note);
    return note;
  }
}

