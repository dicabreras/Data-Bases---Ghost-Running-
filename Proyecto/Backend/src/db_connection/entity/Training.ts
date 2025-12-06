import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from "typeorm";
import { User } from "./User";
import { Route } from "./Route";
import { Kilometer } from "./Kilometer";
import { Publication } from "./Publication";

@Entity("Training")
export class Training {
	@PrimaryGeneratedColumn({ name: "tra_Counter" })
    	counter!: number;

	@Column({ name: "user_Email", length: 100 })
    	userEmail!: string;

	@Column({ name: "rou_Id" })
    	routeId!: number;

	@Column({ name: "tra_Datetime" })
    	datetime!: Date;

	@Column({ name: "tra_Name", length: 100, nullable: true })
    	name?: string;

	@Column({ name: "tra_Duration", type: "time" })
    	duration!: string;

	@Column({ name: "tra_Rithm", type: "decimal", precision: 4, scale: 2 })
    	rithm!: number;

	@Column({ name: "tra_MaxSpeed", type: "decimal", precision: 5, scale: 2 })
    	maxSpeed!: number;

	@Column({ name: "tra_AvgSpeed", type: "decimal", precision: 5, scale: 2 })
    	avgSpeed!: number;

	@Column({ name: "tra_Calories", type: "decimal", precision: 6, scale: 2 })
    	calories!: number;

	@Column({ name: "tra_ElevationGain", type: "decimal", precision: 5, scale: 2 })
    	elevationGain!: number;

	@Column({ name: "tra_Image", type: "text", nullable: true })
		image?: string;

	@Column({ name: "tra_TrainingType", length: 10 })
		trainingType!: 'Running' | 'Cycling';

	@Column({ name: "tra_IsGhost", type: "smallint" })
		isGhost!: number;

	@Column({ name: "tra_AvgStride", type: "decimal", precision: 5, scale: 2, nullable: true })
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