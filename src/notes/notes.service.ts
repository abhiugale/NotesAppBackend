import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Note, NoteDocument } from './schemas/note.schema';
import { CreateNoteDto } from './dto/create-note.dto';
import { GetNotesQueryDto } from './dto/get-notes-query.dto';
import { paginate, PaginationResult } from '../common/utils/pagination.util';
import { CustomLogger } from '../common/logger';

@Injectable()
export class NotesService {
  private readonly logger = new CustomLogger();

  constructor(@InjectModel(Note.name) private noteModel: Model<NoteDocument>) {}

  async create(userId: string, dto: CreateNoteDto): Promise<Note> {
    this.logger.log(`Creating note for user: ${userId}`);
    return this.noteModel.create({
      ...dto,
      userId,
    });
  }

  async findAll(
    userId: string,
    query?: GetNotesQueryDto,
  ): Promise<PaginationResult<Note>> {
    const filter: any = { userId };

    if (query?.isArchived !== undefined) {
      filter.isArchived = query.isArchived === 'true';
    } else {
      filter.isArchived = false; // default to showing active notes
    }

    if (query?.tag) {
      filter.tags = query.tag;
    }

    if (query?.search) {
      const searchRegex = new RegExp(query.search, 'i');
      filter.$or = [
        { title: { $regex: searchRegex } },
        { content: { $regex: searchRegex } },
      ];
    }

    const page = query?.page ? Number(query.page) : 1;
    const limit = query?.limit ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;

    const sortBy = query?.sortBy || 'updatedAt';
    const order = query?.order?.toLowerCase() === 'asc' ? 1 : -1;

    const sortObj: any = {};
    if (sortBy === 'updatedAt') {
      // Always put pinned first when sorting by update time
      sortObj.pinned = -1;
      sortObj.updatedAt = -1;
    } else {
      sortObj[sortBy] = order;
    }

    const total = await this.noteModel.countDocuments(filter).exec();
    const data = await this.noteModel
      .find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .exec();

    this.logger.log(`Fetched ${data.length} notes (total: ${total}) for user: ${userId}`);
    return paginate(data, total, page, limit, 'Notes fetched successfully');
  }

  async update(userId: string, id: string, dto: CreateNoteDto): Promise<Note> {
    this.logger.log(`Updating note: ${id} for user: ${userId}`);
    const updated = await this.noteModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: dto },
      { new: true },
    );
    if (!updated) {
      throw new NotFoundException('Note not found or you do not have permission');
    }
    return updated;
  }

  async delete(userId: string, id: string): Promise<Note> {
    this.logger.log(`Deleting note: ${id} for user: ${userId}`);
    const deleted = await this.noteModel.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      throw new NotFoundException('Note not found or you do not have permission');
    }
    return deleted;
  }

  async findTags(userId: string): Promise<string[]> {
    const notes = await this.noteModel.find({ userId }).select('tags').exec();
    const tagSet = new Set<string>();
    notes.forEach((note) => {
      if (note.tags) {
        note.tags.forEach((tag) => {
          if (tag.trim()) {
            tagSet.add(tag.trim());
          }
        });
      }
    });
    return Array.from(tagSet);
  }
}
