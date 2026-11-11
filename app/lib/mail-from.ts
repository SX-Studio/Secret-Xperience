// Single source of truth for who SecretXperience mail comes from.
//
// Three addresses had drifted across the routes — hello@, noreply@ and no-reply@ —
// so the same platform reached people under three identities. Recipients read the From
// line as identity, and inconsistent senders are also what spam filters score against.
//
// Env-overridable so the address can change without a code deploy. The default is an
// address on the domain that is actually DKIM/SPF-verified in Resend.
export const MAIL_FROM = (process.env.EMAIL_FROM || 'SecretXperience <no-reply@secretxperience.eu>').trim()

// People reply to no-reply addresses regardless of what it says. Point those replies at
// a mailbox that is read instead of letting them bounce into nothing.
export const MAIL_REPLY_TO = (process.env.EMAIL_REPLY_TO || 'support@secretxperience.eu').trim()
