import {ExtendableMongooseDoc, Ref, toModel, TypedSchema} from '@starrah/mongo-ts-struct'
import {ObjectId} from 'mongoose'
import {UserSchema} from './User'

@TypedSchema()
export class FollowingSchema extends ExtendableMongooseDoc {
  @Ref('user', {required: true}) by!: UserSchema | ObjectId
  @Ref('user', {required: true}) followee!: UserSchema | ObjectId
}

export const Following = toModel<FollowingSchema, typeof FollowingSchema>(FollowingSchema, 'following')
