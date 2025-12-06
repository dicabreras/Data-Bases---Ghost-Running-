import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from "typeorm";
import { Route } from "./Route";

@Entity("Coordinate")
export class Coordinate {
    @PrimaryGeneratedColumn({ name: "coo_Id" })
    	id!: number;

    @Column({ name: "coo_Latitude", type: "float" })
    	latitude!: number;

    @Column({ name: "coo_Longitude", type: "float" })
    	longitude!: number;

    @Column({ name: "coo_Altitude", type: "float" })
    	altitude!: number;

    @ManyToMany(() => Route, route => route.coordinates)
    	routes!: Route[];
}