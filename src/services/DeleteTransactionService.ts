import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactrionRepo = getRepository(Transaction);

    const transaction = await transactrionRepo.findOne({ id });

    if (!transaction) {
      throw new AppError('transação não encontrada');
    }

    await transactrionRepo.remove(transaction);
  }
}

export default DeleteTransactionService;
