import { Entity, Column, PrimaryColumn, ManyToOne, CreateDateColumn } from "typeorm";
import { Publication } from "./Publication";

@Entity("Comments")
export class Comment {


    @PrimaryColumn({ name: "pub_Counter" })
    	publicationCounter!: number;

    @PrimaryColumn({ name: "user_Email", length: 100 })
    	userEmail!: string;

    @PrimaryColumn({ name: "tra_Counter" })
    	trainingCounter!: number;

    @PrimaryColumn({ name: "rou_Id" })
    	routeId!: number;

    @PrimaryColumn({ name: "com_Counter" })
    	counter!: number;

    @Column({ name: "com_Text", type: "text" })
    	text!: string;

    @Column({ name: "com_Likes", default: 0 })
    	likes!: number;

    @CreateDateColumn({ name: "com_Datetime" })
    	datetime!: Date;

    @ManyToOne(() => Publication, publication => publication.comments)
    	publication!: Publication;
}