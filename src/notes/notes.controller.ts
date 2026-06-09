import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { GetNotesQueryDto } from './dto/get-notes-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private service: NotesService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateNoteDto) {
    return this.service.create(req.user.userId, dto);
  }

  @Get()
  findAll(
    @Request() req,
    @Query() query: GetNotesQueryDto,
  ) {
    return this.service.findAll(req.user.userId, query);
  }

  @Get('tags')
  findTags(@Request() req) {
    return this.service.findTags(req.user.userId);
  }

  @Put(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: CreateNoteDto,
  ) {
    return this.service.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  delete(@Request() req, @Param('id') id: string) {
    return this.service.delete(req.user.userId, id);
  }
}
