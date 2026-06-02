// Static knowledge base of target German tech companies for the cover letter generator
// Each company carries display name, headquarters, default role focus, and a verified careers URL
export interface TargetCompany {
  slug: string;
  name: string;
  city: string;
  focus: string;
  why: string;
  careers: string;
}

export const TARGET_COMPANIES: TargetCompany[] = [
  {
    slug: 'sap',
    name: 'SAP SE',
    city: 'Walldorf',
    focus: 'Enterprise software, ERP, AI on the SAP Business Technology Platform',
    why: 'Working at scale on systems that move physical and financial supply chains, plus the strongest engineering benefits and process maturity in the German market.',
    careers: 'https://jobs.sap.com'
  },
  {
    slug: 'zalando',
    name: 'Zalando SE',
    city: 'Berlin',
    focus: 'European fashion e-commerce platform, retail at scale',
    why: 'High traffic JVM and Node stacks, mature platform tooling, English speaking teams, and very international engineering culture.',
    careers: 'https://jobs.zalando.com'
  },
  {
    slug: 'n26',
    name: 'N26 GmbH',
    city: 'Berlin',
    focus: 'Pan-European mobile-first banking',
    why: 'Building money infrastructure in Europe with regulatory scrutiny matched by serious engineering rigor on payments, KYC, and identity.',
    careers: 'https://n26.com/en-eu/careers'
  },
  {
    slug: 'delivery-hero',
    name: 'Delivery Hero SE',
    city: 'Berlin',
    focus: 'Global online food and quick commerce',
    why: 'High volume real time logistics, demand forecasting, and multi tenant platform engineering across forty plus countries.',
    careers: 'https://careers.deliveryhero.com'
  },
  {
    slug: 'celonis',
    name: 'Celonis SE',
    city: 'Munich',
    focus: 'Process mining and execution management',
    why: 'Working on the boundary between graph algorithms, time series data, and visible business impact for Fortune 500 customers.',
    careers: 'https://www.celonis.com/careers/'
  },
  {
    slug: 'soundcloud',
    name: 'SoundCloud',
    city: 'Berlin',
    focus: 'Audio streaming and creator tools',
    why: 'Distributed audio pipelines, real time recommendation, and a famously engineering driven culture in central Berlin.',
    careers: 'https://careers.soundcloud.com'
  },
  {
    slug: 'klarna',
    name: 'Klarna',
    city: 'Berlin',
    focus: 'Payments and shopping platform',
    why: 'Payments infrastructure, customer obsession, and an engineering team that ships extraordinarily fast for a regulated business.',
    careers: 'https://www.klarna.com/careers/'
  },
  {
    slug: 'getyourguide',
    name: 'GetYourGuide',
    city: 'Berlin',
    focus: 'Travel experiences marketplace',
    why: 'Marketplace dynamics, mobile native UX, and ranking systems that touch global travelers every day.',
    careers: 'https://careers.getyourguide.com'
  },
  {
    slug: 'trade-republic',
    name: 'Trade Republic',
    city: 'Berlin',
    focus: 'Mobile brokerage and retail investing',
    why: 'A fast moving fintech with deep regulatory complexity and a high signal engineering bar.',
    careers: 'https://traderepublic.com/career'
  },
  {
    slug: 'personio',
    name: 'Personio',
    city: 'Munich',
    focus: 'HR platform for European SMBs',
    why: 'Vertical SaaS at the right size to ship significant work without the politics of giant platforms.',
    careers: 'https://www.personio.com/about/careers/'
  }
];

export function findCompany(slug: string): TargetCompany | undefined {
  return TARGET_COMPANIES.find((entry) => entry.slug === slug);
}

export function defaultRoleFor(focus: string): string {
  const lower = focus.toLowerCase();
  if (lower.includes('payment') || lower.includes('bank') || lower.includes('broker')) {
    return 'Full Stack Engineer with payments focus';
  }
  if (lower.includes('e-commerce') || lower.includes('commerce') || lower.includes('marketplace')) {
    return 'Full Stack Engineer';
  }
  if (lower.includes('process') || lower.includes('platform')) {
    return 'Platform or Backend Engineer';
  }
  return 'Full Stack Software Engineer';
}
