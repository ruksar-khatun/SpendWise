import dns from 'dns/promises';

export interface EmailVerificationResult {
  valid: boolean;
  reason?: string;
  domain?: string;
}

/**
 * Validates that an email address has a valid format, is not a disposable or dummy domain,
 * and actively verifies via DNS that the domain exists on the internet and has mail servers.
 */
export async function verifyEmailExistence(email: string): Promise<EmailVerificationResult> {
  if (!email || typeof email !== 'string') {
    return { valid: false, reason: 'Email address is required.' };
  }

  const cleanEmail = email.trim().toLowerCase();

  // 1. Strict RFC 5322 regex validation
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(cleanEmail)) {
    return {
      valid: false,
      reason: 'Please enter a valid email address format (e.g. name@gmail.com).',
    };
  }

  const parts = cleanEmail.split('@');
  if (parts.length !== 2) {
    return { valid: false, reason: 'Invalid email address.' };
  }

  const [localPart, domain] = parts;

  // Local part checks
  if (localPart.length < 2) {
    return { valid: false, reason: 'Email username must be at least 2 characters.' };
  }
  if (localPart.length > 64) {
    return { valid: false, reason: 'Email username is too long.' };
  }

  // Domain structure checks
  const domainParts = domain.split('.');
  if (domainParts.length < 2) {
    return { valid: false, reason: 'Email domain must include a valid extension (e.g. .com, .org, .in).' };
  }

  const tld = domainParts[domainParts.length - 1];
  if (!tld || tld.length < 2 || !/^[a-z]+$/.test(tld)) {
    return { valid: false, reason: 'Email domain extension is invalid.' };
  }

  // 2. High-speed whitelist for prominent legitimate email providers
  const knownGoodDomains = new Set([
    'gmail.com',
    'googlemail.com',
    'google.com',
    'outlook.com',
    'hotmail.com',
    'live.com',
    'msn.com',
    'yahoo.com',
    'yahoo.co.in',
    'icloud.com',
    'me.com',
    'mac.com',
    'proton.me',
    'protonmail.com',
    'zoho.com',
    'aol.com',
    'mail.com',
    'gmx.com',
    'yandex.com',
  ]);

  if (knownGoodDomains.has(domain)) {
    return { valid: true, domain };
  }

  // 3. Blocklist of disposable, temporary, and placeholder domains
  const blockedDomains = new Set([
    'mailinator.com',
    '10minutemail.com',
    'tempmail.com',
    'guerrillamail.com',
    'sharklasers.com',
    'yopmail.com',
    'trashmail.com',
    'temp-mail.org',
    'fakeinbox.com',
    'dispostable.com',
    'throwawaymail.com',
    'getairmail.com',
    'fakemail.net',
    'fakemail.com',
    'test.com',
    'fake.com',
    'example.com',
    'example.org',
    'example.net',
    'asdf.com',
    'invalid.com',
    'nonexistent.com',
    'nobody.com',
    'nowhere.com',
  ]);

  if (blockedDomains.has(domain)) {
    return {
      valid: false,
      reason: 'Disposable, temporary, or placeholder email addresses are not permitted. Please use a real email address.',
    };
  }

  // 4. DNS MX and A record verification
  // Verifies that the domain actually exists on global DNS and accepts mail
  try {
    const res = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=MX`,
      {
        headers: { Accept: 'application/dns-json' },
        signal: AbortSignal.timeout(3500),
      }
    );
    const data: any = await res.json();

    // DNS Status 3 = NXDOMAIN (Domain does not exist)
    if (data.Status === 3) {
      return {
        valid: false,
        reason: `The email domain "@${domain}" does not exist on the internet. Please provide a real email address.`,
      };
    }

    // Check if MX records are present
    if (!data.Answer || data.Answer.length === 0) {
      // If no MX, check if domain has A record (fallback for direct host mail)
      try {
        const aRes = await fetch(
          `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=A`,
          {
            headers: { Accept: 'application/dns-json' },
            signal: AbortSignal.timeout(2500),
          }
        );
        const aData: any = await aRes.json();
        if (aData.Status === 3 || !aData.Answer || aData.Answer.length === 0) {
          return {
            valid: false,
            reason: `The email domain "@${domain}" has no active mail exchange servers and cannot receive email.`,
          };
        }
      } catch {
        return {
          valid: false,
          reason: `The email domain "@${domain}" has no active mail exchange servers and cannot receive email.`,
        };
      }
    }

    return { valid: true, domain };
  } catch {
    // Fallback to local operating system DNS lookup
    try {
      await dns.lookup(domain);
      return { valid: true, domain };
    } catch {
      return {
        valid: false,
        reason: `The email domain "@${domain}" could not be verified on the internet. Please provide a real email address.`,
      };
    }
  }
}
