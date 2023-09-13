import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Topic } from "./Topic";
import { IsNumber, IsUrl } from "class-validator";
// import crypto from "crypto";

@Entity()
export class Subscription extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("varchar", { nullable: false, unique: true })
  name!: string;

  @Column("varchar", { nullable: false })
  @IsUrl({}, { message: "Invalid url provided" })
  endpointUrl!: string;

  @Column("varchar")
  publisherAppId!: string;

  @Column("int", { default: 10 })
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: "Invalid number provided for retention duration" }
  )
  messageRetentionDuration!: number;

  @ManyToOne(() => Topic, (topic) => topic.subscriptions)
  topic!: Topic;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @BeforeInsert()
  setName() {
    // const randomString = crypto.randomBytes(10).toString("hex");
    this.name = `Angelos-core/subscriptions/${this.topic.owner.email}/${this.name}`;
  }

  @BeforeUpdate()
  updateName() {
    // const randomString = crypto.randomBytes(10).toString("hex");
    this.name = `Angelos-core/subscriptions/${this.topic.owner.email}/${this.name}`;
  }
}
