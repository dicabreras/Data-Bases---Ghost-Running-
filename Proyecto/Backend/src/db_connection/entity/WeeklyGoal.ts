import { Entity, Column, PrimaryColumn, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity("WeeklyGoal")
export class WeeklyGoal {
    @PrimaryColumn({ name: "userEmail", length: 100 })
    	userEmail!: string;

    @PrimaryColumn({ name: "startDate" })
    	startDate!: Date;

    @Column({ name: "trainingQuantity" })
    	trainingQuantity!: number;

    @Column({ name: "distance", type: "decimal", precision: 5, scale: 2 })
    	distance!: number;

    @Column({ name: "completed", type: "smallint" })
    	completed!: number;

    @ManyToOne(() => User, user => user.weeklyGoals)
    	user!: User;
}