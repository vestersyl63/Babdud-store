import { getSetting } from '@/lib/db.mjs';
export const dynamic = 'force-dynamic';
import { json } from '@/lib/util.mjs';

export async function GET() {
  return json({
    bank: {
      bank_name: getSetting('bank_name'),
      account_name: getSetting('bank_account_name'),
      account_number: getSetting('bank_account_number'),
      instructions: getSetting('payment_instructions'),
    },
    delivery_fee: Number(getSetting('delivery_fee', '0')) || 0,
    announcement: getSetting('store_announcement'),
  });
}
