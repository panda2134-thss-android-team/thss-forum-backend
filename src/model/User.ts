import {ArrayRef, ExtendableMongooseDoc, Prop, toModel, TypedSchema} from '@starrah/mongo-ts-struct'
import {Types} from 'mongoose'

@TypedSchema()
export class UserSchema extends ExtendableMongooseDoc {
  @Prop({default: '未设置昵称'}) nickname: string
  @Prop({required: true, unique: true}) email!: string
  @Prop({required: true}) passwordHash!: string
  @Prop({default: 'https://dummyimage.com/128x128/FFFFFF'}) avatar!: string
  @ArrayRef('user', {default: []}) blockedUsers!: UserSchema[] | Types.ObjectId[]
}

export const User = toModel<UserSchema, typeof UserSchema>(UserSchema, 'user')
