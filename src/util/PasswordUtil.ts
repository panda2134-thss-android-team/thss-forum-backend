import bcrypt from 'bcrypt'
export default {
  hash (password: string) {
    return bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUNDS || '10'))
  }
}
