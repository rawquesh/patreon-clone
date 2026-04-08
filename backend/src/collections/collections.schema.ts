import { User } from '@/schemas/users.schema';
import { Post } from '@/schemas/posts.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Collection extends Document {
  createdAt: Date;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop()
  coverImage?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  creator: User;

  @Prop({ default: 0 })
  postCount: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Post' }],
    default: [],
  })
  posts: Post[];
}

export const CollectionSchema = SchemaFactory.createForClass(Collection);

CollectionSchema.index({ creator: 1, title: 1 });
CollectionSchema.index({ title: 'text', description: 'text' });
CollectionSchema.index({ posts: 1 });
