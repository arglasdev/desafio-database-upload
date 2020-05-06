import path from 'path';
import fs from 'fs';
import csvParse from 'csv-parse';
import uploadConfig from '../config/upload';
import CreateTransactionService from './CreateTransactionService';

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

class ImportTransactionsService {
  private async readCsv(fileName: string): Promise<string[]> {
    const csvFilePath = path.resolve(uploadConfig.directory, fileName);

    const readCSVStream = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const readTransactions: string[] = [];

    const parseCSV = readCSVStream.pipe(parseStream);

    parseCSV.on('data', line => {
      readTransactions.push(line);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    return readTransactions;
  }

  private async saveTransaction(transaction: Request): Promise<Response> {
    const createTransactionService = new CreateTransactionService();

    return createTransactionService.execute(transaction);
  }

  async execute(filename: string): Promise<Response[]> {
    const lines = await this.readCsv(filename);

    const transactionArray = lines.map(line => {
      const splitted = line[0].split('\t');

      return {
        title: splitted[0] as string,
        type: splitted[1] as 'income' | 'outcome',
        value: +splitted[2] as number,
        category: splitted[3] as string,
      };
    });

    const transactionsResponse = transactionArray.map(async transaction => {
      const { title, category, type, value } = transaction;

      return this.saveTransaction({ title, category, type, value });
    });

    return Promise.all(transactionsResponse);
  }
}

export default ImportTransactionsService;
