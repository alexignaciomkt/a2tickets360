import Dexie, { Table } from 'dexie';

export interface LocalTicket {
  id: string;
  qr_code: string;
  buyer_name: string;
  buyer_cpf: string;
  selfie_url: string;
  ticket_name: string;
  status: 'valid' | 'used' | 'invalid';
  check_in_at?: string;
  synced: boolean;
}

export class TicketeraOfflineDB extends Dexie {
  tickets!: Table<LocalTicket>;

  constructor() {
    super('TicketeraOfflineDB');
    this.version(1).stores({
      tickets: '++id, qr_code, buyer_name, buyer_cpf, status, synced'
    });
  }
}

export const db = new TicketeraOfflineDB();
