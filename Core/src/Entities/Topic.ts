import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Subscription } from "./Subscription";
// import crypto from "crypto";

@Entity()
export class Topic extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("varchar", { unique: true, nullable: false })
  name!: string;

  @ManyToOne(() => User, (user) => user.topics)
  owner!: User;

  @OneToMany(() => Subscription, (sub) => sub.topic, {
    eager: true,
    onDelete: "CASCADE",
  })
  subscriptions?: Subscription[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @BeforeInsert()
  async makeTopicUniqueOnInsert() {
    // const randomString = crypto.randomBytes(10).toString("hex");
    this.name = `Angelos-core/topics/${this.owner.email}/${this.name}`;
  }

  @BeforeUpdate()
  async makeTopicUniqueOnUpdate() {
    // const randomString = crypto.randomBytes(10).toString("hex");
    this.name = `Angelos-core/topics/${this.owner.email}/${this.name}`;
  }
}
