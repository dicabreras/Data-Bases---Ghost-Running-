import { Entity, Column, PrimaryColumn, ManyToOne } from "typeorm";
import { Route } from "./Route";
import { Training } from "./Training";
import { User } from "./User";

@Entity("Kilometer")
export class Kilometer {
    @PrimaryColumn({ name: "counter" })
    	counter!: number;

    @Column({ name: "time", type: "time" })
    	time!: string;

    @PrimaryColumn({ name: "routeId" })
    	routeId!: number;

    @PrimaryColumn({ name: "trainingCounter" })
    	trainingCounter!: number;

    @PrimaryColumn({ name: "userEmail", length: 100 })
    	userEmail!: string;

    @ManyToOne(() => Route, route => route.kilometers)
    	route!: Route;

    @ManyToOne(() => Training, training => training.kilometers)
    	training!: Training;

    @ManyToOne(() => User)
    	user!: User;
}