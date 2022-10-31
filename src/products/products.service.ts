import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductImage } from './entities';
import { validate as isUUID } from 'uuid';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    // new Product();
    try {

      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...productDetails,
        // TypeOrm le asigna automaticamente el productId a la imagen cuando se guarda el product en la BD
        images: images.map( image => this.productImageRepository.create({url: image}) ),
        user
      });
      await this.productRepository.save(product);

      return {...product, images};

    } catch (err) {
      this.handleDBExceptionError(err);
    }
  }

  async findAll(paginationDto: PaginationDto) {

    const { limit = 10, offset = 0 } = paginationDto;

    const products = await this.productRepository.find({ 
      take: limit,
      skip: offset,
      relations: {
        images: true
      }
    });

    return products.map(({images, ...rest}) => ({
      ...rest,
      images: images.map(i => i.url)
    }));
  }

  async findOne(term: string) {

    let product: Product;
    
    if ( isUUID(term) ) {
      product = await this.productRepository.findOneBy({id: term});
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod'); //alias de la tabla prodictp
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase()
        })
        .leftJoinAndSelect('prod.images', 'prodImages') // trae las imagenes de los productos y además crea un alias de las imagenes de los productos
        .getOne();
    }

    if (!product) throw new NotFoundException(`Product with id: ${term} not found`);

    return product;
  }

  async findOnePlain( term: string ) {
    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map(image => image.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({
      id,
      ...toUpdate
    });

    if ( !product ) throw new NotFoundException(`Product with id: ${id} not found`);

    // Create query runner
    // Query runner para realizar varias consultas a la BD, si alguna transacción falla se hace un rollback(se deja como estaba)
    // Nosotros le confirmamos al query runner que puede afectar a la BD con un commit (como en github)
    const queryRunner = this.dataSource.createQueryRunner();
    // conectar a la BD
    await queryRunner.connect();
    // iniciar la transacción
    await queryRunner.startTransaction();

    try {
      if (images) {
        // eliminar imagenes con queryRunner
        await queryRunner.manager.delete( ProductImage , { product: { id } })
        // creo las imagenes que vienen de el update
        product.images = images.map( image => this.productImageRepository.create({url: image}) );
      }

      // Guardamos las transacciones
      product.user = user;
      await queryRunner.manager.save(product);

      //  Lanzamos y guardamos las transacciones que hicimos
      await queryRunner.commitTransaction();

      // nos desconectamos del queryRunner
      await queryRunner.release();

      // await this.productRepository.save(product);
  
      return this.findOnePlain(id);
    } catch (err) {
      // si falla alguna transaccion hacemos rollback (lo dejamos como estaba)
      await queryRunner.rollbackTransaction();

      await queryRunner.release();

      this.handleDBExceptionError(err);
    }

  }

  async remove(id: string) {

    const product = await this.findOne(id);
    await this.productRepository.remove(product);

    // const { affected } = await this.productRepository.delete({id: id});

    // if (affected === 0) throw new BadRequestException(`Pokemon with id "${id}" not found`);

    return {message: 'Product has been removed'};
  }

  private handleDBExceptionError(error: any) {
    if (error.code === '23505')
        throw new BadRequestException(error.detail)

    this.logger.error(error);
    // console.log(err);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('propuct');

    try {

      return await query
        .delete()
        .where({})
        .execute();

    } catch(err) {
      this.handleDBExceptionError(err);
    }

  }

}
