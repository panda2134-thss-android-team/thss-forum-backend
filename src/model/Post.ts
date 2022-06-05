import {
  ArrayOf,
  ArrayRef,
  Enum,
  ExtendableMongooseDoc,
  OnSchemaCreated,
  Prop,
  Ref,
  toModel,
  TypedSchema
} from '@starrah/mongo-ts-struct'
import mongoose, {ObjectId} from 'mongoose'
import {UserSchema} from './User'
import {getEnumKeys} from './helper'
import {LocationSchema} from './Location'
import {CommentSchema} from './Comment'

export enum PostTypes {
  NORMAL = 'normal',
  AUDIO = 'audio',
  VIDEO = 'video'
}

@TypedSchema()
export class ImageTextContent {
  @Prop({default: ''}) title!: string
  @Prop({required: true}) text!: string
  @ArrayOf(String, {required: true}) images!: string[]
}

@TypedSchema()
export class MediaContent {
  @Prop({default: []}) media!: string[]
  @Prop({required: true}) title: string
}

@TypedSchema({options: {timestamps: true}})
export class PostSchema extends ExtendableMongooseDoc implements OnSchemaCreated {
  @Ref('user', {required: true}) by!: UserSchema | ObjectId
  @Enum(getEnumKeys(PostTypes), {required: true}) type!: PostTypes
  @Prop() location?: LocationSchema
  @Prop() imageTextContent?: ImageTextContent
  @Prop() mediaContent?: MediaContent
  @ArrayRef('comment', {default: []}) comments!: CommentSchema[] | ObjectId[]
  @ArrayRef('user', {default: []}) likedBy!: UserSchema[] | ObjectId[]
  @Prop({default: () => new Date()}) createdAt!: Date
  @Prop({default: '', index: 'text'}) searchText!: string

  onSchemaCreated(schema: mongoose.Schema<mongoose.Document, mongoose.Model<mongoose.Document, any, any>>): void {
    schema.pre('save', function(this: PostSchema) {
      if (this.imageTextContent) {
        this.searchText = (this.imageTextContent.title ?? '') + ' ' + this.imageTextContent.text ?? ''
      } else {
        this.searchText = this.mediaContent?.title ?? ''
      }
    })
  }
}

export const Post = toModel<PostSchema, typeof PostSchema>(PostSchema, 'post')
