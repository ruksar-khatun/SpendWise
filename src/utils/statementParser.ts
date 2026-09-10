import { CategoryName, TransactionType } from '../types';

export interface ParsedTransactionPreview {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  merchant: string;
  amount: number;
  type: TransactionType;
  category: CategoryName | string;
  confidence: 'high' | 'medium' | 'default';
  selected: boolean;
}

// Category keyword mappings for Indian Banks & UPI merchants
const CATEGORY_RULES: { category: CategoryName; keywords: string[] }[] = [
  {
    category: 'Food',
    keywords: [
      'swiggy', 'zomato', 'starbucks', 'blue tokai', 'mcdonald', 'burger king',
      'subway', 'domino', 'pizza', 'kfc', 'chai', 'tea', 'coffee', 'cafe',
      'blinkit', 'zepto', 'instamart', 'groceries', 'grocery', 'supermarket',
      'nature basket', 'dmart', 'd-mart', 'bakery', 'restaurant', 'sweets', 'eats',
      'bigbasket', 'food'
    ],
  },
  {
    category: 'Transport',
    keywords: [
      'uber', 'ola', 'rapido', 'metro', 'railway', 'irctc', 'petrol', 'fuel',
      'shell', 'indian oil', 'hpcl', 'bpcl', 'fastag', 'toll', 'parking',
      'auto', 'cab', 'flight', 'indigo', 'air india', 'redbus', 'transport'
    ],
  },
  {
    category: 'Shopping',
    keywords: [
      'amazon', 'flipkart', 'myntra', 'ajio', 'zara', 'h&m', 'uniqlo',
      'croma', 'reliance digital', 'apple', 'nike', 'adidas', 'clothing',
      'mall', 'retail', 'meesho', 'nykaa', 'tata cliq', 'shopping'
    ],
  },
  {
    category: 'Bills',
    keywords: [
      'electricity', 'bescom', 'cesc', 'tneb', 'power', 'airtel', 'jio',
      'vodafone', 'vi ', 'broadband', 'wifi', 'fiber', 'adani gas', 'gas',
      'billdesk', 'water', 'utility', 'recharge', 'dth', 'tata play', 'bill'
    ],
  },
  {
    category: 'Entertainment',
    keywords: [
      'netflix', 'spotify', 'prime video', 'hotstar', 'disney', 'pvr', 'inox',
      'cinema', 'movie', 'bookmyshow', 'steam', 'playstation', 'gaming',
      'youtube', 'audible', 'zee5', 'sonyliv'
    ],
  },
  {
    category: 'Health',
    keywords: [
      'apollo', 'pharmacy', 'chemist', 'cult', 'cult.fit', 'gym', 'fitness',
      '1mg', 'practo', 'hospital', 'clinic', 'doctor', 'medplus', 'lab',
      'diagnostics', 'pharmeasy', 'health'
    ],
  },
  {
    category: 'Salary',
    keywords: [
      'salary', 'payroll', 'techcorp', 'infotech', 'wipro', 'infosys', 'tcs',
      'stipend', 'monthly pay', 'salary credit'
    ],
  },
  {
    category: 'Freelance',
    keywords: ['freelance', 'consulting', 'upwork', 'fiverr', 'client payment', 'contract'],
  },
  {
    category: 'Investments',
    keywords: ['zerodha', 'groww', 'coin', 'mutual fund', 'sip', 'upstox', 'dividend', 'interest'],
  },
];

/**
 * Sanitizes bank narration into clean, human-readable merchant names.
 * Handles Indian bank formats (HDFC, SBI, ICICI, Axis, Kotak) and UPI strings.
 */
export const sanitizeMerchantName = (rawText: string): { cleanDescription: string; merchant: string } => {
  let text = rawText.trim();

  // Strip bank narration prefixes:
  // e.g. "TO TRANSFER-UPI/DR/62912345/SWIGGY/ICICI/" -> "SWIGGY"
  // e.g. "NEFT CR-TECHCORP-SALARY-12345" -> "TECHCORP SALARY"
  // e.g. "ACH D-BESCOM ELECTRICITY BILL-98765" -> "BESCOM ELECTRICITY BILL"
  // e.g. "POS 4012XXXXXXXX1234 STARBUCKS INDIRANAGAR" -> "STARBUCKS INDIRANAGAR"
  text = text.replace(/^(TO\s+TRANSFER[-–]?|TRANSFER[-–]?|BY\s+TRANSFER[-–]?)/gi, '');
  text = text.replace(/^(NEFT|RTGS|IMPS|ACH|ECS|NACH)\s*(CR|DR)?[-–\s]+/gi, '');
  text = text.replace(/^POS\s+[xX0-9*\-]+\s+/gi, '');
  text = text.replace(/UPI\s*[-–\/]\s*(DR|CR)?\s*[-–\/]?\s*\d*[-–\/]?/gi, '');

  // Strip UPI handles (@okhdfcbank, @okaxis, @oksbi, @paytm, etc.)
  text = text.replace(/[\w.-]+@(okhdfcbank|okaxis|oksbi|okicici|paytm|ybl|ibl|upi|axl)/gi, '');

  // Strip long reference numbers and alphanumeric transaction hashes
  text = text.replace(/\b[0-9]{8,16}\b/g, '');
  text = text.replace(/\b[A-Za-z0-9]{12,20}\b/g, '');

  // Strip phone numbers
  text = text.replace(/\b[6-9]\d{9}\b/g, '');

  // Strip account number references
  text = text.replace(/\b(A\/c|Acct|Acc|A\/C|Account)?\s*(no\.?|#)?\s*[xX*]{2,}\d{2,4}\b/gi, '');

  // Clean trailing/leading delimiters and excessive spaces
  text = text.replace(/[_\-/|\\:]+/g, ' ').replace(/\s+/g, ' ').trim();

  if (!text || text.length < 2) {
    text = 'Bank Transaction';
  }

  // Capitalize properly
  const words = text
    .split(' ')
    .filter(w => w.length > 0 && !/^\d+$/.test(w))
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

  const cleanDescription = words.slice(0, 5).join(' ') || 'Bank Transaction';
  const merchant = words.slice(0, 2).join(' ') || 'Merchant';

  return { cleanDescription, merchant };
};

/**
 * Automatically predicts category based on cleaned merchant and description.
 */
export const detectCategory = (
  description: string,
  merchant: string,
  type: TransactionType
): { category: CategoryName | string; confidence: 'high' | 'medium' | 'default' } => {
  const combined = `${description} ${merchant}`.toLowerCase();

  if (type === 'income') {
    if (combined.includes('salary') || combined.includes('payroll') || combined.includes('techcorp')) return { category: 'Salary', confidence: 'high' };
    if (combined.includes('freelance') || combined.includes('client')) return { category: 'Freelance', confidence: 'high' };
    if (combined.includes('dividend') || combined.includes('interest') || combined.includes('zerodha')) return { category: 'Investments', confidence: 'high' };
    return { category: 'Salary', confidence: 'medium' };
  }

  for (const rule of CATEGORY_RULES) {
    for (const keyword of rule.keywords) {
      if (combined.includes(keyword)) {
        return { category: rule.category, confidence: 'high' };
      }
    }
  }

  return { category: 'Other', confidence: 'default' };
};

/**
 * Normalizes different date representations (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD, DD-MM-YYYY) into YYYY-MM-DD.
 */
export const normalizeDate = (rawDate: string): string => {
  const trimmed = rawDate.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const dmyMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return new Date().toISOString().split('T')[0];
};

/**
 * Parses CSV lines respecting quoted fields containing commas.
 */
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};

/**
 * Universal CSV Parser for Bank Statements (HDFC, SBI, ICICI, Axis, Kotak) & UPI exports.
 */
export const parseStatementCSV = (csvContent: string): ParsedTransactionPreview[] => {
  const lines = csvContent
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (lines.length < 2) return [];

  // Find the header row (sometimes bank statements have 1-3 lines of metadata above table)
  let headerRowIndex = 0;
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const row = lines[i].toLowerCase();
    if (
      (row.includes('date') || row.includes('txn')) &&
      (row.includes('narration') || row.includes('desc') || row.includes('particular') || row.includes('amount') || row.includes('withdrawal') || row.includes('debit'))
    ) {
      headerRowIndex = i;
      break;
    }
  }

  const headers = parseCSVLine(lines[headerRowIndex]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

  // Detect column indexes across Indian and international bank conventions
  let dateIdx = headers.findIndex(h => h.includes('date') || h.includes('time') || h.includes('txndate') || h.includes('valuedate'));
  let descIdx = headers.findIndex(h => h.includes('desc') || h.includes('narration') || h.includes('particular') || h.includes('remark') || h.includes('detail') || h.includes('merchant') || h.includes('payee'));
  let withdrawalIdx = headers.findIndex(h => h.includes('withdrawal') || h.includes('debit') || h.includes('dr') || h.includes('paidout'));
  let depositIdx = headers.findIndex(h => h.includes('deposit') || h.includes('credit') || h.includes('cr') || h.includes('paidin'));
  let amountIdx = headers.findIndex(h => h.includes('amount') || h.includes('total'));
  let typeIdx = headers.findIndex(h => h.includes('type') || h.includes('status') || h.includes('crdr'));

  if (dateIdx === -1) dateIdx = 0;
  if (descIdx === -1) descIdx = 1;

  const results: ParsedTransactionPreview[] = [];

  for (let i = headerRowIndex + 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 2) continue;

    const rawDate = cols[dateIdx] || '';
    const rawDesc = cols[descIdx] || 'Bank Transaction';
    
    // Check withdrawal vs deposit columns
    let type: TransactionType = 'expense';
    let amount = 0;

    const rawWithdrawal = withdrawalIdx >= 0 ? cols[withdrawalIdx] : '';
    const rawDeposit = depositIdx >= 0 ? cols[depositIdx] : '';
    const rawAmount = amountIdx >= 0 ? cols[amountIdx] : '';
    const rawType = typeIdx >= 0 ? cols[typeIdx].toLowerCase() : '';

    const withdrawalVal = parseFloat(rawWithdrawal.replace(/[^0-9.]/g, ''));
    const depositVal = parseFloat(rawDeposit.replace(/[^0-9.]/g, ''));
    const generalAmountVal = parseFloat(rawAmount.replace(/[^0-9.]/g, ''));

    if (!isNaN(depositVal) && depositVal > 0) {
      type = 'income';
      amount = depositVal;
    } else if (!isNaN(withdrawalVal) && withdrawalVal > 0) {
      type = 'expense';
      amount = withdrawalVal;
    } else if (!isNaN(generalAmountVal) && generalAmountVal > 0) {
      amount = generalAmountVal;
      if (rawType.includes('cr') || rawType.includes('credit') || rawType.includes('deposit') || rawType.includes('received')) {
        type = 'income';
      } else {
        type = 'expense';
      }
    }

    if (amount <= 0 || isNaN(amount)) continue;

    const date = normalizeDate(rawDate);
    const { cleanDescription, merchant } = sanitizeMerchantName(rawDesc);
    const { category, confidence } = detectCategory(cleanDescription, merchant, type);

    results.push({
      id: `preview-${Date.now()}-${i}`,
      date,
      description: cleanDescription,
      merchant,
      amount,
      type,
      category,
      confidence,
      selected: true,
    });
  }

  return results;
};

/**
 * 🏦 HDFC Bank Statement Sample
 */
export const SAMPLE_HDFC_BANK_CSV = `Date,Narration,Chq/Ref No,Value Dt,Withdrawal Amt.,Deposit Amt.,Closing Balance
01/09/2026,NEFT CR-TECHCORP PVT LTD-SALARY-CREDIT,N0901234,01/09/2026,,50000.00,52340.00
02/09/2026,UPI-SWIGGY FOOD DELIVERY-BANGALORE,UPI0902123,02/09/2026,420.00,,51920.00
03/09/2026,UPI-UBER RIDE MUMBAI COMMUTE,UPI0903124,03/09/2026,180.00,,51740.00
04/09/2026,POS 4012XXXXXXXX1234 STARBUCKS COFFEE,POS090412,04/09/2026,390.00,,51350.00
05/09/2026,ACH D-BESCOM ELECTRICITY MONTHLY BILL,ACH09051,05/09/2026,1850.00,,49500.00
05/09/2026,UPI-AMAZON INDIA SHOPPING ELECTRONICS,UPI090678,05/09/2026,2499.00,,47001.00
06/09/2026,NETFLIX INDIA RECURRING SUBSCRIPTION,SUB09069,06/09/2026,649.00,,46352.00
07/09/2026,UPI-APOLLO PHARMACY HEALTH MEDICINES,UPI090712,07/09/2026,520.00,,45832.00
07/09/2026,UPI-ZEPTO INSTANT GROCERIES AND VEGGIES,UPI090834,07/09/2026,780.00,,45052.00
08/09/2026,UPI-AIRTEL FIBER HIGH SPEED BROADBAND,UPI090945,08/09/2026,999.00,,44053.00
08/09/2026,UPI-ZARA CLOTHING WORK APPAREL,UPI091056,08/09/2026,3450.00,,40603.00`;

/**
 * 🏛️ State Bank of India (SBI) Statement Sample
 */
export const SAMPLE_SBI_BANK_CSV = `Txn Date,Description,Ref No./Cheque No.,Debit,Credit,Balance
01-09-2026,SALARY BY TECHCORP INDIA LTD,SBIN090123,,50000.00,50840.00
02-09-2026,TO TRANSFER-UPI/DR/62912345/SWIGGY EATS/ICICI/,TRANSFER-12,420.00,,50420.00
03-09-2026,TO TRANSFER-UPI/DR/62912346/UBER INDIA/HDFC/,TRANSFER-13,280.00,,50140.00
04-09-2026,TO TRANSFER-UPI/DR/62912347/BLINKIT GROCERY STORE/,TRANSFER-14,650.00,,49490.00
05-09-2026,TO TRANSFER-UPI/DR/62912348/BESCOM POWER UTILITY/,TRANSFER-15,1640.00,,47850.00
06-09-2026,TO TRANSFER-UPI/DR/62912349/AMAZON INDIA RETAIL/,TRANSFER-16,1899.00,,45951.00
07-09-2026,TO TRANSFER-UPI/DR/62912350/CULT FIT FITNESS GYM/,TRANSFER-17,2500.00,,43451.00
08-09-2026,TO TRANSFER-UPI/DR/62912351/METRO RAIL PASS CARD/,TRANSFER-18,500.00,,42951.00`;

/**
 * 📱 Google Pay / UPI Statement Sample
 */
export const SAMPLE_GOOGLE_PAY_CSV = `Date,Description,Amount,Transaction Type
2026-09-08,Swiggy Delivery UPI/6291/swiggy@icici,540,Debit
2026-09-08,Uber India Systems cab ride Mumbai,280,Debit
2026-09-07,Starbucks Coffee Indiranagar,390,Debit
2026-09-07,Blinkit Instant Groceries vegetables,680,Debit
2026-09-06,Amazon India order wireless headphones,2499,Debit
2026-09-05,Electricity BESCOM monthly power bill,1640,Debit
2026-09-05,Blue Tokai Coffee Roasters beans,450,Debit
2026-09-04,Apollo Pharmacy medicines and vitamins,480,Debit
2026-09-04,Metro Rail smart card recharge kiosk,500,Debit
2026-09-03,Zara Clothing store autumn jacket,3200,Debit
2026-09-02,BookMyShow PVR Inox cinema weekend,650,Debit
2026-09-01,TechCorp Pvt Ltd Monthly Salary Credit,50000,Credit`;
