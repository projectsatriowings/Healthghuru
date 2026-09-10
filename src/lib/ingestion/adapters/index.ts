import { SourceType } from '../types';
import { BaseSourceAdapter } from './base';
import { RssSourceAdapter } from './rss';
import { AtomSourceAdapter } from './atom';
import { YouTubeSourceAdapter } from './youtube';
import { NewsApiSourceAdapter } from './newsapi';
import { GenericApiSourceAdapter } from './generic-api';

const adapters: Record<SourceType, BaseSourceAdapter> = {
  rss: new RssSourceAdapter(),
  atom: new AtomSourceAdapter(),
  youtube: new YouTubeSourceAdapter(),
  newsapi: new NewsApiSourceAdapter(),
  generic_api: new GenericApiSourceAdapter(),
  manual: new GenericApiSourceAdapter(),
};

export function getAdapterForSource(type: SourceType): BaseSourceAdapter {
  const adapter = adapters[type];
  if (!adapter) {
    throw new Error(`Unsupported source adapter type: ${type}`);
  }
  return adapter;
}

export * from './base';
export * from './rss';
export * from './atom';
export * from './youtube';
export * from './newsapi';
export * from './generic-api';
