import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Headers, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { IncomingHttpHeaders } from 'http';

import { AuthService } from './auth.service';
import { GetUser, GetHeaders, RoleProtected, Auth } from './decorators';

import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role.guard';
import { ValidRoles } from './interfaces/valid-roles';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-auth-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user: User
  ) {
    const token = this.authService.checkAuthStatus({id: user.id});
    return {user, token}
  }

  @Get('private')
  @UseGuards( AuthGuard() )
  privateRoute(
    // @Req() request: Request
    @GetUser() user: User,
    @GetUser('email') email: string,
    @GetHeaders() headers: string[],
    @Headers() headers1: IncomingHttpHeaders
  ) {
    // console.log({user: request.user})
    return {ok: true, user, email, headers, headers1}
  }

  // @SetMetadata('roles', ['admin', 'super-user'])
  @Get('private2')
  @RoleProtected(ValidRoles.SUPERUSER)
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute2(
    @GetUser() user: User
  ) {
    return {user}
  }

  @Get('private3')
  @Auth()
  privateRoute3(
    @GetUser() user: User
  ) {
    return {user}
  }


}
