import {ArrayRef, ExtendableMongooseDoc, Prop, Ref, toModel, TypedSchema} from '@starrah/mongo-ts-struct'
import {ObjectId} from 'mongoose'
import {UserSchema} from './User'

@TypedSchema({options: {timestamps: true}})
export class CommentSchema extends ExtendableMongooseDoc {
  @Prop({required: true}) content!: string
  @Ref('comment', {required: false}) parentCommentId?: CommentSchema | ObjectId
  @ArrayRef('user', {default: []}) likedBy!: UserSchema[] | ObjectId[]
}

export const Comment = toModel<CommentSchema, typeof CommentSchema>(CommentSchema, 'comment')
