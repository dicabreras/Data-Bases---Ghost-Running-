import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from "typeorm";
import { Route } from "./Route";

@Entity("Coordinate")
export class Coordinate {
    @PrimaryGeneratedColumn({ name: "id" })
    	id!: number;

    @Column({ name: "latitude", type: "real" })
    	latitude!: number;

    @Column({ name: "longitude", type: "real" })
    	longitude!: number;

    @Column({ name: "altitude", type: "real" })
    	altitude!: number;

    @ManyToMany(() => Route, route => route.coordinates)
    	routes!: Route[];
}