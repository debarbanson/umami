import { describe, expect, test, vi } from 'vitest';
import { POST } from './route';

vi.mock('@/app/api/send/route', () => ({
  POST: vi.fn(),
}));

vi.mock('@/queries/prisma', () => ({
  getWebsiteSegment: vi.fn(),
}));

describe('batch route validation', () => {
  // GHSA-mrhx-c7xc-m3w5: zod before 4.6.6 validated every element of a bounded array
  // before checking the bound, so an oversized batch built one issue per element.
  test('rejects an oversized batch on its length alone', async () => {
    const response = await POST(
      new Request('http://localhost/api/batch', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(Array(501).fill(0)),
      }),
    );
    const { error } = await response.json();

    expect(response.status).toBe(400);
    expect(error.errors).toHaveLength(1);
    expect(error.items).toBeUndefined();
  });
});
