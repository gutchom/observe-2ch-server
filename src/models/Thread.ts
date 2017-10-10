import { AllowNull, BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript'
import Board from './Board'
import Post from './Post'

@Table({
  tableName: 'threads',
  timestamps: true,
  underscored: true,
})
export default class Thread extends Model<Thread> {
  @AllowNull(false)
  @Column
  title: string

  @AllowNull(false)
  @Column
  url: string

  @AllowNull(false)
  @Column(DataType.INTEGER)
  res: number

  @AllowNull(false)
  @Column(DataType.INTEGER)
  position: number

  @ForeignKey(() => Board)
  @AllowNull(false)
  @Column
  board_id: number

  @BelongsTo(() => Board)
  board: Board

  @HasMany(() => Post)
  posts: Post[]
}
