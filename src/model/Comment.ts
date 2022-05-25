import {ArrayRef, ExtendableMongooseDoc, Prop, Ref, toModel, TypedSchema} from '@starrah/mongo-ts-struct'
import {ObjectId} from 'mongoose'
import {UserSchema} from './User'

@TypedSchema({options: {timestamps: true}})
export class CommentSchema extends ExtendableMongooseDoc {
  @Ref('user', {required: true}) by!: UserSchema | ObjectId
  @Prop({required: true}) content!: string
  @Ref('comment', {required: false}) parentCommentId?: ObjectId
  @ArrayRef('user', {default: []}) likedBy!: UserSchema[] | ObjectId[]
  @Prop({default: () => new Date()}) createdAt!: Date
}

export const Comment = toModel<CommentSchema, typeof CommentSchema>(CommentSchema, 'comment')
