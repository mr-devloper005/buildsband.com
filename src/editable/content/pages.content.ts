import { slot4BrandConfig } from '@/editable/theme/brand.config'

const LIBRARY = slot4BrandConfig.labels.library
const CURATORS = slot4BrandConfig.labels.contributors

export const pagesContent = {
  home: {
    metadata: {
      title: `${LIBRARY} — bookmarks, collections, and resources worth keeping`,
      description: `A curated library of bookmarks and small collections, tended by ${CURATORS.toLowerCase()} who still care where a link points.`,
      openGraphTitle: `${LIBRARY} — the shelf worth keeping.`,
      openGraphDescription: `Curated bookmarks and collections, kept small on purpose, opened by real people.`,
      keywords: ['curated bookmarks', 'collections', 'resources', 'link library', 'curated web'],
    },
    hero: {
      badge: `Inside ${LIBRARY}`,
      title: ['Bookmark the internet', 'worth keeping.'],
      description: `A small library of hand-picked bookmarks — grouped into collections, tended by ${CURATORS.toLowerCase()}, and updated only when something is actually worth saving.`,
      primaryCta: { label: `Open ${LIBRARY}`, href: '/sbm' },
      secondaryCta: { label: 'How this works', href: '/about' },
      searchPlaceholder: 'Search bookmarks, collections, or a domain',
      focusLabel: 'On the shelf',
      featureCardBadge: 'Fresh from the shelf',
      featureCardTitle: `Every bookmark here lives on a shelf that a person opens by hand.`,
      featureCardDescription: `${CURATORS} pick the links, write a note, and leave them here for the next reader to find.`,
    },
    intro: {
      badge: 'The idea',
      title: 'A quiet room for the links worth keeping.',
      paragraphs: [
        `${LIBRARY} is a small, human-tended library — bookmarks grouped into collections, and collections opened by people who read them first.`,
        `Nothing here comes from a feed. Every resource was picked because a ${CURATORS.toLowerCase().slice(0, -1)} wanted a way to come back to it, and thought someone else might too.`,
        `Open a shelf, save a link, or start your own collection — the library is small on purpose, and it stays that way.`,
      ],
      sideBadge: 'At a glance',
      sidePoints: [
        `Bookmarks curated by ${CURATORS.toLowerCase()}, not algorithms.`,
        `Collections small enough to read end-to-end.`,
        `Domains that still write something worth keeping.`,
        `A room, not a river.`,
      ],
      primaryLink: { label: `Enter ${LIBRARY}`, href: '/sbm' },
      secondaryLink: { label: 'Meet the curators', href: '/about' },
    },
    cta: {
      badge: 'Add to the shelf',
      title: 'Send a bookmark. Start a shelf.',
      description: `Suggest a resource, pitch a collection, or become a ${CURATORS.toLowerCase().slice(0, -1)} and tend a shelf yourself. The library grows one honest link at a time.`,
      primaryCta: { label: 'Submit a resource', href: '/contact' },
      secondaryCta: { label: 'Become a curator', href: '/signup' },
    },
    taskSection: {
      heading: `Fresh on the {label} shelf`,
      descriptionSuffix: `The newest bookmarks ${CURATORS.toLowerCase()} added this week.`,
    },
  },
  about: {
    badge: 'About',
    title: 'A small library for the internet worth keeping.',
    description: `${slot4BrandConfig.siteName} is a curated home for bookmarks, collections, and resources — kept small on purpose, tended by people who still bookmark things.`,
    paragraphs: [
      `Most bookmark tools were built to swallow links. This one was built to serve a few of them well: to give each resource a shelf, a curator, and a reason to still be here in a year.`,
      `Every collection has an editor. Every bookmark has a note. Every link gets a weekly link check so the shelf stays honest.`,
      `The library is opinionated on purpose. When something no longer earns its place, it comes off the shelf. When something new is worth keeping, a curator adds it — and writes down why.`,
    ],
    values: [
      {
        title: 'Small on purpose.',
        description: `The library will never be exhaustive. It will always be picked. If there are too many things in a collection, the collection is broken — not the collection you want.`,
      },
      {
        title: 'Named, not anonymous.',
        description: `Every shelf carries the name of the ${CURATORS.toLowerCase().slice(0, -1)} who tends it. Credit lands where taste lives, and readers know whose room they walked into.`,
      },
      {
        title: 'Slow enough to trust.',
        description: `Nothing gets added just to fill a slot. The library moves at the pace of somebody actually reading — because that is who it is for.`,
      },
    ],
  },
  contact: {
    eyebrow: `Talk to ${slot4BrandConfig.siteName}`,
    title: 'Send a link. Send a shelf. Send a note.',
    description: `Whether you want to submit a resource, pitch a collection, or become a ${CURATORS.toLowerCase().slice(0, -1)}, this is the door. We read every message.`,
    formTitle: 'Send a message',
  },
  search: {
    metadata: {
      title: `Search ${LIBRARY}`,
      description: `Search bookmarks, collections, and curated resources across ${slot4BrandConfig.siteName}.`,
    },
    hero: {
      badge: `Search the library`,
      title: 'Find a shelf worth opening.',
      description: `Type a topic, a domain, or a word from a curator note — search reaches every collection ${CURATORS.toLowerCase()} have opened.`,
      placeholder: 'Search bookmarks, collections, or a domain',
    },
    resultsTitle: 'Fresh from the shelf',
  },
  create: {
    metadata: {
      title: `Add to ${LIBRARY}`,
      description: `Submit a bookmark, add a collection, or open a shelf on ${slot4BrandConfig.siteName}.`,
    },
    locked: {
      badge: 'Curator access',
      title: 'Log in to add to the shelf.',
      description: `The publishing room is open to signed-in ${CURATORS.toLowerCase()}. Log in to add a bookmark, or sign up to start your own shelf.`,
    },
    hero: {
      badge: 'Publishing room',
      title: 'Add a resource to the shelf.',
      description: `Give it a title, a home shelf, a source URL, and a short curator note. Send it in — it lands in ${LIBRARY} shortly after.`,
    },
    formTitle: 'Resource details',
    submitLabel: 'Send to the shelf',
    successTitle: 'On the shelf. Thanks.',
  },
  auth: {
    login: {
      metadataDescription: `Log in to ${slot4BrandConfig.siteName} to add resources and tend a shelf.`,
      badge: 'Curator access',
      title: 'Welcome back to the shelf.',
      description: `Log in to add bookmarks, open a new collection, or pick up the shelf you were tending last time.`,
      formTitle: 'Log in',
      submitLabel: 'Continue',
      noAccount: 'No account matched — sign up first, then log in.',
      success: 'Logged in. Redirecting…',
      createCta: 'Become a curator',
    },
    signup: {
      metadataDescription: `Create a ${slot4BrandConfig.siteName} account and start tending a shelf.`,
      badge: 'Curator access',
      title: 'Open a shelf of your own.',
      description: `Create an account to save resources, open a collection, and add bookmarks that fellow ${CURATORS.toLowerCase()} can read.`,
      formTitle: 'Create account',
      submitLabel: 'Create account',
      passwordShort: 'Use at least 4 characters for the password.',
      success: 'Account created. Redirecting…',
      loginCta: 'Log in',
    },
  },
  detailPages: {
    article: {
      relatedTitle: 'From the same shelf',
      fallbackTitle: 'Long read',
    },
    listing: {
      relatedTitle: 'Nearby on the directory',
      fallbackTitle: 'Directory entry',
    },
    image: {
      relatedTitle: 'From the visual shelf',
      fallbackTitle: 'Visual',
    },
    profile: {
      relatedTitle: '',
      fallbackDescription: 'Curator details will appear here once they add a bio.',
      visitButton: 'Visit site',
    },
  },
} as const
