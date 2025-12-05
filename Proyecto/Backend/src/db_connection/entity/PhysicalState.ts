import { Entity, Column, PrimaryColumn, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity("PhysicalState")
export class PhysicalState {
    @PrimaryColumn({ name: "userEmail", length: 100 })
    	userEmail!: string;

    @PrimaryColumn({ name: "date" })
    	date!: Date;

    @Column({ name: "height", type: "decimal", precision: 3, scale: 2 })
    	height!: number;

    @Column({ name: "weight", type: "decimal", precision: 5, scale: 2 })
    	weight!: number;

    @ManyToOne(() => User, user => user.physicalStates)
    	user!: User;
}