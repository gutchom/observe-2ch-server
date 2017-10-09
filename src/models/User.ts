import { AllowNull, Column, Model, Table } from 'sequelize-typescript'

@Table({
  tableName: 'users',
  timestamps: true,
  underscored: true,
})
export default class User extends Model<User> {
  @AllowNull(false)
  @Column
  uid: string

  @AllowNull(false)
  @Column
  token: string

  @AllowNull(false)
  @Column
  user_name: string

  @AllowNull(false)
  @Column
  display_name: string

  @AllowNull(false)
  @Column
  profile_image_url: string
}
