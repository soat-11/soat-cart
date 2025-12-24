import { Injectable } from "@nestjs/common";
import { Result } from "@shared/result";

export interface IProduct {
  sku: string;
  name: string;
  price: number;
}

export interface IProductRepository {
  findById(sku: string): Promise<Result<IProduct>>;
}

@Injectable()
export class ProductMongoRepository implements IProductRepository {
  public async findById(sku: string): Promise<Result<IProduct>> {
    const mockProduct: IProduct = {
      sku: sku,
      name: "Produto Validado",
      price: 100.0,
    };
    return Result.ok(mockProduct);
  }
}
