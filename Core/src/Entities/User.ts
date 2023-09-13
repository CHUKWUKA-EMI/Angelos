import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Topic } from "./Topic";
import { IsEmail, IsStrongPassword } from "class-validator";
import bcrypt from "bcrypt";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("varchar")
  firstName!: string;

  @Column("varchar")
  lastName!: string;

  @Column({ unique: true })
  @IsEmail({}, { message: "Invaliad email address provided" })
  email!: string;

  @Column()
  @IsStrongPassword(
    { minLength: 6, minSymbols: 1 },
    {
      message:
        "Password must have a minimum of six characters and at least one special character",
    }
  )
  password!: string;

  @OneToMany(() => Topic, (topic) => topic.owner, {
    eager: true,
    onDelete: "CASCADE",
  })
  topics!: Topic[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @BeforeInsert()
  async hashPassword() {
    const salt = await bcrypt.genSalt(11);
    this.password = await bcrypt.hash(this.password, salt);
  }
}
