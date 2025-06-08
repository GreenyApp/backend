import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entity/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async getOneById(id: number): Promise<Product> {
    try {
      return await this.productRepository.findOne({
        where: { id },
        relations: ['user'],
      });
    } catch (error) {
      throw new Error(`Failed: ${error.message}`);
    }
  }

  async getOneByCode(code: string): Promise<Product> {
    try {
      return await this.productRepository.findOneBy({ code });
    } catch (error) {
      throw new Error(`Failed: ${error.message}`);
    }
  }

  async getAll(): Promise<Product[]> {
    try {
      return await this.productRepository.find();
    } catch (error) {
      throw new Error(`Failed: ${error.message}`);
    }
  }

  async getAllByUser(userId: number): Promise<Product[]> {
    try {
      return await this.productRepository.find({
        where: { user: { id: userId } },
      });
    } catch (error) {
      throw new Error(`Failed: ${error.message}`);
    }
  }

  async create(code: string): Promise<Product> {
    try {
      const product = this.productRepository.create({ code, name: '' });
      return await this.productRepository.save(product);
    } catch (error) {
      throw new Error(`Failed: ${error.message}`);
    }
  }

  async update(id: number, updateInput: Partial<Product>): Promise<Product> {
    try {
      await this.productRepository.update(id, updateInput);
      return await this.productRepository.findOneBy({ id });
    } catch (error) {
      throw new Error(`Failed: ${error.message}`);
    }
  }
}
