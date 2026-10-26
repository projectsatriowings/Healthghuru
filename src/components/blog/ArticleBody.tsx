import type { ArticleBlock } from '@/lib/types/article';
import { Leaf, Heart, Moon, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

const TIP_ICONS = { leaf: Leaf, heart: Heart, moon: Moon, check: CheckCircle2 };

export const ArticleBody = React.forwardRef<HTMLDivElement, { blocks: ArticleBlock[] }>(({ blocks }, ref) => {
  return (
    <div ref={ref} className="max-w-[760px] mx-auto space-y-6">
      {blocks.map((block) => <BlockRenderer key={block.id} block={block} />)}
    </div>
  );
});

ArticleBody.displayName = 'ArticleBody';

function BlockRenderer({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p
          className="article-body-text text-[18px] leading-[1.8]"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-primary)' }}
        >
          {block.text}
        </p>
      );

    case 'heading':
      const Tag = `h${block.level}` as keyof JSX.IntrinsicElements;
      const sizeClass = block.level === 2 ? 'article-h2-block text-3xl mt-12 mb-4' : 'article-h3-block text-2xl mt-8 mb-3';
      return (
        <Tag
          className={`${sizeClass} font-display`}
          style={{ color: 'var(--color-dark)' }}
        >
          {block.text}
        </Tag>
      );

    case 'pull_quote':
      return (
        <blockquote
          className="article-quote-block my-12 py-6 px-4 sm:px-6 border-l-4"
          style={{ borderColor: 'var(--color-accent)', backgroundColor: 'var(--color-surface)' }}
        >
          <p
            className="text-2xl sm:text-3xl leading-snug italic"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-dark)' }}
          >
            “{block.text}”
          </p>
          {block.attribution && (
            <cite
              className="block mt-4 text-base not-italic font-semibold"
              style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}
            >
              — {block.attribution}
            </cite>
          )}
        </blockquote>
      );

    case 'key_takeaway':
      return (
        <div
          className="rounded-[14px] p-6 my-8 shadow-sm"
          style={{ backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}
        >
          <h3
            className="article-takeaways-heading text-lg font-semibold mb-4 flex items-center gap-2"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-dark)' }}
          >
            <CheckCircle2 size={20} style={{ color: 'var(--color-primary)' }} /> {block.title}
          </h3>
          <ul className="space-y-3">
            {block.points.map((point, i) => (
              <li key={i} className="article-takeaways-item flex gap-3 text-[16px] leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
                <span className="mt-1" style={{ color: 'var(--color-primary)' }}>•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      );

    case 'tip_callout': {
      const Icon = TIP_ICONS[block.icon || 'leaf'];
      return (
        <div
          className="rounded-[14px] p-5 my-8 flex gap-4 items-start shadow-sm"
          style={{ backgroundColor: 'rgba(102,187,106,0.08)', border: '1px solid var(--color-border)' }}
        >
          <div className="p-2 bg-white rounded-full shadow-sm" style={{ color: 'var(--color-secondary)' }}>
            <Icon size={24} />
          </div>
          <p className="article-callout-text text-[16px] leading-relaxed pt-1" style={{ color: 'var(--color-text-secondary)' }}>
            <strong className="article-callout-title font-semibold" style={{ color: 'var(--color-dark)' }}>Pro Tip:</strong> {block.text}
          </p>
        </div>
      );
    }

    case 'numbered_list':
      return (
        <div className="my-8">
          {block.title && (
            <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-dark)' }}>
              {block.title}
            </h3>
          )}
          <ol className="space-y-4">
            {block.items.map((item, i) => (
              <li key={i} className="flex gap-4">
                <span
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm"
                  style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
                >
                  {i + 1}
                </span>
                <span className="text-[17px] pt-1 leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
                  {item}
                </span>
              </li>
            ))}
          </ol>
        </div>
      );

    case 'image':
      return (
        <figure className="my-10">
          <div className="relative w-full rounded-2xl overflow-hidden shadow-md" style={{ aspectRatio: '16/9' }}>
            <Image src={block.url} alt={block.alt} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
          </div>
          {block.caption && (
            <figcaption
              className="text-sm text-center mt-3 italic"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case 'divider':
      return (
        <div className="py-8">
          <hr className="border-t-2" style={{ borderColor: 'var(--color-border)' }} />
        </div>
      );

    default:
      return null;
  }
}
