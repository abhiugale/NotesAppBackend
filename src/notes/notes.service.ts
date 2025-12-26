import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Note } from './schemas/note.schema';
import { CreateNoteDto } from './dto/create-note.dto';

@Injectable()
export class NotesService {
  constructor(@InjectModel(Note.name) private noteModel: Model<Note>) {}

  create(dto: CreateNoteDto) {
    return this.noteModel.create(dto);
  }

  findAll() {
    return this.noteModel.find().sort({ createdAt: -1 });
  }

  update(id: string, dto: CreateNoteDto) {
    return this.noteModel.findByIdAndUpdate(id, dto, { new: true });
  }

  delete(id: string) {
    return this.noteModel.findByIdAndDelete(id);
  }
}
