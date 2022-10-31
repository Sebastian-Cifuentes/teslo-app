import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {

    @ApiProperty({
        example: 'sebas@email.com',
        description: 'User email',
        nullable: false
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: '123456',
        description: 'User password',
        nullable: false
    })
    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'The password must have a Uppercase, lowercase letter and a number'
    })
    password: string;

    @ApiProperty({
        example: 'Sebas Cifuentes',
        description: 'User name',
        nullable: false
    })
    @IsString()
    @MinLength(1)
    fullName: string;

}
