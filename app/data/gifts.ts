// Gift-coin catalog + purchase bundles. Mirrors the `gifts` table seeded in
// migration 20260810_gift_coins.sql (slug/emoji/cost must stay in sync).
// Accounting: 1 gift coin = 10 cents reference value; a recipient keeps 2/3 of
// each gift's coin value and can cash out once earnings reach EUR 10.

export type Gift = { slug: string; name: string; emoji: string; cost: number; tier: number }

export const GIFTS: Gift[] = [
  // Tier 1 — 1 coin
  { slug: 'hello', name: 'Hello', emoji: '👋', cost: 1, tier: 1 },
  { slug: 'smile', name: 'Smile', emoji: '😊', cost: 1, tier: 1 },
  { slug: 'wink', name: 'Wink', emoji: '😉', cost: 1, tier: 1 },
  { slug: 'kiss', name: 'Kiss', emoji: '😘', cost: 1, tier: 1 },
  { slug: 'heart', name: 'Heart', emoji: '❤️', cost: 1, tier: 1 },
  { slug: 'rose', name: 'Rose', emoji: '🌹', cost: 1, tier: 1 },
  { slug: 'lips', name: 'Lips', emoji: '💋', cost: 1, tier: 1 },
  { slug: 'sparkle', name: 'Sparkle', emoji: '✨', cost: 1, tier: 1 },
  { slug: 'thumbs-up', name: 'Thumbs Up', emoji: '👍', cost: 1, tier: 1 },
  { slug: 'coffee', name: 'Coffee', emoji: '☕', cost: 1, tier: 1 },
  // Tier 2 — 2 coins
  { slug: 'lipstick', name: 'Lipstick', emoji: '💄', cost: 2, tier: 2 },
  { slug: 'heels', name: 'High Heels', emoji: '👠', cost: 2, tier: 2 },
  { slug: 'cocktail', name: 'Cocktail', emoji: '🍸', cost: 2, tier: 2 },
  { slug: 'wine', name: 'Wine', emoji: '🍷', cost: 2, tier: 2 },
  { slug: 'chocolate', name: 'Chocolate', emoji: '🍫', cost: 2, tier: 2 },
  { slug: 'teddy', name: 'Teddy Bear', emoji: '🧸', cost: 2, tier: 2 },
  { slug: 'balloon', name: 'Balloon', emoji: '🎈', cost: 2, tier: 2 },
  { slug: 'music', name: 'Music', emoji: '🎵', cost: 2, tier: 2 },
  { slug: 'sunglasses', name: 'Sunglasses', emoji: '🕶️', cost: 2, tier: 2 },
  { slug: 'love-letter', name: 'Love Letter', emoji: '💌', cost: 2, tier: 2 },
  // Tier 3 — 3 coins
  { slug: 'bouquet', name: 'Bouquet', emoji: '💐', cost: 3, tier: 3 },
  { slug: 'lovebirds', name: 'Lovebirds', emoji: '🕊️', cost: 3, tier: 3 },
  { slug: 'champagne', name: 'Champagne', emoji: '🍾', cost: 3, tier: 3 },
  { slug: 'cake', name: 'Cake', emoji: '🎂', cost: 3, tier: 3 },
  { slug: 'giftbox', name: 'Gift Box', emoji: '🎁', cost: 3, tier: 3 },
  { slug: 'crown', name: 'Crown', emoji: '👑', cost: 3, tier: 3 },
  { slug: 'hearts', name: 'Revolving Hearts', emoji: '💞', cost: 3, tier: 3 },
  { slug: 'cupid', name: 'Cupid', emoji: '💘', cost: 3, tier: 3 },
  { slug: 'fireworks', name: 'Fireworks', emoji: '🎆', cost: 3, tier: 3 },
  { slug: 'shooting-star', name: 'Shooting Star', emoji: '💫', cost: 3, tier: 3 },
  // Tier 4 — 4 coins
  { slug: 'diamond', name: 'Diamond', emoji: '💎', cost: 4, tier: 4 },
  { slug: 'ring', name: 'Diamond Ring', emoji: '💍', cost: 4, tier: 4 },
  { slug: 'sportscar', name: 'Sports Car', emoji: '🏎️', cost: 4, tier: 4 },
  { slug: 'yacht', name: 'Yacht', emoji: '🛥️', cost: 4, tier: 4 },
  { slug: 'jet', name: 'Private Jet', emoji: '✈️', cost: 4, tier: 4 },
  { slug: 'cheers', name: 'Champagne Toast', emoji: '🥂', cost: 4, tier: 4 },
  { slug: 'ribbon', name: 'Luxury Ribbon', emoji: '🎀', cost: 4, tier: 4 },
  { slug: 'castle', name: 'Castle', emoji: '🏰', cost: 4, tier: 4 },
  { slug: 'grand-fireworks', name: 'Grand Fireworks', emoji: '🎇', cost: 4, tier: 4 },
  { slug: 'trophy', name: 'Trophy', emoji: '🏆', cost: 4, tier: 4 },
]

export const GIFT_BY_SLUG: Record<string, Gift> = Object.fromEntries(GIFTS.map(g => [g.slug, g]))

export type Bundle = { id: string; coins: number; price: number; label: string; featured?: boolean }

// id must match the switch in /api/gifts/purchase.
export const GIFT_BUNDLES: Bundle[] = [
  { id: 'b1', coins: 15, price: 2, label: 'Starter' },
  { id: 'b2', coins: 45, price: 5, label: 'Popular' },
  { id: 'b3', coins: 110, price: 10, label: 'Value', featured: true },
  { id: 'b4', coins: 240, price: 20, label: 'Ultimate' },
]

export const GIFT_BUNDLE_BY_ID: Record<string, Bundle> = Object.fromEntries(GIFT_BUNDLES.map(b => [b.id, b]))
