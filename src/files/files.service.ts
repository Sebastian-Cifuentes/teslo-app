import { Injectable, BadRequestException } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';


@Injectable()
export class FilesService {

    getStaticFile(name: string) {
        const path = join(__dirname, '../../static/products', name);

        if(!existsSync(path)) {
            throw new BadRequestException(`No product found with image ${ name }`)
        }

        return path;
    } 

}
