import { Entity, Column, PrimaryColumn, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity("WeeklyGoal")
export class WeeklyGoal {
    @PrimaryColumn({ name: "user_Email", length: 100 })
    	userEmail!: string;

    @PrimaryColumn({ name: "wee_StartDate" })
    	startDate!: Date;

    @Column({ name: "wee_TrainingQuantity" })
    	trainingQuantity!: number;

    @Column({ name: "wee_Distance", type: "decimal", precision: 5, scale: 2 })
    	distance!: number;

    @Column({ name: "wee_Completed", type: "tinyint" })
    	completed!: number;

    @ManyToOne(() => User, user => user.weeklyGoals)
    	user!: User;
}