import { AllowNull, BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript'
import Thread from './Thread'

@Table({
  tableName: 'posts',
  timestamps: true,
  underscored: true,
})
export default class Post extends Model<Post> {
  @AllowNull(false)
  @Column(DataType.INTEGER)
  number: number

  @AllowNull(false)
  @Column
  name: string

  @AllowNull(false)
  @Column
  uid: string

  @AllowNull(false)
  @Column
  url: string

  @AllowNull(false)
  @Column(DataType.DATE)
  timestamp: Date

  @AllowNull(false)
  @Column(DataType.TEXT)
  message: string

  @ForeignKey(() => Thread)
  @AllowNull(false)
  @Column
  thread_id: number

  @BelongsTo(() => Thread)
  thread: Thread
}
