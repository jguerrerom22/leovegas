import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 200 })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'USER', length: 5 })
  role: string;

  @Column({ nullable: true })
  accessToken: string;
}
