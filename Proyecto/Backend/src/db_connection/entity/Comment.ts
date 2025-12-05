import { Entity, Column, PrimaryColumn, ManyToOne, CreateDateColumn } from "typeorm";
import { Publication } from "./Publication";

@Entity("Comments")
export class Comment {

    @PrimaryColumn({ name: "publicationCounter" })
    	publicationCounter!: number;

    @PrimaryColumn({ name: "userEmail", length: 100 })
    	userEmail!: string;

    @PrimaryColumn({ name: "trainingCounter" })
    	trainingCounter!: number;

    @PrimaryColumn({ name: "routeId" })
    	routeId!: number;

    @PrimaryColumn({ name: "counter" })
    	counter!: number;

    @Column({ name: "text", type: "text" })
    	text!: string;

    @Column({ name: "likes", default: 0 })
    	likes!: number;

    @CreateDateColumn({ name: "datetime" })
    	datetime!: Date;

    @ManyToOne(() => Publication, publication => publication.comments)
    	publication!: Publication;
}