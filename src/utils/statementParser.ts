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

// Category keyword mappings for Indian UPI / GPay merchants
const CATEGORY_RULES: { category: CategoryName; keywords: string[] }[] = [
  {
    category: 'Food',
    keywords: [
      'swiggy', 'zomato', 'starbucks', 'blue tokai', 'mcdonald', 'burger king',
      'subway', 'domino', 'pizza', 'kfc', 'chai', 'tea', 'coffee', 'cafe',
      'blinkit', 'zepto', 'instamart', 'groceries', 'grocery', 'supermarket',
      'nature basket', 'dmart', 'd-mart', 'bakery', 'restaurant', 'sweets', 'eats'
    ],
  },
  {
    category: 'Transport',
    keywords: [
      'uber', 'ola', 'rapido', 'metro', 'railway', 'irctc', 'petrol', 'fuel',
      'shell', 'indian oil', 'hpcl', 'bpcl', 'fastag', 'toll', 'parking',
      'auto', 'cab', 'flight', 'indigo', 'air india', 'redbus'
    ],
  },
  {
    category: 'Shopping',
    keywords: [
      'amazon', 'flipkart', 'myntra', 'ajio', 'zara', 'h&m', 'uniqlo',
      'croma', 'reliance digital', 'apple', 'nike', 'adidas', 'clothing',
      'mall', 'retail', 'meesho', 'nykaa', 'tata cliq'
    ],
  },
  {
    category: 'Bills',
    keywords: [
      'electricity', 'bescom', 'cesc', 'tneb', 'power', 'airtel', 'jio',
      'vodafone', 'vi ', 'broadband', 'wifi', 'fiber', 'adani gas', 'gas',
      'billdesk', 'water', 'utility', 'recharge', 'dth', 'tata play'
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
      'diagnostics', 'pharmeasy'
    ],
  },
  {
    category: 'Salary',
    keywords: [
      'salary', 'payroll', 'techcorp', 'infotech', 'wipro', 'infosys', 'tcs',
      'stipend', 'monthly pay'
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
 * Sanitizes merchant name by stripping phone numbers, UPI VPA handles (@okhdfc, @okaxis), and account numbers.
 */
export const sanitizeMerchantName = (rawText: string): { cleanDescription: string; merchant: string } => {
  let text = rawText.trim();

  // Strip UPI VPA suffix like /UPI/123456/CR/xyz@okaxis or 9876543210@paytm
  text = text.replace(/\/UPI\/[A-Za-z0-9]+/gi, '');
  text = text.replace(/UPI-[A-Za-z0-9\-]+/gi, '');
  text = text.replace(/[\w.-]+@(okhdfcbank|okaxis|oksbi|okicici|paytm|ybl|ibl|upi)/gi, '');

  // Strip 10-digit phone numbers
  text = text.replace(/\b[6-9]\d{9}\b/g, '');

  // Strip Account number references like A/C ...4821 or XX1234
  text = text.replace(/\b(A\/c|Acct|Acc|A\/C|Account)?\s*(no\.?|#)?\s*[xX*]{2,}\d{2,4}\b/gi, '');

  // Clean trailing/leading dashes, slashes, or double spaces
  text = text.replace(/[_\-/|\\]+/g, ' ').replace(/\s+/g, ' ').trim();

  if (!text) {
    text = 'UPI Transaction';
  }

  // Derive short merchant name
  const words = text.split(' ');
  const merchant = words.slice(0, 3).join(' ');

  return { cleanDescription: text, merchant };
};

/**
 * Automatically predicts the most accurate category based on description and merchant keywords.
 */
export const detectCategory = (
  description: string,
  merchant: string,
  type: TransactionType
): { category: CategoryName | string; confidence: 'high' | 'medium' | 'default' } => {
  if (type === 'income') {
    const lower = `${description} ${merchant}`.toLowerCase();
    if (lower.includes('salary') || lower.includes('payroll')) return { category: 'Salary', confidence: 'high' };
    if (lower.includes('freelance') || lower.includes('client')) return { category: 'Freelance', confidence: 'high' };
    if (lower.includes('dividend') || lower.includes('interest') || lower.includes('zerodha')) return { category: 'Investments', confidence: 'high' };
    return { category: 'Salary', confidence: 'medium' };
  }

  const combined = `${description} ${merchant}`.toLowerCase();

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
 * Normalizes different date representations (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD, Month DD YYYY) into YYYY-MM-DD.
 */
export const normalizeDate = (rawDate: string): string => {
  const trimmed = rawDate.trim();

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Parse using Date constructor fallback
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  // Fallback to current date
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
        i++; // skip escaped quote
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
 * Main CSV Parser for Google Pay, PhonePe, and UPI bank exports.
 */
export const parseStatementCSV = (csvContent: string): ParsedTransactionPreview[] => {
  const lines = csvContent
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

  // Detect column indexes
  let dateIdx = headers.findIndex(h => h.includes('date') || h.includes('time'));
  let descIdx = headers.findIndex(h => h.includes('desc') || h.includes('narration') || h.includes('detail') || h.includes('merchant') || h.includes('payee') || h.includes('name'));
  let amountIdx = headers.findIndex(h => h.includes('amount') || h.includes('withdrawal') || h.includes('debit') || h.includes('total'));
  let creditIdx = headers.findIndex(h => h.includes('credit') || h.includes('deposit'));
  let typeIdx = headers.findIndex(h => h.includes('type') || h.includes('status') || h.includes('crdr'));

  if (dateIdx === -1) dateIdx = 0;
  if (descIdx === -1) descIdx = 1;
  if (amountIdx === -1) amountIdx = 2;

  const results: ParsedTransactionPreview[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 2) continue;

    const rawDate = cols[dateIdx] || '';
    const rawDesc = cols[descIdx] || 'Payment';
    let rawAmount = cols[amountIdx] || '0';
    let rawCredit = creditIdx >= 0 ? cols[creditIdx] : '';
    let rawType = typeIdx >= 0 ? cols[typeIdx].toLowerCase() : '';

    // Determine type & clean amount
    let type: TransactionType = 'expense';
    let cleanAmountStr = rawAmount.replace(/[^0-9.]/g, '');

    if (rawCredit && parseFloat(rawCredit.replace(/[^0-9.]/g, '')) > 0) {
      type = 'income';
      cleanAmountStr = rawCredit.replace(/[^0-9.]/g, '');
    } else if (rawType.includes('cr') || rawType.includes('credit') || rawType.includes('deposit') || rawType.includes('received')) {
      type = 'income';
    }

    const amount = parseFloat(cleanAmountStr);
    if (isNaN(amount) || amount <= 0) continue;

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
 * Realistic synthetic Google Pay UPI statement for safe, 1-click testing.
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
