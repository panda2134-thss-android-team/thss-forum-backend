import {Prop, TypedSchema} from '@starrah/mongo-ts-struct'

@TypedSchema()
export class LocationSchema {
  /**
   * 地理位置的人类可读描述
   */
  @Prop() description!: string

  /**
   * 经度，-180~180
   */
  @Prop() lon!: number

  /**
   * 纬度，-90~90
   */
  @Prop() lat!: number
}
