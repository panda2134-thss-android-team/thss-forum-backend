import {ArrayOf, ArrayRef, Enum, ExtendableMongooseDoc, Prop, Ref, toModel, TypedSchema} from '@starrah/mongo-ts-struct'
import {ObjectId} from 'mongoose'
import {UserSchema} from './User'
import {getEnumKeys} from './helper'
import {LocationSchema} from './Location'

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

@TypedSchema()
export class MediaContent {
  @Prop({required: true}) link!: string
}

@TypedSchema({options: {timestamps: true}})
export class PostSchema extends ExtendableMongooseDoc {
  @Ref('user', {required: true}) by!: UserSchema | ObjectId
  @Enum(getEnumKeys(PostTypes), {required: true}) type!: PostTypes
  @Prop() location?: LocationSchema
  @Prop() imageTextContent?: ImageTextContent
  @Prop() mediaContent?: MediaContent
  @ArrayRef('comment', {default: []}) comments!: Comment[] | ObjectId[]
  @ArrayRef('user', {default: []}) likedBy!: UserSchema[] | ObjectId[]
}

export const Post = toModel<PostSchema, typeof PostSchema>(PostSchema, 'post')
