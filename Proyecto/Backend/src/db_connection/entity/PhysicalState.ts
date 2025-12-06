import { Entity, Column, PrimaryColumn, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity("PhysicalState")
export class PhysicalState {
    @PrimaryColumn({ name: "user_Email", length: 100 })
    	userEmail!: string;

    @PrimaryColumn({ name: "phy_Date" })
    	date!: Date;

    @Column({ name: "phy_Height", type: "decimal", precision: 3, scale: 2 })
    	height!: number;

    @Column({ name: "phy_Weight", type: "decimal", precision: 5, scale: 2 })
    	weight!: number;

    @ManyToOne(() => User, user => user.physicalStates)
    	user!: User;
}