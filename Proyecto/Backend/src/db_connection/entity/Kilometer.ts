import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { Route } from "./Route";
import { Training } from "./Training";
import { User } from "./User";

@Entity("Kilometer")
export class Kilometer {
    @PrimaryColumn({ name: "km_Counter" })
    	counter!: number;

    @Column({ name: "km_Time", type: "time" })
    	time!: string;

    @PrimaryColumn({ name: "rou_Id" })
    	routeId!: number;

    @PrimaryColumn({ name: "tra_Counter" })
    	trainingCounter!: number;

    @PrimaryColumn({ name: "user_Email", length: 100 })
    	userEmail!: string;

	@ManyToOne(() => Route, route => route.kilometers)
	@JoinColumn({ name: 'rou_Id', referencedColumnName: 'id' })
		route!: Route;

	@ManyToOne(() => Training, training => training.kilometers)
	@JoinColumn({ name: 'tra_Counter', referencedColumnName: 'counter' })
		training!: Training;

	@ManyToOne(() => User)
	@JoinColumn({ name: 'user_Email', referencedColumnName: 'email' })
		user!: User;
}