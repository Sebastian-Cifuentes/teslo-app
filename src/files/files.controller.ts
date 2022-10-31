import { Controller, Get, Post, Param, UploadedFile, UseInterceptors, BadRequestException, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { fileFilter } from './helpers/fileFilter.helper';
import { fileNamer } from './helpers/fileNamer.helper';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) {}

  @Get('product/:name')
  findProductImage(
    @Res() res: Response,
    @Param('name') name: string
  ) {

    const path = this.filesService.getStaticFile(name);

    res.sendFile(path);
  }


  @Post('product')
  @UseInterceptors( FileInterceptor('file', {
    fileFilter: fileFilter,
    // limits: { fileSize: 1000 }
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    })
  }) )
  uploadFileProduct(
    @UploadedFile()
    file: Express.Multer.File
  ) {

    if (!file) throw new BadRequestException('Make sure that the file image');

    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`;

    return {secureUrl};

  }


}
