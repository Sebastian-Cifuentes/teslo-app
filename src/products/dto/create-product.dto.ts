import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";
import { ProductImage } from '../entities';

export class CreateProductDto {

    @ApiProperty({
        description: 'Product title (unique)',
        nullable: false,
        minLength: 1
    })
    @IsString()
    @MinLength(1)
    title: string;

    @ApiProperty({
        description: 'Product sizes',
        nullable: false,
        minLength: 1
    })
    @IsString({each: true})
    @IsArray()
    sizes: string[];

    @ApiProperty({
        description: 'Product gender',
        nullable: false,
        minLength: 1
    })
    @IsIn(['men', 'women', 'kid', 'unisex'])
    gender: string;
    
    @IsString({each: true})
    @IsArray()
    @IsOptional()
    tags?: string[];

    @ApiProperty({
        description: 'Product price',
        nullable: false,
        minLength: 1
    })
    @IsNumber() //Recibe decimales
    @IsPositive()
    @IsOptional()
    price?: number;

    @ApiProperty({
        description: 'Product description',
        nullable: false,
        minLength: 1
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: 'Product slug',
        nullable: false,
        minLength: 1
    })
    @IsString()
    @IsOptional()
    slug?: string;

    @ApiProperty({
        description: 'Product stock',
        nullable: false,
        minLength: 1
    })
    @IsInt() // no recibe decimales
    @IsPositive()
    @IsOptional()
    stock?: number;

    @ApiProperty({ description: 'Product images', type: 'array', items: { type: 'string', format: 'binary' } })
    @IsString({each: true})
    @IsArray()
    @IsOptional()
    images?: string []

}
