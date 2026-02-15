# Castory: AI-Powered Podcast Platform

## 1. Overview & Motivation

Staying current in tech and cybersecurity means reading dozens of articles daily. Most professionals don't have the bandwidth for that. They do, however, have a commute, a gym session, or a lunch break — and five minutes to listen to a podcast.

Castory is a full-stack podcast platform that closes that gap. It provides two distinct creation workflows:

- **Manual podcast creation** — content creators write or paste their own scripts, select an AI voice, and generate studio-quality audio with AI-generated cover art. A four-section form handles the full pipeline: metadata, voice selection, audio generation, and thumbnail generation.

- **Automated news podcast wizard** — a five-step guided flow that fetches trending articles for a chosen topic using real-time web search, lets the user curate which stories to include, generates a natural-sounding podcast script, produces audio narration, and publishes — end to end, with no external tooling required.

The platform targets CS students, early-career engineers, and busy security professionals who want curated, narrated news without the overhead of manual research.

Castory exists at the intersection of a real product and a systems engineering demonstration. It exercises every layer of modern web development: authentication, real-time backend, multi-model AI orchestration, complex state management, and a cohesive design system. Every architectural decision described below was made to serve both goals simultaneously — ship something usable, and build something worth examining.

---

## 2. Technical Architecture & Workflow

### System Overview

```
                        ┌──────────────────┐
                        │    Clerk Auth     │
                        │  (JWT + Webhooks) │
                        └────────┬─────────┘
                                 │
                   Webhook (Svix)│  JWT Token
                   user.created  │  (per request)
                   user.updated  │
                   user.deleted  │
                                 v
┌─────────────┐  Convex React  ┌──────────────────┐   OpenAI APIs
│  Next.js 16 │<=============> │     Convex       │ <===========>
│  App Router │  real-time     │   Serverless     │  GPT-4.1-mini
│  + React 19 │  subscriptions │   Backend        │  + web search
│             │                │                  │  DALL-E 3
│  - Pages    │  mutations /   │  - HTTP Router   │  TTS-1
│  - Audio    │  queries /     │  - Mutations     │
│    Provider │  actions       │  - Queries       │
│  - Draft    │                │  - Server Actions│
│    Persist. │                │  - File Storage  │
└─────────────┘                └──────────────────┘
```

### Authentication & Webhook Sync

Clerk handles user sessions and provides JWTs that Convex validates on every query and mutation. User data is synchronized to the Convex `users` table via signed webhooks verified with Svix.

The webhook handler is designed defensively. Clerk's `email_addresses` array can be empty on the first webhook for OAuth sign-ups, and `first_name` is nullable. The handler chains safe fallbacks:

```typescript
// convex/http.ts — safe fallback chain for webhook data
case "user.created": {
  const primaryEmail = event.data.email_addresses?.[0]?.email_address;
  const email = primaryEmail ?? `${event.data.id}@clerk.user`;
  const name =
    event.data.first_name ??
    primaryEmail?.split("@")[0] ??
    "Unknown";
```

The `updateUser` and `deleteUser` mutations return early (no-op) if the user doesn't exist in the database, ensuring webhooks always return 200 regardless of event ordering or race conditions. As a secondary guard, the `createPodcast` mutation creates the user record just-in-time if the webhook hasn't synced yet.

### Data Model

Two tables power the application:

- **`podcasts`** — stores metadata, AI prompts, Convex file storage IDs for audio/images, and denormalized author fields (`author`, `authorId`, `authorImageUrl`). Denormalization avoids join-like patterns in a document database. Three search indexes (`search_title`, `search_author`, `search_body`) enable full-text discovery.
- **`users`** — synced from Clerk via webhooks, indexed on `clerkId` for fast lookup.

### Creation Pipelines

**Manual:**
Form input &#8594; Zod validation &#8594; TTS action (OpenAI) &#8594; upload to Convex storage &#8594; DALL-E action &#8594; upload &#8594; `createPodcast` mutation &#8594; home feed

**News wizard:**
Topic select &#8594; GPT-4.1-mini + web search &#8594; article curation &#8594; script generation (tone + duration) &#8594; TTS + DALL-E &#8594; publish

---

## 3. Tech Stack Deep Dive

| Technology | Role | Why This Over Alternatives | Tradeoff |
|---|---|---|---|
| **Next.js 16 + React 19** | Frontend framework | App Router enables granular server/client boundaries; React 19 provides the latest concurrent features | Newer ecosystem — fewer community examples for edge cases |
| **Convex** | Serverless backend | Real-time subscriptions (live queries update the UI automatically), integrated file storage, fully typed schema, zero-config deployment. Eliminates the need for a separate database, file storage service, and WebSocket layer | Vendor lock-in; smaller community than Supabase or Firebase |
| **Clerk** | Authentication | Drop-in auth with webhook-based sync, social login, and session management. Avoids building auth primitives from scratch | External dependency on a critical path; webhook reliability demands defensive coding patterns |
| **OpenAI** | AI pipeline (GPT-4.1-mini, DALL-E 3, TTS-1) | Single vendor for text generation, image generation, and text-to-speech. GPT-4.1-mini's web search tool provides real-time news fetching without a separate news API | Per-generation cost; TTS-1's 4096-character limit requires chunking logic |
| **Tailwind CSS + shadcn/ui** | Styling & components | Utility-first CSS with an accessible component library built on Radix primitives. Rapid iteration without fighting CSS specificity | Custom design system requires significant CSS beyond shadcn defaults |

### Design System

The UI follows a deliberately brutalist aesthetic: thick 4-6px borders, hard offset shadows, and a high-contrast palette (charcoal backgrounds, orange `#ff6b35` accent, cream text). Typography uses Syne (900 weight, uppercase) for display headings and Crimson Pro (italic) for descriptions. Custom CSS component classes — `card-brutal`, `btn-brutal`, `noise-texture` — enforce visual consistency. This is a conscious choice to create a distinctive visual identity that stands apart from default component library aesthetics.

---

## 4. Technical Challenges & Solutions

### Challenge 1: TTS Text Chunking at the 4096-Character Boundary

**Constraint:** OpenAI's TTS-1 model enforces a hard 4096-character input limit. A "medium" news podcast script targets ~1,200 words — roughly 6,000-7,000 characters. The text must be split into multiple chunks, each converted to audio independently, then reassembled.

**Why naive splitting fails:** Cutting text at exactly 4,096 characters lands mid-word or mid-sentence, producing cut-off words, unnatural pauses, and tonal discontinuities at chunk boundaries.

**Solution:** A priority-based boundary detection algorithm:

```typescript
// convex/openai.ts — sentence-aware text chunking for TTS
function splitText(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }

    const window = remaining.slice(0, maxLen);
    const sentenceEnd = Math.max(
      window.lastIndexOf(". "),
      window.lastIndexOf("! "),
      window.lastIndexOf("? "),
      window.lastIndexOf(".\n"),
      window.lastIndexOf("!\n"),
      window.lastIndexOf("?\n"),
    );

    let splitAt: number;
    if (sentenceEnd > maxLen * 0.3) {
      splitAt = sentenceEnd + 1;
    } else {
      const lastSpace = window.lastIndexOf(" ");
      splitAt = lastSpace > 0 ? lastSpace : maxLen;
    }

    chunks.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trim();
  }

  return chunks;
}
```

The algorithm searches for the last sentence-ending punctuation (`. `, `! `, `? `) within the 4096-character window. A 30% minimum threshold (`sentenceEnd > maxLen * 0.3`) prevents degenerate cases where a single long sentence pushes the split point too early in the window, which would produce very short chunks. If no suitable sentence boundary exists, it falls back to the last word boundary. Hard splitting at `maxLen` is a last resort for pathological inputs with no whitespace.

After generating audio for each chunk, the MP3 buffers are concatenated via `Uint8Array`:

```typescript
// convex/openai.ts — MP3 buffer concatenation
const totalLength = audioBuffers.reduce((sum, buf) => sum + buf.byteLength, 0);
const combined = new Uint8Array(totalLength);
let offset = 0;
for (const buf of audioBuffers) {
  combined.set(new Uint8Array(buf), offset);
  offset += buf.byteLength;
}
```

This works because MP3 is a frame-based format — each frame is independently decodable, so byte-level concatenation produces a valid file without requiring server-side audio processing tools like FFmpeg.

**Tradeoff:** Byte-level concatenation can produce a barely perceptible audio glitch at chunk boundaries. For podcast-length spoken content, this is acceptable. For music production, it would not be.

### Challenge 2: Orchestrating the 5-Step News Podcast Wizard

**Constraint:** The news podcast flow is a five-step wizard where each step depends on the output of the previous step, individual steps involve async API calls that take 3-15 seconds, and the user might close their browser mid-flow.

```
Topic Select ──> Article Fetch ──> Script Gen ──> Audio & Art ──> Publish
   (user)      (GPT + web search)   (GPT chat)  (TTS + DALL-E)  (mutation)
     │               │                  │              │             │
     └───────────────┴──────────────────┴──────────────┴─────────────┘
              localStorage draft state persisted across all steps
```

**Design decision:** All five steps live in a single page component rather than being split across routes. Route-per-step would require either URL state (fragile for complex objects like article arrays and generated scripts) or server-side session storage (which defeats the real-time Convex architecture). A single component manages ~15 pieces of state that flow forward through the wizard.

**Draft persistence** is handled by a custom hook:

```typescript
// lib/useDraftPersistence.ts — auto-save with debounce + ready-delay
export function useDraftSave<T>(key: string, state: T) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [ready, setReady] = useState(false);
  const debouncedState = useDebounce(state, 500);

  // Wait 750ms after mount before enabling saves
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 750);
    return () => clearTimeout(timer);
  }, []);

  // Persist debounced state once ready
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(key, JSON.stringify(debouncedState));
      setLastSaved(new Date());
    } catch {
      // localStorage full or unavailable — silently ignore
    }
  }, [key, debouncedState, ready]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
    setLastSaved(null);
  }, [key]);

  return { lastSaved, clearDraft };
}
```

The 750ms ready-delay after mount prevents the initial restore from immediately overwriting localStorage with stale default values — a subtle race condition where the component mounts with defaults, triggering a save before the restoration logic executes. On mount, `readDraft` restores the entire wizard state including the current step index, selected articles, generated script, and tone/duration preferences.

An **auto-fill cascade** reduces friction: when a script is generated, the wizard automatically populates the podcast title (topic + date), description, voice prompt (the full script), and image prompt (a DALL-E prompt seeded with the topic). The user goes from five manual inputs to zero, with full override capability.

---

## 5. Impact & Future Roadmap

### Current State

- End-to-end creation pipeline for both manual and news podcasts, from text input to published audio
- Global audio player accessible from any route, with play/pause, seek, and volume controls
- Full-text search across podcast titles, authors, and descriptions with 500ms debounced input
- Consistent brutalist design system with responsive three-column layout (sidebar + content + recommendations)

### Scalability Considerations

- Convex file storage handles audio and image hosting without self-managed object storage infrastructure
- Denormalized author data on podcast records avoids N+1 query patterns but requires batch updates on profile changes — already implemented in the `updateUser` webhook handler, which propagates changes across all of a user's podcasts
- Search indexes on three fields provide flexible discovery without a dedicated search service like Algolia or Elasticsearch

### Planned Features

- **Scheduled publishing** — Convex scheduled functions to trigger daily or weekly news podcast generation automatically. Users configure a topic, tone, and cadence; the system fetches, scripts, narrates, and publishes on schedule without manual intervention.
- **Multi-voice episodes** — Host-and-guest format using multiple TTS voices within a single episode. Requires script format changes to support speaker labels and interleaved audio chunk generation, producing conversational-style podcasts from a single text input.

The underlying architecture is designed for this kind of extension: each layer — auth, backend, AI, frontend — can evolve independently while the overall system remains stable. Swapping TTS providers, adding a new AI model, or extending the schema requires changes in a single layer without cascading rewrites.
