import { AllowNull, Column, HasMany, Model, Table } from 'sequelize-typescript'
import Thread from './Thread'

@Table({
  tableName: 'boards',
  timestamps: true,
  underscored: true,
})
export default class Board extends Model<Board> {
  @AllowNull(false)
  @Column
  name: string

  @AllowNull(false)
  @Column
  url: string

  @HasMany(() => Thread)
  threads: Thread[]
}
