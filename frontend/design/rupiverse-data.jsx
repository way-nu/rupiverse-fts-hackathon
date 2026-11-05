// khata-data.jsx — Sample data for a Bangalore-based Indian professional, May 2026.
// All amounts in ₹. Numbers are tuned to feel real for a mid-career tech salary.

const ACCOUNTS = [
  { id: 'a1', name: 'HDFC Salary',       short: 'HDFC',  type: 'salary',      last4: '4521', balance: 212340, monthIn: 280000, monthOut: 98000, color: '#0048A0' },
  { id: 'a2', name: 'ICICI Savings',     short: 'ICICI', type: 'savings',     last4: '8830', balance: 384500, monthIn: 60000,  monthOut: 0,     color: '#F36D00' },
  { id: 'a3', name: 'Axis Expenditure',  short: 'Axis',  type: 'expenditure', last4: '1102', balance: 68420,  monthIn: 90000,  monthOut: 84320, color: '#97144D' },
  { id: 'a4', name: 'Kotak Savings',     short: 'Kotak', type: 'savings',     last4: '7755', balance: 24000,  monthIn: 0,      monthOut: 0,     color: '#EE3A23' },
  { id: 'a5', name: 'HDFC Millennia',    short: 'HDFC',  type: 'credit_card', last4: '4429', balance: -18430, monthIn: 0,      monthOut: 32180, color: '#1A1A1A' },
];

// Category tree. Each leaf has a soft "swatch" color used in the donut + chips.
const CATEGORIES = [
  { id: 'food',    name: 'Food',          abbr: 'Fo', glyph: 'खा', swatch: '#B5460F', flow: 'expense', children: [
    { id: 'food.groceries', name: 'Groceries',     parent: 'food', count: 9,  spend: 8420 },
    { id: 'food.dining',    name: 'Dining out',    parent: 'food', count: 12, spend: 11240, children: [
      { id: 'food.dining.coffee', name: 'Coffee',  parent: 'food.dining', count: 7, spend: 1820 },
      { id: 'food.dining.dinner', name: 'Dinner',  parent: 'food.dining', count: 4, spend: 7960 },
      { id: 'food.dining.lunch',  name: 'Lunch',   parent: 'food.dining', count: 1, spend: 1460 },
    ]},
    { id: 'food.delivery',  name: 'Food delivery', parent: 'food', count: 14, spend: 6240 },
  ]},
  { id: 'rent',    name: 'Rent',          abbr: 'Re', glyph: 'घ',  swatch: '#3F5B8A', flow: 'expense', count: 1, spend: 38000 },
  { id: 'transport', name: 'Transport',   abbr: 'Tr', glyph: 'या', swatch: '#7A3E9D', flow: 'expense', children: [
    { id: 'transport.cab',  name: 'Cab / Auto',    parent: 'transport', count: 11, spend: 3640 },
    { id: 'transport.fuel', name: 'Fuel',          parent: 'transport', count: 2,  spend: 4200 },
    { id: 'transport.metro',name: 'Metro / Bus',   parent: 'transport', count: 6,  spend: 720 },
  ]},
  { id: 'bills',   name: 'Bills & Utilities', abbr: 'Bi', glyph: 'बि', swatch: '#356648', flow: 'expense', children: [
    { id: 'bills.elec',  name: 'Electricity', parent: 'bills', count: 1, spend: 2840 },
    { id: 'bills.net',   name: 'Internet',    parent: 'bills', count: 1, spend: 999 },
    { id: 'bills.phone', name: 'Mobile',      parent: 'bills', count: 1, spend: 499 },
  ]},
  { id: 'subs',    name: 'Subscriptions', abbr: 'Su', glyph: 'सब', swatch: '#7A6418', flow: 'expense', children: [
    { id: 'subs.sw',    name: 'Software',      parent: 'subs', count: 3, spend: 4950, children: [
      { id: 'subs.sw.claude', name: 'Claude',  parent: 'subs.sw', count: 1, spend: 1660 },
      { id: 'subs.sw.figma',  name: 'Figma',   parent: 'subs.sw', count: 1, spend: 1290 },
      { id: 'subs.sw.gh',     name: 'GitHub',  parent: 'subs.sw', count: 1, spend: 2000 },
    ]},
    { id: 'subs.ent',   name: 'Entertainment', parent: 'subs', count: 2, spend: 798 },
  ]},
  { id: 'shop',    name: 'Shopping',      abbr: 'Sh', glyph: 'खा', swatch: '#8A3A52', flow: 'expense', children: [
    { id: 'shop.cloth',  name: 'Clothing',    parent: 'shop', count: 3, spend: 6420 },
    { id: 'shop.elec',   name: 'Electronics', parent: 'shop', count: 1, spend: 2199 },
    { id: 'shop.home',   name: 'Household',   parent: 'shop', count: 4, spend: 2890 },
  ]},
  { id: 'health',  name: 'Health',        abbr: 'He', glyph: 'स्वा', swatch: '#3D6B6B', flow: 'expense', children: [
    { id: 'health.fit',  name: 'Fitness',     parent: 'health', count: 1, spend: 2200 },
    { id: 'health.med',  name: 'Medicine',    parent: 'health', count: 2, spend: 640 },
  ]},
  { id: 'invest',  name: 'Investments',   abbr: 'In', glyph: 'नि',  swatch: '#1F4D3A', flow: 'expense', count: 2, spend: 25000 },
  { id: 'misc',    name: 'Miscellaneous', abbr: 'Mi', glyph: 'अ',   swatch: '#666666', flow: 'expense', count: 3, spend: 1240 },
];

const INCOME_CATEGORIES = [
  { id: 'salary',  name: 'Salary',           abbr: 'Sa', glyph: 'व',  swatch: '#1F4D3A', flow: 'income', count: 1, total: 280000 },
  { id: 'split',   name: 'Bill split',       abbr: 'Sp', glyph: 'भा', swatch: '#3F5B8A', flow: 'income', count: 4, total: 3220 },
  { id: 'refund',  name: 'Refunds',          abbr: 'Rf', glyph: 'वा', swatch: '#7A6418', flow: 'income', count: 1, total: 1280 },
  { id: 'interest',name: 'Interest earned',  abbr: 'It', glyph: 'ब्या', swatch: '#356648', flow: 'income', count: 1, total: 940 },
];

// Helpers to flatten the tree.
function flattenCats(nodes, out = []) {
  for (const n of nodes) {
    out.push(n);
    if (n.children) flattenCats(n.children, out);
  }
  return out;
}
const ALL_CATS = flattenCats(CATEGORIES);
const CAT_BY_ID = Object.fromEntries(ALL_CATS.map((c) => [c.id, c]));
function catRoot(id) {
  let c = CAT_BY_ID[id];
  while (c && c.parent) c = CAT_BY_ID[c.parent];
  return c;
}
function catPath(id) {
  const path = [];
  let c = CAT_BY_ID[id];
  while (c) { path.unshift(c); c = c.parent ? CAT_BY_ID[c.parent] : null; }
  return path;
}

// Transactions. 'when' is a relative label for grouping; 'date' for the ISO version.
// 'aiSure' true = AI was high-confidence; false = low-confidence (chip is dashed).
const TRANSACTIONS = [
  // Today — Sat 17 May
  { id: 't1', type: 'expense', amount: 320,  merchant: 'Blue Tokai',    note: 'flat white + cortado',  account: 'a5', method: 'credit_card', cat: 'food.dining.coffee', when: 'Today', date: '2026-05-17', ai: true },
  { id: 't2', type: 'expense', amount: 184,  merchant: 'Uber',          note: 'to indiranagar',         account: 'a3', method: 'upi',         cat: 'transport.cab',      when: 'Today', date: '2026-05-17', ai: true },
  { id: 't3', type: 'expense', amount: 1280, merchant: 'Zomato',        note: 'paradise biryani x2',    account: 'a3', method: 'upi',         cat: 'food.delivery',      when: 'Today', date: '2026-05-17', ai: true },
  // Yesterday — Fri 16 May
  { id: 't4', type: 'expense', amount: 2199, merchant: 'Amazon',        note: 'usb-c hub',              account: 'a5', method: 'credit_card', cat: 'shop.elec',          when: 'Yesterday', date: '2026-05-16', ai: true },
  { id: 't5', type: 'income',  amount: 1200, merchant: 'Aishwarya',     note: 'her share, dinner',      account: 'a3', method: 'upi',         cat: 'split',              when: 'Yesterday', date: '2026-05-16' },
  { id: 't6', type: 'expense', amount: 459,  merchant: 'Swiggy',        note: 'breakfast',              account: 'a3', method: 'upi',         cat: 'food.delivery',      when: 'Yesterday', date: '2026-05-16', ai: true },
  // Thu 15 May
  { id: 't7', type: 'expense', amount: 1660, merchant: 'Anthropic',     note: 'Claude Max — monthly',   account: 'a5', method: 'credit_card', cat: 'subs.sw.claude',     when: 'Thu, 15 May', date: '2026-05-15', ai: true },
  { id: 't8', type: 'expense', amount: 2840, merchant: 'BESCOM',        note: 'electricity, april',     account: 'a3', method: 'upi',         cat: 'bills.elec',         when: 'Thu, 15 May', date: '2026-05-15', ai: false },
  // Wed 14 May
  { id: 't9', type: 'expense', amount: 720,  merchant: 'BookMyShow',    note: 'mission impossible 8',   account: 'a5', method: 'credit_card', cat: 'subs.ent',           when: 'Wed, 14 May', date: '2026-05-14', ai: true },
  { id: 't10',type: 'expense', amount: 3460, merchant: 'BigBasket',     note: 'weekly groceries',       account: 'a3', method: 'upi',         cat: 'food.groceries',     when: 'Wed, 14 May', date: '2026-05-14', ai: true },
  { id: 't11',type: 'expense', amount: 540,  merchant: 'Auto',          note: 'home → office',          account: 'a3', method: 'cash',        cat: 'transport.cab',      when: 'Wed, 14 May', date: '2026-05-14' },
  // Tue 13 May
  { id: 't12',type: 'expense', amount: 38000,merchant: 'Mr Naidu',      note: 'rent — may',             account: 'a3', method: 'upi',         cat: 'rent',               when: 'Tue, 13 May', date: '2026-05-13', recurring: true },
  { id: 't13',type: 'income',  amount: 280000,merchant:'Acme Pvt Ltd',  note: 'salary credit',          account: 'a1', method: 'netbanking',  cat: 'salary',             when: 'Tue, 13 May', date: '2026-05-13', recurring: true },
];

// Headline donut data (this month, expense by root category).
const SPEND_BY_CATEGORY = [
  { id: 'rent',      name: 'Rent',          amount: 38000, color: '#3F5B8A' },
  { id: 'invest',    name: 'Investments',   amount: 25000, color: '#1F4D3A' },
  { id: 'food',      name: 'Food',          amount: 25900, color: '#B5460F' },
  { id: 'shop',      name: 'Shopping',      amount: 11509, color: '#8A3A52' },
  { id: 'subs',      name: 'Subscriptions', amount:  5748, color: '#7A6418' },
  { id: 'bills',     name: 'Bills',         amount:  4338, color: '#356648' },
  { id: 'transport', name: 'Transport',     amount:  8560, color: '#7A3E9D' },
  { id: 'health',    name: 'Health',        amount:  2840, color: '#3D6B6B' },
];

// 6-month trend (in / out in thousands).
const TREND = [
  { m: 'Dec', inK: 268, outK: 142 },
  { m: 'Jan', inK: 268, outK: 118 },
  { m: 'Feb', inK: 268, outK: 156 },
  { m: 'Mar', inK: 268, outK: 132 },
  { m: 'Apr', inK: 268, outK: 168 },
  { m: 'May', inK: 284, outK: 122 },
];

// Top merchants this month.
const TOP_MERCHANTS = [
  { name: 'Mr Naidu (rent)', amount: 38000, count: 1,  cat: 'rent'             },
  { name: 'Acme MF SIP',     amount: 25000, count: 1,  cat: 'invest'           },
  { name: 'BigBasket',       amount:  8420, count: 4,  cat: 'food.groceries'   },
  { name: 'Swiggy',          amount:  4820, count: 11, cat: 'food.delivery'    },
  { name: 'Uber',            amount:  3240, count: 14, cat: 'transport.cab'    },
  { name: 'Blue Tokai',      amount:  1820, count: 7,  cat: 'food.dining.coffee'},
];

const MONTH_SUMMARY = {
  in: 284500,
  out: 121935,
  net: 162565,
  txnCount: 47,
  transfersExcluded: 22000,
};

// Headline numbers for the previous month, used to show deltas.
const PREV_MONTH = { in: 268000, out: 167420 };

Object.assign(window, {
  ACCOUNTS, CATEGORIES, INCOME_CATEGORIES, ALL_CATS, CAT_BY_ID,
  TRANSACTIONS, SPEND_BY_CATEGORY, TREND, TOP_MERCHANTS,
  MONTH_SUMMARY, PREV_MONTH, catRoot, catPath,
});
