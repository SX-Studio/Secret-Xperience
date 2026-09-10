import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { ShopHeader, ShopFooter } from '../../ShopChrome'
import { SHOP_ORIGIN, isShopHost } from '../../../lib/domains'

/**
 * Shop-scoped legal pages, served at /terms, /privacy, /shipping and /returns
 * on the storefront (middleware maps those onto this route).
 *
 * The marketplace's own /terms and /privacy cover an advertising platform and
 * do not describe a goods sale, which EU distance-selling rules require to be
 * set out before checkout. These are the sale-side equivalents.
 *
 * TRADER IDENTITY IS INCOMPLETE. Art. 6(1) of the Consumer Rights Directive
 * (2011/83/EU) requires the seller's legal name, geographic address, company
 * registration and VAT number to be given before the customer is bound. Those
 * are marked [TO COMPLETE] below because they are not recorded anywhere in this
 * repository and must not be guessed. Fill them in, and have the set reviewed,
 * before taking orders on this domain.
 */

const DOCS = ['terms', 'privacy', 'shipping', 'returns'] as const
type Doc = (typeof DOCS)[number]

const TRADER = '[TO COMPLETE: registered company name]'
const TRADER_ADDRESS = '[TO COMPLETE: registered address]'
const TRADER_REG = '[TO COMPLETE: company registration number]'
const TRADER_VAT = '[TO COMPLETE: VAT number]'
const SUPPORT_EMAIL = '[TO COMPLETE: support email]'

const TITLES: Record<Doc, string> = {
  terms: 'Terms of Sale',
  privacy: 'Privacy Policy',
  shipping: 'Shipping',
  returns: 'Returns & Right of Withdrawal',
}

const INTROS: Record<Doc, string> = {
  terms: 'The terms on which SecretXperience Boutique sells goods to you.',
  privacy: 'What we collect when you order, why, and what you can ask us to do about it.',
  shipping: 'Where we ship, how long it takes, and how your order arrives.',
  returns: 'Your 14-day right to change your mind, and the one category it does not cover.',
}

type Section = { h: string; p: string[] }

const CONTENT: Record<Doc, Section[]> = {
  terms: [
    { h: 'Who you are buying from', p: [
      `Goods on this site are sold by ${TRADER}, registered at ${TRADER_ADDRESS} (company registration ${TRADER_REG}, VAT ${TRADER_VAT}). You can reach us at ${SUPPORT_EMAIL}.`,
      'Some items are marked as sold by a partner store. Those are fulfilled by that partner under their own terms, and we act only as an introducer — the contract of sale is between you and them.',
    ]},
    { h: 'Age requirement', p: [
      'This is an adult store. You must be 18 or over to place an order. By ordering you confirm that you are.',
    ]},
    { h: 'Prices and payment', p: [
      'Prices are shown in euro and include VAT at the applicable rate. Delivery costs are shown before you confirm the order.',
      'Card payments are processed by Stripe. We do not receive or store your full card details.',
    ]},
    { h: 'Your order', p: [
      'Your order is an offer to buy. The contract is formed when we send you an order confirmation. If an item turns out to be unavailable, or is listed at a clearly incorrect price, we may decline the order and will refund you in full.',
    ]},
    { h: 'Delivery', p: [
      'We deliver across the EU. See our Shipping page for timescales and costs. Risk passes to you when the goods are delivered to you or a carrier you nominated.',
    ]},
    { h: 'Faulty or misdescribed goods', p: [
      'You have a statutory guarantee of conformity of two years from delivery under Directive (EU) 2019/771. If goods are faulty, not as described, or unfit for their purpose, you are entitled to repair, replacement, a price reduction or a refund. This is in addition to, and unaffected by, the withdrawal right on our Returns page.',
    ]},
    { h: 'Complaints and dispute resolution', p: [
      `Write to us first at ${SUPPORT_EMAIL} and we will try to resolve it. If we cannot, EU consumers may use the European Commission's online dispute resolution platform.`,
    ]},
    { h: 'Governing law', p: [
      '[TO COMPLETE: governing law and courts — normally the law of the trader\'s country, without depriving a consumer of the protection of the mandatory rules of their own country of residence.]',
    ]},
  ],
  privacy: [
    { h: 'What we collect when you order', p: [
      'To fulfil an order we process your name, delivery address, email address and the contents of your order. If you have an account we also hold your login identity and order history.',
      'We do not receive your card number. Payment details go directly to Stripe, which acts as an independent controller for payment processing and fraud prevention.',
    ]},
    { h: 'Why we can process it', p: [
      'Order data is processed to perform our contract with you (Art. 6(1)(b) GDPR). Records of sales are kept to meet tax and accounting obligations (Art. 6(1)(c)). Marketing email is sent only with your consent (Art. 6(1)(a)), which you can withdraw at any time.',
    ]},
    { h: 'Discretion', p: [
      'Orders ship in plain outer packaging with no description of contents. The trading name shown on your card or bank statement is [TO COMPLETE: billing descriptor as it appears on statements].',
    ]},
    { h: 'Who else sees it', p: [
      'Our hosting and database providers, our payment processor, and the carrier delivering your parcel. We do not sell your data or share it for third-party advertising.',
      'Order and account data for this store is held separately from any other service operated under the SecretXperience name.',
    ]},
    { h: 'How long we keep it', p: [
      'Order records are kept for as long as tax law requires them, then deleted. Account data is kept until you close your account.',
    ]},
    { h: 'Your rights', p: [
      `You can ask for a copy of your data, correct it, have it deleted, restrict or object to processing, or receive it in portable form. Write to ${SUPPORT_EMAIL}. You may also complain to your national data protection authority.`,
    ]},
  ],
  shipping: [
    { h: 'Where we ship', p: [
      'We ship across the European Union, with Belgium, the Netherlands, Germany, France and Luxembourg as our primary destinations.',
    ]},
    { h: 'How long it takes', p: [
      'Orders are dispatched within one working day and typically arrive in 3–5 working days. You will get a tracking link when your parcel leaves us.',
    ]},
    { h: 'Discreet packaging', p: [
      'Every order ships in plain outer packaging. There is nothing on the outside of the parcel identifying the contents, the store or the nature of the goods.',
    ]},
    { h: 'Costs', p: [
      'Delivery cost is calculated at checkout and shown in full before you confirm and pay. [TO COMPLETE: shipping rates and any free-delivery threshold.]',
    ]},
    { h: 'If your parcel does not arrive', p: [
      `Contact us at ${SUPPORT_EMAIL}. Under EU rules, if we have not delivered within 30 days you may cancel and receive a full refund.`,
    ]},
  ],
  returns: [
    { h: 'Your 14-day right to withdraw', p: [
      'Under the Consumer Rights Directive (2011/83/EU) you may withdraw from your purchase within 14 days of receiving the goods, without giving a reason. You then have a further 14 days to send them back.',
      `To withdraw, tell us in a clear statement — email ${SUPPORT_EMAIL} is enough. You do not have to use a particular form.`,
    ]},
    { h: 'The exception for sealed intimate goods', p: [
      'Article 16(e) of that Directive removes the withdrawal right for sealed goods which are not suitable for return for health protection or hygiene reasons, once the seal has been broken.',
      'That applies to most intimate products in this store. If the seal is intact and unbroken you can return the item; once it has been opened you cannot. This does not affect your rights if the item is faulty or not as described.',
    ]},
    { h: 'Refunds', p: [
      'We refund within 14 days of receiving the goods back, or of proof that you sent them, using the same payment method you used. We refund the standard delivery cost as well as the price of the goods.',
    ]},
    { h: 'Return postage', p: [
      'You pay the cost of returning the goods unless the item is faulty or we sent the wrong thing, in which case we cover it.',
    ]},
    { h: 'Faulty goods', p: [
      'Separately from withdrawal, you have a two-year guarantee of conformity. If something is faulty, tell us and we will repair, replace or refund it.',
    ]},
  ],
}

export function generateStaticParams() {
  return DOCS.map(doc => ({ doc }))
}

export async function generateMetadata({ params }: { params: { doc: string } }) {
  if (!DOCS.includes(params.doc as Doc)) return {}
  const doc = params.doc as Doc
  return {
    title: `${TITLES[doc]} | SecretXperience Boutique`,
    description: INTROS[doc],
    alternates: { canonical: `${SHOP_ORIGIN}/${doc}` },
  }
}

export default function ShopLegalPage({ params }: { params: { doc: string } }) {
  if (!DOCS.includes(params.doc as Doc)) notFound()
  const doc = params.doc as Doc
  const standalone = isShopHost(headers().get('host'))

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--t)', fontFamily: 'var(--sans)' }}>
      <ShopHeader standalone={standalone} back={{ href: standalone ? '/' : '/shop', label: 'The Boutique' }} />

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.9rem,4vw,2.6rem)', fontWeight: 400, letterSpacing: '-0.01em', marginBottom: '0.6rem' }}>
          {TITLES[doc]}
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--t2)', lineHeight: 1.7, marginBottom: '2.5rem' }}>{INTROS[doc]}</p>

        {CONTENT[doc].map(section => (
          <section key={section.h} style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '19px', fontWeight: 400, color: 'var(--gold)', marginBottom: '0.7rem' }}>
              {section.h}
            </h2>
            {section.p.map((para, i) => (
              <p key={i} style={{ fontSize: '14px', color: 'var(--t2)', lineHeight: 1.8, marginBottom: '0.8rem' }}>{para}</p>
            ))}
          </section>
        ))}

        <p style={{ fontSize: '12px', color: 'var(--t3)', borderTop: '0.5px solid var(--b)', paddingTop: '1.5rem', marginTop: '2.5rem' }}>
          Adults only (18+). These terms cover the sale of goods by the Boutique.
        </p>
      </div>

      <ShopFooter standalone={standalone} />
    </div>
  )
}
