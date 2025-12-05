import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from "typeorm";
import { User } from "./User";
import { Route } from "./Route";
import { Kilometer } from "./Kilometer";
import { Publication } from "./Publication";

@Entity("Training")
export class Training {
    @PrimaryGeneratedColumn({ name: "counter" })
    	counter!: number;

    @Column({ name: "userEmail", length: 100 })
    	userEmail!: string;

    @Column({ name: "routeId" })
    	routeId!: number;

    @Column({ name: "datetime" })
    	datetime!: Date;

    @Column({ name: "name", length: 100, nullable: true })
    	name?: string;

    @Column({ name: "duration", type: "time" })
    	duration!: string;

    @Column({ name: "rithm", type: "decimal", precision: 4, scale: 2 })
    	rithm!: number;

    @Column({ name: "maxSpeed", type: "decimal", precision: 5, scale: 2 })
    	maxSpeed!: number;

    @Column({ name: "avgSpeed", type: "decimal", precision: 5, scale: 2 })
    	avgSpeed!: number;

    @Column({ name: "calories", type: "decimal", precision: 6, scale: 2 })
    	calories!: number;

    @Column({ name: "elevationGain", type: "decimal", precision: 5, scale: 2 })
    	elevationGain!: number;

    @Column({ name: "image", type: "text", nullable: true })
    	image?: string;

    @Column({ name: "trainingType", length: 10 })
    	trainingType!: 'Running' | 'Cycling';

    @Column({ name: "isGhost", type: "smallint" })
    	isGhost!: number;

    @Column({ name: "avgStride", type: "decimal", precision: 5, scale: 2, nullable: true })
    	avgStride?: number;

    @ManyToOne(() => User, user => user.trainings)
    	user!: User;

    @ManyToOne(() => Route, route => route.trainings)
    	route!: Route;

    @OneToMany(() => Kilometer, kilometer => kilometer.training)
    	kilometers!: Kilometer[];

    @OneToMany(() => Publication, publication => publication.training)
    	publications!: Publication[];
}