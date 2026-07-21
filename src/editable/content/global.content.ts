import { slot4BrandConfig } from '@/editable/theme/brand.config'

/*
  Task keys that should never appear in the public UI. `profile` stays
  functional (direct-URL detail pages still work) but is hidden from every
  discovery surface: nav, footer, home, search filters, create picker.
*/
export const uiHiddenTaskKeys = ['profile'] as const

export const isUiHiddenTask = (key: string) =>
  (uiHiddenTaskKeys as readonly string[]).includes(key)

export const globalContent = {
  site: {
    name: slot4BrandConfig.siteName,
    tagline: slot4BrandConfig.tagline || 'A library of curated bookmarks and collections',
    domain: slot4BrandConfig.domain,
    baseUrl: slot4BrandConfig.baseUrl,
  },
  labels: {
    library: slot4BrandConfig.labels.library,
    contributors: slot4BrandConfig.labels.contributors,
  },
  nav: {
    tagline: 'Bookmarks · collections · resources',
    primaryLinks: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
    actions: {
      primary: { label: 'Browse the library', href: '/sbm' },
      secondary: { label: 'Submit a resource', href: '/contact' },
    },
    searchAria: 'Search bookmarks and collections',
  },
  footer: {
    tagline: 'A shelf for the internet worth keeping.',
    description:
      'A library of curated bookmarks, collections, and resources — kept small on purpose, tended by people who care.',
    columns: [
      {
        title: 'Collections',
        intro: 'Jump straight into a shelf.',
      },
      {
        title: 'Site',
      },
      {
        title: 'Account',
      },
    ],
    bottomNote: 'Made for the people who still bookmark things.',
    submit: { label: 'Submit a resource', href: '/contact' },
  },
  commonLabels: {
    readMore: 'Read more',
    viewAll: 'Browse the shelf',
    explore: 'Open the library',
    latest: 'Fresh bookmarks',
    related: 'From the same shelf',
    published: 'Added',
    visit: 'Visit resource',
    domain: 'Domain',
    verified: 'Verified',
    save: 'Save to shelf',
  },
} as const
