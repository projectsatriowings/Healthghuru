/* eslint-disable @typescript-eslint/no-explicit-any */
import { sql } from '@/lib/db';
import { SourceConfig, IngestionResult, IngestionErrorItem } from './types';
import { getAdapterForSource } from './adapters';
import { validateNormalizedItem } from './validate';
import { detectDuplicate } from './dedupe';
import { classifyContent } from './classify';
import { calculateScores } from './scoring';
import { randomUUID } from 'crypto';

export async function runIngestionPipeline(
  source: SourceConfig,
  options?: { limit?: number }
): Promise<IngestionResult> {
  const runId = randomUUID();
  const startTime = Date.now();
  const errors: IngestionErrorItem[] = [];

  let itemsFound = 0;
  let itemsImported = 0;
  const itemsUpdated = 0;
  let itemsSkipped = 0;
  let itemsDuplicated = 0;
  let itemsFailed = 0;

  // 1. Initialize Ingestion Run Record
  await sql`
    INSERT INTO ingestion_runs (
      id, source_id, source_name, started_at, status
    ) VALUES (
      ${runId}::uuid, ${source.id}::uuid, ${source.name}, CURRENT_TIMESTAMP, 'running'
    );
  `;

  try {
    // 2. Fetch via adapter
    const adapter = getAdapterForSource(source.type);
    const rawItems = await adapter.fetch(source, options);
    itemsFound = rawItems.length;

    // 3. Process each normalized item
    for (const item of rawItems) {
      try {
        // Validation check
        const validation = validateNormalizedItem(item);
        if (!validation.success) {
          itemsFailed++;
          const errDetail = validation.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
          errors.push({
            itemIdentifier: item.externalId || item.title,
            stage: 'validate',
            errorCode: 'VALIDATION_FAILED',
            errorMessage: errDetail,
          });

          await sql`
            INSERT INTO ingestion_errors (
              run_id, source_id, item_identifier, stage, error_code, error_message, raw_data
            ) VALUES (
              ${runId}::uuid, ${source.id}::uuid, ${item.externalId || item.title},
              'validate', 'VALIDATION_FAILED', ${errDetail}, ${JSON.stringify(item)}::jsonb
            );
          `;
          continue;
        }

        // Deduplication check
        const dedupe = await detectDuplicate(item, source.id);
        if (dedupe.isDuplicate) {
          itemsDuplicated++;
          if (dedupe.confidence === 1.0) {
            // Exact same provider item already exists in this source: skip or update seen timestamp
            itemsSkipped++;
            await sql`
              UPDATE content_source_items
              SET last_seen_at = CURRENT_TIMESTAMP
              WHERE source_id = ${source.id}::uuid AND external_id = ${item.externalId}
            `;
            continue;
          }
        }

        // Classification & Taxonomy
        const classification = classifyContent(
          item.title,
          item.description || item.excerpt,
          item.tags,
          source.defaultCategory || 'Wellness'
        );

        // Quality & Trust Scoring
        const scoring = calculateScores(
          item,
          source,
          classification.relevanceScore,
          dedupe.confidence
        );

        // Policy Gate
        let contentStatus: 'published' | 'review' = 'published';
        let requiresReview = false;

        if (
          source.requiresReview ||
          !source.autoPublish ||
          dedupe.confidence >= 0.85 ||
          scoring.qualityScore < 40
        ) {
          contentStatus = 'review';
          requiresReview = true;
        }

        const newItemId = randomUUID();

        // Database Persistence: content_items
        await sql`
          INSERT INTO content_items (
            id, content_type, title, slug, excerpt, description, canonical_url,
            image_url, author_name, published_at, source_id, status, language,
            country, category, subcategory, is_external, is_featured, is_trending,
            is_breaking, is_verified, requires_review, quality_score, relevance_score,
            duration_seconds, video_id, duplicate_of_id, duplicate_confidence,
            raw_metadata, created_at, updated_at
          ) VALUES (
            ${newItemId}::uuid, ${item.contentType}, ${item.title}, ${item.slug},
            ${item.excerpt || null}, ${item.description || null}, ${item.canonicalUrl},
            ${item.imageUrl || null}, ${item.authorName || source.name}, ${item.publishedAt.toISOString()}::timestamptz,
            ${source.id}::uuid, ${contentStatus}, ${item.language || 'en'},
            ${item.country || null}, ${classification.primaryCategory}, ${classification.subcategory || null},
            ${item.isExternal}, FALSE, FALSE, FALSE, ${source.trustScore === 'High'},
            ${requiresReview}, ${scoring.qualityScore}, ${scoring.relevanceScore},
            ${item.durationSeconds || null}, ${item.videoId || null},
            ${dedupe.existingItemId ? dedupe.existingItemId : null}::uuid,
            ${dedupe.confidence},
            ${JSON.stringify({ 
              scoringReasons: scoring.reasons, 
              sourceMetadata: item.sourceMetadata,
              matched_categories: classification.matchedCategories 
            })}::jsonb,
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          )
          ON CONFLICT (slug) DO UPDATE SET
            title = EXCLUDED.title,
            excerpt = EXCLUDED.excerpt,
            description = EXCLUDED.description,
            image_url = EXCLUDED.image_url,
            category = EXCLUDED.category,
            subcategory = EXCLUDED.subcategory,
            raw_metadata = EXCLUDED.raw_metadata,
            quality_score = EXCLUDED.quality_score,
            updated_at = CURRENT_TIMESTAMP;
        `;

        // Link in content_source_items
        await sql`
          INSERT INTO content_source_items (
            source_id, content_item_id, external_id, external_url,
            first_seen_at, last_seen_at, raw_payload
          ) VALUES (
            ${source.id}::uuid, ${newItemId}::uuid, ${item.externalId}, ${item.canonicalUrl},
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ${JSON.stringify(item.rawPayload || {})}::jsonb
          )
          ON CONFLICT (source_id, external_id) DO UPDATE SET
            last_seen_at = CURRENT_TIMESTAMP;
        `;

        // Persist tags
        for (const tag of classification.tags) {
          const tagSlug = tag.toLowerCase().replace(/[^a-z0-9]/g, '-');
          const tagRes = await sql`
            INSERT INTO content_tags (name, slug)
            VALUES (${tag}, ${tagSlug})
            ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
            RETURNING id;
          `;
          if (tagRes[0]?.id) {
            await sql`
              INSERT INTO content_item_tags (content_item_id, tag_id)
              VALUES (${newItemId}::uuid, ${tagRes[0].id}::uuid)
              ON CONFLICT DO NOTHING;
            `;
          }
        }

        itemsImported++;
      } catch (itemErr: any) {
        itemsFailed++;
        const errMsg = itemErr?.message || String(itemErr);
        errors.push({
          itemIdentifier: item.externalId || item.title,
          stage: 'save',
          errorCode: 'SAVE_FAILED',
          errorMessage: errMsg,
        });

        await sql`
          INSERT INTO ingestion_errors (
            run_id, source_id, item_identifier, stage, error_code, error_message
          ) VALUES (
            ${runId}::uuid, ${source.id}::uuid, ${item.externalId || item.title},
            'save', 'SAVE_FAILED', ${errMsg}
          );
        `;
      }
    }

    const durationMs = Date.now() - startTime;
    const finalStatus = itemsFailed > 0 && itemsImported > 0 ? 'partial' : itemsFailed > 0 && itemsImported === 0 ? 'failed' : 'success';

    // 4. Update Ingestion Run record
    await sql`
      UPDATE ingestion_runs
      SET
        completed_at = CURRENT_TIMESTAMP,
        status = ${finalStatus},
        duration_ms = ${durationMs},
        items_found = ${itemsFound},
        items_imported = ${itemsImported},
        items_updated = ${itemsUpdated},
        items_skipped = ${itemsSkipped},
        items_duplicated = ${itemsDuplicated},
        items_failed = ${itemsFailed},
        error_message = ${errors.length > 0 ? `${errors.length} item errors recorded` : null}
      WHERE id = ${runId}::uuid;
    `;

    // 5. Update Source Health & Counters
    await sql`
      UPDATE content_sources
      SET
        last_fetched_at = CURRENT_TIMESTAMP,
        last_success_at = CURRENT_TIMESTAMP,
        item_count = item_count + ${itemsImported},
        last_error = NULL
      WHERE id = ${source.id}::uuid;
    `;

    return {
      runId,
      sourceId: source.id,
      sourceName: source.name,
      status: finalStatus,
      durationMs,
      itemsFound,
      itemsImported,
      itemsUpdated,
      itemsSkipped,
      itemsDuplicated,
      itemsFailed,
      errors,
    };
  } catch (sourceErr: any) {
    const durationMs = Date.now() - startTime;
    const errMsg = sourceErr?.message || String(sourceErr);

    await sql`
      UPDATE ingestion_runs
      SET
        completed_at = CURRENT_TIMESTAMP,
        status = 'failed',
        duration_ms = ${durationMs},
        error_message = ${errMsg}
      WHERE id = ${runId}::uuid;
    `;

    await sql`
      UPDATE content_sources
      SET
        last_fetched_at = CURRENT_TIMESTAMP,
        last_failure_at = CURRENT_TIMESTAMP,
        last_error = ${errMsg}
      WHERE id = ${source.id}::uuid;
    `;

    return {
      runId,
      sourceId: source.id,
      sourceName: source.name,
      status: 'failed',
      durationMs,
      itemsFound: 0,
      itemsImported: 0,
      itemsUpdated: 0,
      itemsSkipped: 0,
      itemsDuplicated: 0,
      itemsFailed: 1,
      errors: [{ stage: 'fetch', errorCode: 'SOURCE_FETCH_ERROR', errorMessage: errMsg }],
    };
  }
}
