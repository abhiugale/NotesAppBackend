import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Note extends Document {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  content: string;

  @Prop({ default: false })
  pinned: boolean;

  @Prop({ default: '#ffffff' })
  color: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: false })
  isArchived: boolean;
}

export const NoteSchema = SchemaFactory.createForClass(Note);
