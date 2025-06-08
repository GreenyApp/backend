import { User } from 'src/user/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  user: User;

  @Column('float', { nullable: true })
  waterLevel: number;

  @Column('float', { nullable: true })
  soilMoisture: number;

  @Column('float', { nullable: true })
  airHumidity: number;

  @Column('float', { nullable: true })
  lightLevel: number;

  @Column('float', { nullable: true })
  airQuality: number;

  @Column('float', { nullable: true })
  temperature: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
