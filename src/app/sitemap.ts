/* eslint-disable @typescript-eslint/no-explicit-any */
import { MetadataRoute } from 'next';
import { sql } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://healthghuru.com';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/news`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/articles`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/videos`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/magazines`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/latest`, lastModified: new Date(), changeFrequency: 'always', priority: 0.8 },
    { url: `${baseUrl}/trending`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.8 },
    { url: `${baseUrl}/stay-healthy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  ];

  try {
    const categories = await sql`SELECT slug, created_at FROM content_categories LIMIT 30`;
    const categoryRoutes: MetadataRoute.Sitemap = categories.map((c: any) => ({
      url: `${baseUrl}/category/${c.slug}`,
      lastModified: new Date(c.created_at || Date.now()),
      changeFrequency: 'daily',
      priority: 0.7,
    }));

    const topItems = await sql`
      SELECT slug, content_type, updated_at
      FROM content_items
      WHERE status = 'published' AND deleted_at IS NULL
      ORDER BY published_at DESC
      LIMIT 100
    `;

    const itemRoutes: MetadataRoute.Sitemap = topItems.map((item: any) => {
      const path = item.content_type === 'video' ? `/video/${item.slug}` : `/blog/${item.slug}`;
      return {
        url: `${baseUrl}${path}`,
        lastModified: new Date(item.updated_at || Date.now()),
        changeFrequency: 'weekly',
        priority: 0.6,
      };
    });

    return [...staticRoutes, ...categoryRoutes, ...itemRoutes];
  } catch {
    return staticRoutes;
  }
}
