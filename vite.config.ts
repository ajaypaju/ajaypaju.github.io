import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type HtmlTagDescriptor, type Plugin } from 'vite'
import { profile } from './src/data/profile.ts'
import { PHOTO_MEDIA, PHOTO_SIZES, srcSet } from './src/lib/images.ts'

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const { meta } = profile
const abs = (path: string) => new URL(path, meta.url).href
const meta_ = (attr: 'name' | 'property', key: string, content: string): HtmlTagDescriptor => ({
  tag: 'meta',
  attrs: { [attr]: key, content },
  injectTo: 'head',
})

// JSON-LD Person. No phone number, ever.
const person = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: profile.name,
  jobTitle: profile.experience[0].roles[0].title,
  url: meta.url,
  image: abs(`${profile.photo.avatar.path.slice(1)}-${profile.photo.avatar.widths.at(-1)}.webp`),
  email: `mailto:${profile.email}`,
  address: {
    '@type': 'PostalAddress',
    addressLocality: meta.address.locality,
    addressRegion: meta.address.region,
    addressCountry: meta.address.country,
  },
  worksFor: { '@type': 'Organization', name: profile.experience[0].name },
  sameAs: [profile.links.linkedin.href, profile.links.github.href],
  knowsAbout: meta.knowsAbout,
}

/**
 * Builds <head> from profile.ts: title and description placeholders, canonical, theme colors, icons,
 * Open Graph / Twitter tags, JSON-LD, the desktop hero cutout preload (the page renders client-side,
 * so the browser would otherwise only find the image after the JS runs; `type` makes non-AVIF
 * browsers skip it, `media` keeps phones from downloading it) and, in builds, a preload for the
 * hashed Inter font file (it renders the hero name).
 */
const profileHead = (): Plugin => ({
  name: 'profile-head',
  transformIndexHtml: {
    order: 'post',
    handler: (html, ctx) => {
      const ogImage = abs(meta.ogImage)
      const tags: HtmlTagDescriptor[] = [
        { tag: 'link', attrs: { rel: 'canonical', href: meta.url }, injectTo: 'head' },
        { tag: 'meta', attrs: { name: 'theme-color', content: meta.themeColor.dark, media: '(prefers-color-scheme: dark)' }, injectTo: 'head' },
        { tag: 'meta', attrs: { name: 'theme-color', content: meta.themeColor.light, media: '(prefers-color-scheme: light)' }, injectTo: 'head' },
        { tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }, injectTo: 'head' },
        { tag: 'link', attrs: { rel: 'manifest', href: '/site.webmanifest' }, injectTo: 'head' },
        meta_('property', 'og:type', 'website'),
        meta_('property', 'og:url', meta.url),
        meta_('property', 'og:title', meta.title),
        meta_('property', 'og:description', meta.description),
        meta_('property', 'og:image', ogImage),
        meta_('property', 'og:image:width', '1200'),
        meta_('property', 'og:image:height', '630'),
        meta_('property', 'og:image:alt', meta.ogImageAlt),
        meta_('name', 'twitter:card', 'summary_large_image'),
        meta_('name', 'twitter:title', meta.title),
        meta_('name', 'twitter:description', meta.description),
        meta_('name', 'twitter:image', ogImage),
        meta_('name', 'twitter:image:alt', meta.ogImageAlt),
        {
          tag: 'link',
          attrs: {
            rel: 'preload',
            as: 'image',
            type: 'image/avif',
            imagesrcset: srcSet(profile.photo.cutout, 'avif'),
            imagesizes: PHOTO_SIZES,
            media: PHOTO_MEDIA,
            fetchpriority: 'high',
          },
          injectTo: 'head',
        },
        {
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          // `<` escaped so the JSON can never close the script tag.
          children: JSON.stringify(person).replace(/</g, '\\u003c'),
          injectTo: 'head',
        },
      ]
      const inter = ctx.bundle && Object.keys(ctx.bundle).find((f) => /inter-latin-wght-normal-.*\.woff2$/.test(f))
      if (inter) {
        tags.unshift({
          tag: 'link',
          attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: `/${inter}`, crossorigin: '' },
          injectTo: 'head-prepend',
        })
      }
      return {
        html: html
          .replaceAll('%PROFILE_TITLE%', escapeHtml(meta.title))
          .replaceAll('%PROFILE_DESCRIPTION%', escapeHtml(meta.description)),
        tags,
      }
    },
  },
})

// https://vite.dev/config/
export default defineConfig({
  // The site is served from the root of https://ajaypaju.github.io/.
  base: '/',
  plugins: [react(), tailwindcss(), profileHead()],
})
