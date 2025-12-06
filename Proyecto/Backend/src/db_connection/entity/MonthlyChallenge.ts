import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from "typeorm";
import { User } from "./User";

@Entity("MonthlyChallenge")
export class MonthlyChallenge {
    @PrimaryGeneratedColumn({ name: "mon_id" })
    	id!: number;

    @Column({ name: "mon_Distance", type: "decimal", precision: 5, scale: 2 })
    	distance!: number;

    @Column({ name: "mon_StartDate", type: "date" })
    	startDate!: Date;

    @Column({ name: "mon_EndDate", type: "date" })
    	endDate!: Date;

    @ManyToMany(() => User)
    @JoinTable({
    	name: "User_has_MonthlyChallenge",
    	joinColumn: {
    		name: "mon_id",
    		referencedColumnName: "id"
    	},
    	inverseJoinColumn: {
    		name: "user_Email",
    		referencedColumnName: "email"
    	}
    })
    	users!: User[];
}