import {stsResponse} from '../schema/oss'
import {UserSchema} from '../model/User'
import AliCloudPopCore from '@alicloud/pop-core'
import assert from 'assert'

interface OSSServiceParams {
  stsEndpoint: string;
  accessKeyId: string;
  accessKeySecret: string;
  roleARN: string
}

interface STSToken {
  accessKeyId: string;
  accessKeySecret: string;
  securityToken: string;
  expiresAt: Date
}

export class OSSService {
  stsClient: AliCloudPopCore
  roleARN: string
  constructor (params: OSSServiceParams) {
    this.stsClient = new AliCloudPopCore({
      endpoint: params.stsEndpoint,
      accessKeyId: params.accessKeyId,
      accessKeySecret: params.accessKeySecret,
      apiVersion: '2015-04-01'
    })
    this.roleARN = params.roleARN
  }

  async requestSTSToken (user: UserSchema): Promise<STSToken> {
    const result = await this.stsClient.request('AssumeRole', {
      'RoleArn': this.roleARN,
      'RoleSessionName': user.id
    }, {method: 'POST'})
    const parsedResult = stsResponse.parse(result)
    const expiresAt = new Date(parsedResult.Credentials.Expiration)
    assert(! Number.isNaN(+expiresAt))
    return {
      securityToken: parsedResult.Credentials.SecurityToken,
      expiresAt,
      accessKeyId: parsedResult.Credentials.AccessKeyId,
      accessKeySecret: parsedResult.Credentials.AccessKeySecret
    }
  }
}
