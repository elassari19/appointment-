import { AppDataSource } from '@/lib/database';
import { IdempotencyKey } from '@/lib/entities/IdempotencyKey';

const IDEMPOTENCY_KEY_TTL = 24 * 60 * 60 * 1000;

export async function getIdempotencyResponse(
  key: string
): Promise<{ found: boolean; response: unknown }> {
  const repository = AppDataSource.getRepository(IdempotencyKey);
  
  const record = await repository.findOne({
    where: { key },
  });

  if (!record) {
    return { found: false, response: null };
  }

  if (Date.now() - record.createdAt.getTime() > IDEMPOTENCY_KEY_TTL) {
    return { found: false, response: null };
  }

  return { found: true, response: record.response };
}

export async function saveIdempotencyResponse(
  key: string,
  response: unknown
): Promise<void> {
  const repository = AppDataSource.getRepository(IdempotencyKey);
  
  const record = repository.create({
    key,
    response: typeof response === 'string' ? response : JSON.stringify(response),
    createdAt: new Date(),
  });

  await repository.save(record);
}

export async function withIdempotency<T>(
  key: string,
  operation: () => Promise<T>
): Promise<T> {
  const existing = await getIdempotencyResponse(key);
  
  if (existing.found) {
    return existing.response as T;
  }

  const result = await operation();
  await saveIdempotencyResponse(key, result);
  
  return result;
}

export async function cleanupExpiredIdempotencyKeys(): Promise<number> {
  const repository = AppDataSource.getRepository(IdempotencyKey);
  const expiryDate = new Date(Date.now() - IDEMPOTENCY_KEY_TTL);
  
  const result = await repository
    .createQueryBuilder()
    .delete()
    .where('createdAt < :expiryDate', { expiryDate })
    .execute();

  return result.affected || 0;
}
