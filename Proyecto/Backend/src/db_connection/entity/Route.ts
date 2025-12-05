import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany } from "typeorm";
import { Coordinate } from "./Coordinate";
import { Training } from "./Training";
import { Kilometer } from "./Kilometer";

@Entity("Route")
export class Route {

    @PrimaryGeneratedColumn({ name: "id" })
    	id!: number;

    @Column({ name: "distance", type: "decimal", precision: 5, scale: 2 })
    	distance!: number;

    @ManyToMany(() => Coordinate)
    @JoinTable({
    	name: "Route_has_Coordinate",
    	joinColumn: {
    		name: "routeId",
    		referencedColumnName: "id"
    	},
    	inverseJoinColumn: {
    		name: "coordinateId",
    		referencedColumnName: "id"
    	}
    })
    	coordinates!: Coordinate[];

    @OneToMany(() => Training, training => training.route)
    	trainings!: Training[];

    @OneToMany(() => Kilometer, kilometer => kilometer.route)
    	kilometers!: Kilometer[];
}