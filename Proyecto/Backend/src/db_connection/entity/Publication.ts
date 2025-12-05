import { Entity, Column, PrimaryColumn, ManyToOne, OneToMany } from "typeorm";
import { User } from "./User";
import { Training } from "./Training";
import { Comment } from "./Comment";

@Entity("Publication")
export class Publication {
    @PrimaryColumn({ name: "counter" })
    	counter!: number;

    @Column({ name: "likes" })
    	likes!: number;

    @Column({ name: "routeImage", length: 255, nullable: true })
    	routeImage?: string;

    @Column({ name: "privacy" })
    	privacy!: number;

    @Column({ name: "datetime" })
    	datetime!: Date;

    @PrimaryColumn({ name: "userEmail", length: 100 })
    	userEmail!: string;

    @PrimaryColumn({ name: "trainingCounter" })
    	trainingCounter!: number;

    @PrimaryColumn({ name: "routeId" })
    	routeId!: number;

    @ManyToOne(() => User, user => user.publications)
    	user!: User;

    @ManyToOne(() => Training, training => training.publications)
    	training!: Training;

    @OneToMany(() => Comment, comment => comment.publication)
    	comments!: Comment[];
}