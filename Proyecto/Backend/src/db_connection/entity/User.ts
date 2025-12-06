import { Entity, Column, PrimaryColumn, CreateDateColumn, OneToMany } from "typeorm";
import { PhysicalState } from "./PhysicalState";
import { WeeklyGoal } from "./WeeklyGoal";
import { Training } from "./Training";
import { Publication } from "./Publication";

@Entity("UserGR")
export class User {
    @PrimaryColumn({ name: "user_Email", length: 100 })
    	email!: string;

    @Column({ name: "user_Username", length: 45, unique: true })
    	username!: string;

    // le quite el select: false porque no me dejaba hacer login :p
    @Column({ name: "user_Password", length: 255 })
    	password!: string;

    @Column({ name: "user_Names", length: 45 })
    	names!: string;

    @Column({ name: "user_LastNames", length: 45 })
    	lastNames!: string;

    @Column({ name: "user_Age" })
    	age!: number;

    @Column({ name: "user_ProfilePhoto", length: 255, nullable: true })
    	profilePhoto?: string;

    @Column({ name: "user_Description", type: "text", nullable: true })
    	description?: string;

    @CreateDateColumn({ name: "user_RegistrationDate" })
    	registrationDate!: Date;

    @Column({ name: "user_gender", length: 45, nullable: true })
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