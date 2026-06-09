import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class CreateNoteDto {
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Content must be a string' })
  content?: string;

  @IsOptional()
  @IsString({ message: 'Color must be a string' })
  color?: string;

  @IsOptional()
  @IsBoolean({ message: 'Pinned must be a boolean' })
  pinned?: boolean;

  @IsOptional()
  @IsArray({ message: 'Tags must be an array of strings' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];

  @IsOptional()
  @IsBoolean({ message: 'isArchived must be a boolean' })
  isArchived?: boolean;
}
