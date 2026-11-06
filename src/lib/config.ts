// PLACEHOLDERS: the contact details, address and social links below are not real
// yet. Replace them with Mantashaloom's own before launch.
export const site = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || 'Mantashaloom',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, ''),
  tagline: 'Handmade Rugs & Carpets',
  description:
    'Mantashaloom offers hand-knotted and hand-tufted wool and silk rugs, woven by hand in India. Shop traditional, modern and transitional area rugs.',
  email: 'care@mantashaloom.com',
  phone: '+91 00000 00000',
  whatsapp: '+910000000000',
  address: {
    street: '',
    city: '',
    region: '',
    postalCode: '',
    country: 'IN',
  },
  social: {
    instagram: 'https://instagram.com/mantashaloom',
    facebook: 'https://facebook.com/mantashaloom',
    pinterest: 'https://pinterest.com/mantashaloom',
  },
  defaultOgImage: '/og-default.png', // social cards must be raster
};

export const store = {
  currency: process.env.STORE_CURRENCY || 'INR',
  freeShippingAbove: Number(process.env.FREE_SHIPPING_ABOVE || 15000) * 100, // paise
  flatShippingFee: Number(process.env.FLAT_SHIPPING_FEE || 499) * 100, // paise
  gstPercent: Number(process.env.GST_PERCENT || 12),
};
