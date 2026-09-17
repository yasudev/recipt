import Dexie from 'dexie';

const db = new Dexie('yuminventory-pos-db');

db.version(1).stores({
    products: 'id, category_id, name, sku, updated_at',
    categories: 'id, name',
    sales: 'local_id, server_id, receipt_number, status, sync_status, created_at, sale_date',
    settings: 'key',
});

export default db;