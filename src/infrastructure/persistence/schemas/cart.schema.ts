import {
  Entity,
  ObjectIdColumn,
  ObjectId,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("carts")
export class CartSchema {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ unique: true })
  sessionId: string;

  @Column("json")
  items: {
    sku: string;
    quantity: number;
    unitPrice: number;
  }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
