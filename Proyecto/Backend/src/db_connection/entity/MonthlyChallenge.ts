import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from "typeorm";
import { User } from "./User";

@Entity("MonthlyChallenge")
export class MonthlyChallenge {
    @PrimaryGeneratedColumn({ name: "id" })
    	id!: number;

    @Column({ name: "distance", type: "decimal", precision: 5, scale: 2 })
    	distance!: number;

    @Column({ name: "startDate", type: "date" })
    	startDate!: Date;

    @Column({ name: "endDate", type: "date" })
    	endDate!: Date;

    @ManyToMany(() => User)
    @JoinTable({
    	name: "User_has_MonthlyChallenge",
    	joinColumn: {
    		name: "monId",
    		referencedColumnName: "id"
    	},
    	inverseJoinColumn: {
    		name: "userEmail",
    		referencedColumnName: "email"
    	}
    })
    	users!: User[];
}