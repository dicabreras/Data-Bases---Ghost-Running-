import { Entity, Column, PrimaryColumn, CreateDateColumn, OneToMany } from "typeorm";
import { PhysicalState } from "./PhysicalState";
import { WeeklyGoal } from "./WeeklyGoal";
import { Training } from "./Training";
import { Publication } from "./Publication";

@Entity("UserGR")
export class User {
    @PrimaryColumn({ name: "email", length: 100 })
    	email!: string;

    @Column({ name: "username", length: 45, unique: true })
    	username!: string;

    // le quite el select: false porque no me dejaba hacer login :p
    @Column({ name: "password", length: 255 })
    	password!: string;

    @Column({ name: "names", length: 45 })
    	names!: string;

    @Column({ name: "lastNames", length: 45 })
    	lastNames!: string;

    @Column({ name: "age" })
    	age!: number;

    @Column({ name: "profilePhoto", length: 255, nullable: true })
    	profilePhoto?: string;

    @Column({ name: "description", type: "text", nullable: true })
    	description?: string;

    @CreateDateColumn({ name: "registrationDate" })
    	registrationDate!: Date;

    @Column({ name: "gender", length: 45, nullable: true })
    	gender?: string;

    @OneToMany(() => PhysicalState, physicalState => physicalState.user)
    	physicalStates!: PhysicalState[];

    @OneToMany(() => WeeklyGoal, weeklyGoal => weeklyGoal.user)
    	weeklyGoals!: WeeklyGoal[];

    @OneToMany(() => Training, training => training.user)
    	trainings!: Training[];

    @OneToMany(() => Publication, publication => publication.user)
    	publications!: Publication[];
}