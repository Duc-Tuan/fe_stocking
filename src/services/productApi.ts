import api from './api';

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

export const getAllProducts = async (): Promise<Product[]> => {
  const response = await api.get<Product[]>('/products');
  return response.data;
};

export const getProductById = async (id: number): Promise<Product> => {
  const response = await api.get<Product>(`/products/${id}`);
  return response.data;
};
