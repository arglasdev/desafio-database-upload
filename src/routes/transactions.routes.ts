import { Router } from 'express';
import { getCustomRepository, getRepository } from 'typeorm';
import multer from 'multer';
import uploadConfig from '../config/upload';

import Transaction from '../models/Transaction';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionCustomRepo = getCustomRepository(TransactionsRepository);
  const transactionRepo = getRepository(Transaction);

  const transactions = await transactionRepo.find();
  const balance = await transactionCustomRepo.getBalance();

  const formattedResponse = { transactions, balance };
  return response.json(formattedResponse);
});

transactionsRouter.post('/', async (request, response) => {
  const { title, type, value, category } = request.body;

  const createService = new CreateTransactionService();
  const transaction = await createService.execute({
    title,
    type,
    value,
    category,
  });
  return response.status(201).json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const deleteService = new DeleteTransactionService();

  const { id } = request.params;

  await deleteService.execute(id);

  return response.status(200).send();
});

transactionsRouter.post(
  '/import',
  upload.single('csv'),
  async (request, response) => {
    const importService = new ImportTransactionsService();

    const transactions = await importService.execute(request.file.filename);

    return response.json(transactions);
  },
);

export default transactionsRouter;
