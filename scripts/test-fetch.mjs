import { fetchSupabaseProducts } from '../api/data/productsStore.js';

const prods = await fetchSupabaseProducts();
console.log('FETCHED COUNT:', prods.length);
prods.forEach(p => console.log(p.id, '|', p.name));
