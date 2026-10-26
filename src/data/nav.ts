export interface NavLink {
  label: string;
  href: string;
}
export interface NavGroup {
  label: string;
  href?: string;
  children?: NavLink[];
}

export const experiences: NavLink[] = [
  { label: 'Cultural Journeys', href: '/cultural-journeys.html' },
  { label: 'Trekking', href: '/trekking.html' },
  { label: 'Wellness', href: '/#experiences' },
  { label: 'Festivals', href: '/festivals.html' },
  { label: 'Adventure', href: '/adventures.html' },
];

export const information: NavLink[] = [
  { label: 'Bhutan Travel Guide', href: '/bhutan-travel-guide.html' },
  { label: 'Visa & Entry', href: '/visa-entry.html' },
  { label: 'Best Time to Visit', href: '/bhutan-travel-guide.html#when-to-go' },
  { label: 'FAQs', href: '/faq.html' },
];

export const about: NavLink[] = [
  { label: 'Our Story', href: '/about.html#story' },
  { label: 'Why Marvels Luxe', href: '/about.html#why' },
  { label: 'Our Team', href: '/about.html#team' },
  { label: 'Sustainability', href: '/about.html#sustainability' },
];

/** Left of the logo, right of the logo (desktop), and the flattened mobile order. */
export const navLeft: NavGroup[] = [
  { label: 'Home', href: '/' },
  { label: 'Experiences', children: experiences },
  { label: 'Information', children: information },
];
export const navRight: NavGroup[] = [
  { label: 'Blog', href: '/blog.html' },
  { label: 'About', children: about },
  { label: 'Contact', href: '/contact.html' },
];

export const contact = {
  phoneHref: 'tel:+97523359180',
  phone: '+975 2 335 918',
  email: 'journeys@marvelsluxe.bt',
  address: 'Chang Lam, Thimphu, Bhutan',
};
