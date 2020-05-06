import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

interface Response {
  id: string;
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Response> {
    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Invalid type of transaction');
    }
    if (value <= 0) {
      throw new AppError('Invalid transaction amount');
    }

    const transactionsRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    const transactions = await transactionsRepository.getBalance();

    if (transactions && type === 'outcome' && transactions.total < value) {
      throw new AppError('Insufficient funds');
    }

    let categoryDB = await categoryRepository.findOne({ title: category });

    if (!categoryDB) {
      const newCategory = categoryRepository.create({ title: category });
      await categoryRepository.save(newCategory);
      categoryDB = newCategory;
    }

    const transaction = transactionsRepository.create({
      title,
      type,
      category: categoryDB,
      value,
    });

    await transactionsRepository.save(transaction);

    return { id: transaction.id, title, type, value, category };
  }
}

export default CreateTransactionService;
