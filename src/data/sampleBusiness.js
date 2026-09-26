export const sampleBusiness = {
  businessName: 'Amina Tailoring',
  tin: '148-392-715',
  nida: '19900514-11101-00012-27',
  licence: 'DSM/ILA/2024/0417',
  sector: 'Manufacturing and tailoring',
  region: 'Dar es Salaam',
  consent: true,
}

export const SECTORS = [
  'Retail shop',
  'Food and restaurant',
  'Manufacturing and tailoring',
  'Agriculture and livestock',
  'Beauty and personal care',
  'Transport and logistics',
  'Services',
]

export const REGIONS = [
  'Arusha', 'Dar es Salaam', 'Dodoma', 'Geita', 'Iringa', 'Kagera', 'Katavi', 'Kigoma', 'Kilimanjaro', 'Lindi',
  'Manyara', 'Mara', 'Mbeya', 'Morogoro', 'Mtwara', 'Mwanza', 'Njombe', 'Pemba North', 'Pemba South', 'Pwani',
  'Rukwa', 'Ruvuma', 'Shinyanga', 'Simiyu', 'Singida', 'Songwe', 'Tabora', 'Tanga', 'Unguja North',
  'Unguja South', 'Mjini Magharibi',
]

export const sampleMonths = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
export const sampleMoneyIn = [1180000, 1320000, 1250000, 1410000, 1640000, 1520000]
export const sampleMoneyOut = [820000, 910000, 880000, 960000, 1100000, 1010000]

export const sampleExtraction = {
  linesRead: 232,
  verifiedShare: 0.68,
  mixedMoney: true,
  savingsFound: false,
  rows: [
    { id: 't1', date: '02 Sep', description: 'Sale: 3 dresses, Mama Salma', direction: 'in', amount: 95000, source: 'ledger', confidence: 0.93 },
    { id: 't2', date: '03 Sep', description: 'Mobile money from J. Mushi', direction: 'in', amount: 60000, source: 'mobile', confidence: 0.99 },
    { id: 't3', date: '04 Sep', description: 'Fabric, Kariakoo wholesaler', direction: 'out', amount: 180000, source: 'mobile', confidence: 0.99 },
    { id: 't4', date: '06 Sep', description: 'Sale: 5 school uniforms', direction: 'in', amount: 150000, source: 'ledger', confidence: 0.71, flag: 'unclear' },
    { id: 't5', date: '07 Sep', description: 'LUKU electricity token', direction: 'out', amount: 20000, source: 'mobile', confidence: 0.99 },
    { id: 't6', date: '09 Sep', description: 'Mobile money from Neema K.', direction: 'in', amount: 45000, source: 'mobile', confidence: 0.99 },
    { id: 't7', date: '09 Sep', description: 'Neema K., 45,000', direction: 'in', amount: 45000, source: 'ledger', confidence: 0.88, flag: 'duplicate' },
    { id: 't8', date: '12 Sep', description: 'Shop rent, September', direction: 'out', amount: 120000, source: 'mobile', confidence: 0.99 },
  ],
}
