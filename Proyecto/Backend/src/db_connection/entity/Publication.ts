import { Entity, Column, PrimaryColumn, ManyToOne, OneToMany } from "typeorm";
import { User } from "./User";
import { Training } from "./Training";
import { Comment } from "./Comment";

@Entity("Publication")
export class Publication {
    @PrimaryColumn({ name: "pub_Counter" })
    	counter!: number;

    @Column({ name: "pub_Likes" })
    	likes!: number;

    @Column({ name: "pub_RouteImage", length: 255, nullable: true })
    	routeImage?: string;

    @Column({ name: "pub_Privacity" })
    	privacy!: number;

    @Column({ name: "pub_Datetime" })
    	datetime!: Date;

    @PrimaryColumn({ name: "user_Email", length: 100 })
    	userEmail!: string;

    @PrimaryColumn({ name: "tra_Counter" })
    	trainingCounter!: number;

    @PrimaryColumn({ name: "rou_Id" })
    	routeId!: number;

    @ManyToOne(() => User, user => user.publications)
    	user!: User;

    @ManyToOne(() => Training, training => training.publications)
    	training!: Training;

    @OneToMany(() => Comment, comment => comment.publication)
    	comments!: Comment[];
}