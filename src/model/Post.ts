import {ArrayOf, ArrayRef, Enum, ExtendableMongooseDoc, Prop, Ref, toModel, TypedSchema} from '@starrah/mongo-ts-struct'
import {ObjectId} from 'mongoose'
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
  @Prop({required: true}) text!: string
  @ArrayOf(String, {required: true}) images!: string[]
}

@TypedSchema({options: {timestamps: true}})
export class PostSchema extends ExtendableMongooseDoc {
  @Ref('user', {required: true}) by!: UserSchema | ObjectId
  @Enum(getEnumKeys(PostTypes), {required: true}) type!: PostTypes
  @Prop() location?: LocationSchema
  @Prop() imageTextContent?: ImageTextContent
  @ArrayOf('string') mediaContent?: string[]
  @ArrayRef('comment', {default: []}) comments!: CommentSchema[] | ObjectId[]
  @ArrayRef('user', {default: []}) likedBy!: UserSchema[] | ObjectId[]
  @Prop({default: () => new Date()}) createdAt!: Date
}

export const Post = toModel<PostSchema, typeof PostSchema>(PostSchema, 'post')
