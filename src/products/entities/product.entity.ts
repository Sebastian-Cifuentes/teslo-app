import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from './';
import { User } from '../../auth/entities/user.entity';
import { ApiProperty } from "@nestjs/swagger";

@Entity({name: 'products'})
export class Product {

    @ApiProperty({
        example: '14d85da8-f823-42fc-9bab-8286011348e4',
        description: 'Product id',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'T-shirt teslo',
        description: 'Product name',
        uniqueItems: true
    })
    @Column('text', {
        unique: true
    })
    title: string;

    @ApiProperty({
        example: 0,
        description: 'Product price'
    })
    @Column('float', {
        default: 0
    })
    price: number;

    @ApiProperty({
        example: 'Lorem ipsum',
        description: 'Product desc',
        default: null
    })
    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @ApiProperty({
        example: 't_shirt_teslo',
        description: 'Product slug for seo',
        uniqueItems: true
    })
    @Column('text', {
        unique: true
    })
    slug: string;

    @ApiProperty({
        example: 10,
        description: 'Product stock',
        default: 0
    })
    @Column('int', {
        default: 0
    })
    stock: number;

    @ApiProperty({
        example: ['S', 'M', 'L'],
        description: 'Product sizes'
    })
    @Column('text', {
        array: true
    })
    sizes: string[];

    @ApiProperty({
        example: 'women',
        description: 'Product gender'
    })
    @Column('text')
    gender: string;

    @ApiProperty({
        example: 'cats',
        description: 'Product tags'
    })
    @Column('text', {
        array: true,
        default: []
    })
    tags: string[];

    @ManyToOne(
        // entidad con la que se relaciona
        () => User,
        // con que campo de la entidad se relaciona
        ( user ) => user.product,
        {eager: true}
    )
    user: User;

    //No es una columna, es una relación de Uno a muchos
    @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        //eager: se usa para que traiga las relaciones de cualquier metodo que utilice FIND*
        { cascade: true, eager: true }
    )
    images?: ProductImage[];

    // Se ejecuta antes de insertar un documento a esta tabla
    @BeforeInsert()
    checkSlugInsert() {
        if (!this.slug) {
            this.slug = this.title
        }

        this.slug = this.slug
            .toLocaleLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '')
    }

    // Se ejecuta antes de actualizar un documento a esta tabla
    @BeforeUpdate()
    checkSlugUpdate() {
        this.slug = this.title

        this.slug = this.slug
            .toLocaleLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '')
    }


}
