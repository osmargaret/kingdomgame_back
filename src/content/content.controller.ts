import { Controller, Get } from '@nestjs/common';
import { ContentService } from './content.service.js';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('preview')
  getPreviewCatalog() {
    return {
      policy: 'STRICT_SCRIPTURE_FIDELITY',
      items: this.contentService.getSampleCatalog(),
    };
  }
}

