# T35: Marketing site, pricing & legal pages

**Phase:** 6 · **Depends on:** T02 · **Size:** M

## Goal

A production-quality public face that explains the differentiator: _AI that only picks from bullets you wrote_, plus a tracker and matches.

## Scope

- Landing page: hero, the zero-invented-text promise, demo (animated builder/tailor), how it works (bank → tailor → track → matches), extension CTA, testimonials placeholder, FAQ.
- Pricing page wired to T33 plan config.
- Legal: privacy policy, terms, cookie notice (as needed), data processing summary.
- SEO: metadata, OG images (`next/og`), sitemap, robots, structured data.
- Blog/changelog (MDX) for community updates and build-in-public posts.
- Product analytics (privacy-friendly, e.g. PostHog / Plausible) + waitlist/sign-up funnel.

## Out of scope

Paid acquisition.

## Decisions (resolve in Plan mode)

- Same Next.js app (route group `(marketing)`) vs. separate site.
- Analytics vendor and cookie-consent requirements.
- Hebrew landing page variant (with T40).

## Acceptance criteria

- Lighthouse ≥ 95 on performance, SEO and accessibility for the landing page.
- Legal pages linked from the footer and the sign-up flow.

## Decisions log

_Fill in after planning._
