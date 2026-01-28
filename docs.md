thats what are cache components so rethink and modify the plan. url
  offical nextjs :
 Getting Started: Cache Components | Next.js (nextjs.org)

# Cache Components
@doc-version: 16.1.6
@last-updated: 2026-01-26


> **Good to know:** Cache Components is an opt-in feature. Enable it by setting the `cacheComponents` flag to `true` in your Next config file. See [Enabling Cache Components](#enabling-cache-components) for more details.

Cache Components lets you mix static, cached, and dynamic content in a single route, giving you the speed of static sites with the flexibility of dynamic rendering.

Server-rendered applications typically force a choice between static pages (fast but stale) and dynamic pages (fresh but slow). Moving this work to the client trades server load for larger bundles and slower initial rendering.

Cache Components eliminates these tradeoffs by prerendering routes into a **static HTML shell** that's immediately sent to the browser, with dynamic content updating the UI as it becomes ready.

![Partially re-rendered Product Page showing static nav and product information, and dynamic cart and recommended products](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/learn/light/thinking-in-ppr.png)

## How rendering works with Cache Components

At build time, Next.js renders your route's component tree. As long as components don't access network resources, certain system APIs, or require an incoming request to render, their output is **automatically added to the static shell**. Otherwise, you must choose how to handle them:

* Defer rendering to request time by wrapping components in React's [`<Suspense>`](https://react.dev/reference/react/Suspense), [showing fallback UI](#defer-rendering-to-request-time) until the content is ready, or
* Cache the result using the [`use cache`](/docs/app/api-reference/directives/use-cache.md) directive to [include it in the static shell](#using-use-cache) (if no request data is needed)

Because this happens ahead of time, before a request arrives, we refer to it as prerendering. This generates a static shell consisting of HTML for initial page loads and a serialized [RSC Payload](/docs/app/getting-started/server-and-client-components.md#on-the-server) for client-side navigation, ensuring the browser receives fully rendered content instantly whether users navigate directly to the URL or transition from another page.

Next.js requires you to explicitly handle components that can't complete during prerendering. If they aren't wrapped in `<Suspense>` or marked with `use cache`, you'll see an [`Uncached data was accessed outside of <Suspense>`](https://nextjs.org/docs/messages/blocking-route) error during development and build time.

> **Good to know**: Caching can be applied at the component or function level, while fallback UI can be defined around any subtree, which means you can compose static, cached, and dynamic content within a single route.

![Diagram showing partially rendered page on the client, with loading UI for chunks that are being streamed.](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/light/server-rendering-with-streaming.png)

This rendering approach is called **Partial Prerendering**, and it's the default behavior with Cache Components. For the rest of this document, we simply refer to it as "prerendering" which can produce a partial or complete output.

> **🎥 Watch:** Why Partial Prerendering and how it works → [YouTube (10 minutes)](https://www.youtube.com/watch?v=MTcPrTIBkpA).

## Automatically prerendered content

Operations like synchronous I/O, module imports, and pure computations can complete during prerendering. Components using only these operations have their rendered output included in the static HTML shell.

Because all operations in the `Page` component below complete during rendering, its rendered output is automatically included in the static shell. When both the layout and page prerender successfully, the entire route is the static shell.

```tsx filename="page.tsx"
import fs from 'node:fs'

export default async function Page() {
  // Synchronous file system read
  const content = fs.readFileSync('./config.json', 'utf-8')

  // Module imports
  const constants = await import('./constants.json')

  // Pure computations
  const processed = JSON.parse(content).items.map((item) => item.value * 2)

  return (
    <div>
      <h1>{constants.appName}</h1>
      <ul>
        {processed.map((value, i) => (
          <li key={i}>{value}</li>
        ))}
      </ul>
    </div>
  )
}
```

> **Good to know**: You can verify that a route was fully prerendered by checking the build output summary. Alternatively, see what content was added to the static shell of any page by viewing the page source in your browser.

## Defer rendering to request time

During prerendering, when Next.js encounters work it can't complete (like network requests, accessing request data, or async operations), it requires you to explicitly handle it. To defer rendering to request time, a parent component must provide fallback UI using a Suspense boundary. The fallback becomes part of the static shell while the actual content resolves at request time.

Place Suspense boundaries as close as possible to the components that need them. This maximizes the amount of content in the static shell, since everything outside the boundary can still prerender normally.

> **Good to know**: With Suspense boundaries, multiple dynamic sections can render in parallel rather than blocking each other, reducing total load time.

### Dynamic content

External systems provide content asynchronously, which often takes an unpredictable time to resolve and may even fail. This is why prerendering doesn't execute them automatically.

In general, when you need the latest data from the source on each request (like real-time feeds or personalized content), defer rendering by providing fallback UI with a Suspense boundary.

For example, the `DynamicContent` component below uses multiple operations that are not automatically prerendered.

```tsx filename="page.tsx"
import { Suspense } from 'react'
import fs from 'node:fs/promises'

async function DynamicContent() {
  // Network request
  const data = await fetch('https://api.example.com/data')

  // Database query
  const users = await db.query('SELECT * FROM users')

  // Async file system operation
  const file = await fs.readFile('..', 'utf-8')

  // Simulating external system delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  return <div>Not in the static shell</div>
}
```

To use `DynamicContent` within a page, wrap it in `<Suspense>` to define fallback UI:

```tsx filename="page.tsx"
export default async function Page(props) {
  return (
    <>
      <h1>Part of the static shell</h1>
      {/* <p>Loading..</p> is part of the static shell */}
      <Suspense fallback={<p>Loading..</p>}>
        <DynamicContent />
        <div>Sibling excluded from static shell</div>
      </Suspense>
    </>
  )
}
```

Prerendering stops at the `fetch` request. The request itself is not started, and any code after it is not executed.

The fallback (`<p>Loading...</p>`) is included in the static shell, while the component's content streams at request time.

In this example, since all operations (network request, database query, file read, and timeout) run sequentially within the same component, the content won't appear until they all complete.

> **Good to know**: For dynamic content that doesn't change frequently, you can use `use cache` to include the dynamic data in the static shell instead of streaming it. See the [during prerendering](#during-prerendering) section for an example.

### Runtime data

A specific type of dynamic data that requires request context, only available when a user makes a request.

* [`cookies()`](/docs/app/api-reference/functions/cookies.md) - User's cookie data
* [`headers()`](/docs/app/api-reference/functions/headers.md) - Request headers
* [`searchParams`](/docs/app/api-reference/file-conventions/page.md#searchparams-optional) - URL query parameters
* [`params`](/docs/app/api-reference/file-conventions/page.md#params-optional) - Dynamic route parameters (unless at least one sample is provided via [`generateStaticParams`](/docs/app/api-reference/functions/generate-static-params.md)). See [Dynamic Routes with Cache Components](/docs/app/api-reference/file-conventions/dynamic-routes.md#with-cache-components) for detailed patterns.

```tsx filename="page.tsx"
import { cookies, headers } from 'next/headers'
import { Suspense } from 'react'

async function RuntimeData({ searchParams }) {
  // Accessing request data
  const cookieStore = await cookies()
  const headerStore = await headers()
  const search = await searchParams

  return <div>Not in the static shell</div>
}
```

To use the `RuntimeData` component, wrap it in a `<Suspense>` boundary:

```tsx filename="page.tsx"
export default async function Page(props) {
  return (
    <>
      <h1>Part of the static shell</h1>
      {/* <p>Loading..</p> is part of the static shell */}
      <Suspense fallback={<p>Loading..</p>}>
        <RuntimeData searchParams={props.searchParams} />
        <div>Sibling excluded from static shell</div>
      </Suspense>
    </>
  )
}
```

Use [`connection()`](/docs/app/api-reference/functions/connection.md) if you need to defer to request time without accessing any of the runtime APIs above.

> **Good to know**: Runtime data cannot be cached with `use cache` because it requires request context. Components that access runtime APIs must always be wrapped in `<Suspense>`. However, you can extract values from runtime data and pass them as arguments to cached functions. See the [with runtime data](#with-runtime-data) section for an example.

One approach for reading runtime data like cookies without blocking the static shell is to pass a promise to a client context provider. See [Sharing data with context and React.cache](/docs/app/getting-started/server-and-client-components.md#sharing-data-with-context-and-reactcache) for an example.

> **Good to know:** `React.cache` operates in an isolated scope inside `use cache` boundaries. See [React.cache isolation](/docs/app/api-reference/directives/use-cache.md#reactcache-isolation) for more information.

### Non-deterministic operations

Operations like `Math.random()`, `Date.now()`, or `crypto.randomUUID()` produce different values each time they execute. To ensure these run at request time (generating unique values per request), Cache Components requires you to explicitly signal this intent by calling these operations after dynamic or runtime data access.

```tsx
import { connection } from 'next/server'
import { Suspense } from 'react'

async function UniqueContent() {
  // Explicitly defer to request time
  await connection()

  // Non-deterministic operations
  const random = Math.random()
  const now = Date.now()
  const date = new Date()
  const uuid = crypto.randomUUID()
  const bytes = crypto.getRandomValues(new Uint8Array(16))

  return (
    <div>
      <p>{random}</p>
      <p>{now}</p>
      <p>{date.getTime()}</p>
      <p>{uuid}</p>
      <p>{bytes}</p>
    </div>
  )
}
```

Because the `UniqueContent` component defers to request time, to use it within a route, it must be wrapped in `<Suspense>`:

```tsx filename="page.tsx"
export default async function Page() {
  return (
    // <p>Loading..</p> is part of the static shell
    <Suspense fallback={<p>Loading..</p>}>
      <UniqueContent />
    </Suspense>
  )
}
```

Every incoming request would see different random numbers, date, etc.

> **Good to know**: You can cache non-deterministic operations with `use cache`. See the [with non-deterministic operations](#with-non-deterministic-operations) section for examples.

## Using `use cache`

The [`use cache`](/docs/app/api-reference/directives/use-cache.md) directive caches the return value of async functions and components. You can apply it at the function, component, or file level.

Arguments and any closed-over values from parent scopes automatically become part of the [cache key](/docs/app/api-reference/directives/use-cache.md#cache-keys), which means different inputs produce separate cache entries. This enables personalized or parameterized cached content.

When [dynamic content](#dynamic-content) doesn't need to be fetched fresh from the source on every request, caching it lets you include the content in the static shell during prerendering, or reuse the result at runtime across multiple requests.

Cached content can be revalidated in two ways: automatically based on the cache lifetime, or on-demand using tags with [`revalidateTag`](/docs/app/api-reference/functions/revalidateTag.md) or [`updateTag`](/docs/app/api-reference/functions/updateTag.md).

> **Good to know**: See [serialization requirements and constraints](/docs/app/api-reference/directives/use-cache.md#constraints) for details on what can be cached and how arguments work.

### During prerendering

While [dynamic content](#dynamic-content) is fetched from external sources, it's often unlikely to change between accesses. Product catalog data updates with inventory changes, blog post content rarely changes after publishing, and analytics reports for past dates remain static.

If this data doesn't depend on [runtime data](#runtime-data), you can use the `use cache` directive to include it in the static HTML shell. Use [`cacheLife`](/docs/app/api-reference/functions/cacheLife.md) to define how long to use the cached data.

When revalidation occurs, the static shell is updated with fresh content. See [Tagging and revalidating](#tagging-and-revalidating) for details on on-demand revalidation.

```tsx filename="app/page.tsx" highlight={1,4,5}
import { cacheLife } from 'next/cache'

export default async function Page() {
  'use cache'
  cacheLife('hours')

  const users = await db.query('SELECT * FROM users')

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

The `cacheLife` function accepts a cache profile name (like `'hours'`, `'days'`, or `'weeks'`) or a custom configuration object to control cache behavior:

```tsx filename="app/page.tsx" highlight={1,4-8}
import { cacheLife } from 'next/cache'

export default async function Page() {
  'use cache'
  cacheLife({
    stale: 3600, // 1 hour until considered stale
    revalidate: 7200, // 2 hours until revalidated
    expire: 86400, // 1 day until expired
  })

  const users = await db.query('SELECT * FROM users')

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

See the [`cacheLife` API reference](/docs/app/api-reference/functions/cacheLife.md) for available profiles and custom configuration options.

### With runtime data

Runtime data and [`use cache`](/docs/app/api-reference/directives/use-cache.md) cannot be used in the same scope. However, you can extract values from runtime APIs and pass them as arguments to cached functions.

```tsx filename="app/profile/page.tsx"
import { cookies } from 'next/headers'
import { Suspense } from 'react'

export default function Page() {
  // Page itself creates the dynamic boundary
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfileContent />
    </Suspense>
  )
}

// Component (not cached) reads runtime data
async function ProfileContent() {
  const session = (await cookies()).get('session')?.value

  return <CachedContent sessionId={session} />
}

// Cached component/function receives data as props
async function CachedContent({ sessionId }: { sessionId: string }) {
  'use cache'
  // sessionId becomes part of cache key
  const data = await fetchUserData(sessionId)
  return <div>{data}</div>
}
```

At request time, `CachedContent` executes if no matching cache entry is found, and stores the result for future requests.

### With non-deterministic operations

Within a `use cache` scope, non-deterministic operations execute during prerendering. This is useful when you want the same rendered output served to all users:

```tsx
export default async function Page() {
  'use cache'

  // Execute once, then cached for all requests
  const random = Math.random()
  const random2 = Math.random()
  const now = Date.now()
  const date = new Date()
  const uuid = crypto.randomUUID()
  const bytes = crypto.getRandomValues(new Uint8Array(16))

  return (
    <div>
      <p>
        {random} and {random2}
      </p>
      <p>{now}</p>
      <p>{date.getTime()}</p>
      <p>{uuid}</p>
      <p>{bytes}</p>
    </div>
  )
}
```

All requests will be served a route containing the same random numbers, timestamp, and UUID until the cache is revalidated.

### Tagging and revalidating

Tag cached data with [`cacheTag`](/docs/app/api-reference/functions/cacheTag.md) and revalidate it after mutations using [`updateTag`](/docs/app/api-reference/functions/updateTag.md) in Server Actions for immediate updates, or [`revalidateTag`](/docs/app/api-reference/functions/revalidateTag.md) when delays in updates are acceptable.

#### With `updateTag`

Use `updateTag` when you need to expire and immediately refresh cached data within the same request:

```tsx filename="app/actions.ts" highlight={1,4,5,13}
import { cacheTag, updateTag } from 'next/cache'

export async function getCart() {
  'use cache'
  cacheTag('cart')
  // fetch data
}

export async function updateCart(itemId: string) {
  'use server'
  // write data using the itemId
  // update the user cart
  updateTag('cart')
}
```

#### With `revalidateTag`

Use `revalidateTag` when you want to invalidate only properly tagged cached entries with stale-while-revalidate behavior. This is ideal for static content that can tolerate eventual consistency.

```tsx filename="app/actions.ts" highlight={1,4,5,12}
import { cacheTag, revalidateTag } from 'next/cache'

export async function getPosts() {
  'use cache'
  cacheTag('posts')
  // fetch data
}

export async function createPost(post: FormData) {
  'use server'
  // write data using the FormData
  revalidateTag('posts', 'max')
}
```

For more detailed explanation and usage examples, see the [`use cache` API reference](/docs/app/api-reference/directives/use-cache.md).

### What should I cache?

What you cache should be a function of what you want your UI loading states to be. If data doesn't depend on runtime data and you're okay with a cached value being served for multiple requests over a period of time, use `use cache` with `cacheLife` to describe that behavior.

For content management systems with update mechanisms, consider using tags with longer cache durations and rely on `revalidateTag` to mark static initial UI as ready for revalidation. This pattern allows you to serve fast, cached responses while still updating content when it actually changes, rather than expiring the cache preemptively.

## Putting it all together

Here's a complete example showing static content, cached dynamic content, and streaming dynamic content working together on a single page:

```tsx filename="app/blog/page.tsx"
import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { cacheLife } from 'next/cache'
import Link from 'next/link'

export default function BlogPage() {
  return (
    <>
      {/* Static content - prerendered automatically */}
      <header>
        <h1>Our Blog</h1>
        <nav>
          <Link href="/">Home</Link> | <Link href="/about">About</Link>
        </nav>
      </header>

      {/* Cached dynamic content - included in the static shell */}
      <BlogPosts />

      {/* Runtime dynamic content - streams at request time */}
      <Suspense fallback={<p>Loading your preferences...</p>}>
        <UserPreferences />
      </Suspense>
    </>
  )
}

// Everyone sees the same blog posts (revalidated every hour)
async function BlogPosts() {
  'use cache'
  cacheLife('hours')

  const res = await fetch('https://api.vercel.app/blog')
  const posts = await res.json()

  return (
    <section>
      <h2>Latest Posts</h2>
      <ul>
        {posts.slice(0, 5).map((post: any) => (
          <li key={post.id}>
            <h3>{post.title}</h3>
            <p>
              By {post.author} on {post.date}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}

// Personalized per user based on their cookie
async function UserPreferences() {
  const theme = (await cookies()).get('theme')?.value || 'light'
  const favoriteCategory = (await cookies()).get('category')?.value

  return (
    <aside>
      <p>Your theme: {theme}</p>
      {favoriteCategory && <p>Favorite category: {favoriteCategory}</p>}
    </aside>
  )
}
```

During prerendering the header (static) and the blog posts fetched from the API (cached with `use cache`), both become part of the static shell along with the fallback UI for user preferences.

When a user visits the page, they instantly see this prerendered shell with the header and blog posts. Only the personalized preferences need to stream in at request time since they depend on the user's cookies. This ensures fast initial page loads while still providing personalized content.

## Metadata and Viewport

`generateMetadata` and `generateViewport` are part of rendering your page or layout. During prerendering, their access to runtime data or uncached dynamic data is tracked separately from the rest of the page.

If a page or layout is prerenderable but only metadata or viewport accesses uncached dynamic data or runtime data, Next.js requires an explicit choice: cache the data if possible, or signal that deferred rendering is intentional. See [Metadata with Cache Components](/docs/app/api-reference/functions/generate-metadata.md#with-cache-components) and [Viewport with Cache Components](/docs/app/api-reference/functions/generate-viewport.md#with-cache-components) for how to handle this.

## Enabling Cache Components

You can enable Cache Components (which includes PPR) by adding the [`cacheComponents`](/docs/app/api-reference/config/next-config-js/cacheComponents.md) option to your Next config file:

```ts filename="next.config.ts" highlight={4} switcher
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
}

export default nextConfig
```

```js filename="next.config.js" highlight={3} switcher
/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
}

module.exports = nextConfig
```

> **Good to know:** When Cache Components is enabled, `GET` Route Handlers follow the same prerendering model as pages. See [Route Handlers with Cache Components](/docs/app/getting-started/route-handlers.md#with-cache-components) for details.

## Navigation uses Activity

When the [`cacheComponents`](/docs/app/api-reference/config/next-config-js/cacheComponents.md) flag is enabled, Next.js uses React's [`<Activity>`](https://react.dev/reference/react/Activity) component to preserve component state during client-side navigation.

Rather than unmounting the previous route when you navigate away, Next.js sets the Activity mode to [`"hidden"`](https://react.dev/reference/react/Activity#activity). This means:

* Component state is preserved when navigating between routes
* When you navigate back, the previous route reappears with its state intact
* Effects are cleaned up when a route is hidden, and recreated when it becomes visible again

This behavior improves the navigation experience by maintaining UI state (form inputs, or expanded sections) when users navigate back and forth between routes.

> **Good to know**: Next.js uses heuristics to keep a few recently visited routes `"hidden"`, while older routes are removed from the DOM to prevent excessive growth.

## Migrating route segment configs

When Cache Components is enabled, several route segment config options are no longer needed or supported:

### `dynamic = "force-dynamic"`

**Not needed.** All pages are dynamic by default.

```tsx filename="app/page.tsx"
// Before - No longer needed
export const dynamic = 'force-dynamic'

export default function Page() {
  return <div>...</div>
}
```

```tsx filename="app/page.tsx"
// After - Just remove it
export default function Page() {
  return <div>...</div>
}
```

### `dynamic = "force-static"`

Start by removing it. When unhandled dynamic or runtime data access is detected during development and build time, Next.js raises an error. Otherwise, the [prerendering](#automatically-prerendered-content) step automatically extracts the static HTML shell.

For dynamic data access, add [`use cache`](#using-use-cache) as close to the data access as possible with a long [`cacheLife`](/docs/app/api-reference/functions/cacheLife.md) like `'max'` to maintain cached behavior. If needed, add it at the top of the page or layout.

For runtime data access (`cookies()`, `headers()`, etc.), errors will direct you to [wrap it with `Suspense`](#runtime-data). Since you started by using `force-static`, you must remove the runtime data access to prevent any request time work.

```tsx filename="app/page.tsx"
// Before
export const dynamic = 'force-static'

export default async function Page() {
  const data = await fetch('https://api.example.com/data')
  return <div>...</div>
}
```

```tsx filename="app/page.tsx"
import { cacheLife } from 'next/cache'

// After - Use 'use cache' instead
export default async function Page() {
  'use cache'
  cacheLife('max')
  const data = await fetch('https://api.example.com/data')
  return <div>...</div>
}
```

### `revalidate`

**Replace with `cacheLife`.** Use the `cacheLife` function to define cache duration instead of the route segment config.

```tsx
// Before
export const revalidate = 3600 // 1 hour

export default async function Page() {
  return <div>...</div>
}
```

```tsx filename="app/page.tsx"
// After - Use cacheLife
import { cacheLife } from 'next/cache'

export default async function Page() {
  'use cache'
  cacheLife('hours')
  return <div>...</div>
}
```

### `fetchCache`

**Not needed.** With `use cache`, all data fetching within a cached scope is automatically cached, making `fetchCache` unnecessary.

```tsx filename="app/page.tsx"
// Before
export const fetchCache = 'force-cache'
```

```tsx filename="app/page.tsx"
// After - Use 'use cache' to control caching behavior
export default async function Page() {
  'use cache'
  // All fetches here are cached
  return <div>...</div>
}
```

### `runtime = 'edge'`

**Not supported.** Cache Components requires Node.js runtime and will throw errors with [Edge Runtime](/docs/app/api-reference/edge.md).
## Next Steps

Learn more about the config option for Cache Components.

- [cacheComponents](/docs/app/api-reference/config/next-config-js/cacheComponents.md)
  - Learn how to enable the cacheComponents flag in Next.js.
- [use cache](/docs/app/api-reference/directives/use-cache.md)
  - Learn how to use the "use cache" directive to cache data in your Next.js application.
- [cacheLife](/docs/app/api-reference/functions/cacheLife.md)
  - Learn how to use the cacheLife function to set the cache expiration time for a cached function or component.
- [cacheTag](/docs/app/api-reference/functions/cacheTag.md)
  - Learn how to use the cacheTag function to manage cache invalidation in your Next.js application.
- [revalidateTag](/docs/app/api-reference/functions/revalidateTag.md)
  - API Reference for the revalidateTag function.
- [updateTag](/docs/app/api-reference/functions/updateTag.md)
  - API Reference for the updateTag function.


thats the caching and revalidation docs also: # Caching and Revalidating
@doc-version: 16.1.6
@last-updated: 2025-11-05


Caching is a technique for storing the result of data fetching and other computations so that future requests for the same data can be served faster, without doing the work again. While revalidation allows you to update cache entries without having to rebuild your entire application.

Next.js provides a few APIs to handle caching and revalidation. This guide will walk you through when and how to use them.

* [`fetch`](#fetch)
* [`cacheTag`](#cachetag)
* [`revalidateTag`](#revalidatetag)
* [`updateTag`](#updatetag)
* [`revalidatePath`](#revalidatepath)
* [`unstable_cache`](#unstable_cache) (Legacy)

## `fetch`

By default, [`fetch`](/docs/app/api-reference/functions/fetch.md) requests are not cached. You can cache individual requests by setting the `cache` option to `'force-cache'`.

```tsx filename="app/page.tsx" switcher
export default async function Page() {
  const data = await fetch('https://...', { cache: 'force-cache' })
}
```

```jsx filename="app/page.jsx" switcher
export default async function Page() {
  const data = await fetch('https://...', { cache: 'force-cache' })
}
```

> **Good to know**: Although `fetch` requests are not cached by default, Next.js will [pre-render](/docs/app/guides/caching.md#static-rendering) routes that have `fetch` requests and cache the HTML. If you want to guarantee a route is [dynamic](/docs/app/guides/caching.md#dynamic-rendering), use the [`connection` API](/docs/app/api-reference/functions/connection.md).

To revalidate the data returned by a `fetch` request, you can use the `next.revalidate` option.

```tsx filename="app/page.tsx" switcher
export default async function Page() {
  const data = await fetch('https://...', { next: { revalidate: 3600 } })
}
```

```jsx filename="app/page.jsx" switcher
export default async function Page() {
  const data = await fetch('https://...', { next: { revalidate: 3600 } })
}
```

This will revalidate the data after a specified amount of seconds.

You can also tag `fetch` requests to enable on-demand cache invalidation:

```tsx filename="app/lib/data.ts" switcher
export async function getUserById(id: string) {
  const data = await fetch(`https://...`, {
    next: {
      tags: ['user'],
    },
  })
}
```

```jsx filename="app/lib/data.js" switcher
export async function getUserById(id) {
  const data = await fetch(`https://...`, {
    next: {
      tags: ['user'],
    },
  })
}
```

See the [`fetch` API reference](/docs/app/api-reference/functions/fetch.md) to learn more.

## `cacheTag`

[`cacheTag`](/docs/app/api-reference/functions/cacheTag.md) allows you to tag cached data in [Cache Components](/docs/app/getting-started/cache-components.md) so it can be revalidated on-demand. Previously, cache tagging was limited to `fetch` requests, and caching other work required the experimental `unstable_cache` API.

With Cache Components, you can use the [`use cache`](/docs/app/api-reference/directives/use-cache.md) directive to cache any computation, and `cacheTag` to tag it. This works with database queries, file system operations, and other server-side work.

```tsx filename="app/lib/data.ts" switcher
import { cacheTag } from 'next/cache'

export async function getProducts() {
  'use cache'
  cacheTag('products')

  const products = await db.query('SELECT * FROM products')
  return products
}
```

```jsx filename="app/lib/data.js" switcher
import { cacheTag } from 'next/cache'

export async function getProducts() {
  'use cache'
  cacheTag('products')

  const products = await db.query('SELECT * FROM products')
  return products
}
```

Once tagged, you can use [`revalidateTag`](#revalidatetag) or [`updateTag`](#updatetag) to invalidate the cache entry for products.

> **Good to know**: `cacheTag` is used with [Cache Components](/docs/app/getting-started/cache-components.md) and the [`use cache`](/docs/app/api-reference/directives/use-cache.md) directive. It expands the caching and revalidation story beyond `fetch`.

See the [`cacheTag` API reference](/docs/app/api-reference/functions/cacheTag.md) to learn more.

## `revalidateTag`

`revalidateTag` is used to revalidate cache entries based on a tag and following an event. The function now supports two behaviors:

* **With `profile="max"`**: Uses stale-while-revalidate semantics, serving stale content while fetching fresh content in the background
* **Without the second argument**: Legacy behavior that immediately expires the cache (deprecated)

After tagging your cached data, using [`fetch`](#fetch) with `next.tags`, or the [`cacheTag`](#cachetag) function, you may call `revalidateTag` in a [Route Handler](/docs/app/api-reference/file-conventions/route.md) or Server Action:

```tsx filename="app/lib/actions.ts" highlight={1,5} switcher
import { revalidateTag } from 'next/cache'

export async function updateUser(id: string) {
  // Mutate data
  revalidateTag('user', 'max') // Recommended: Uses stale-while-revalidate
}
```

```jsx filename="app/lib/actions.js" highlight={1,5} switcher
import { revalidateTag } from 'next/cache'

export async function updateUser(id) {
  // Mutate data
  revalidateTag('user', 'max') // Recommended: Uses stale-while-revalidate
}
```

You can reuse the same tag in multiple functions to revalidate them all at once.

See the [`revalidateTag` API reference](/docs/app/api-reference/functions/revalidateTag.md) to learn more.

## `updateTag`

`updateTag` is specifically designed for Server Actions to immediately expire cached data for read-your-own-writes scenarios. Unlike `revalidateTag`, it can only be used within Server Actions and immediately expires the cache entry.

```tsx filename="app/lib/actions.ts" highlight={1,6} switcher
import { updateTag } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData: FormData) {
  // Create post in database
  const post = await db.post.create({
    data: {
      title: formData.get('title'),
      content: formData.get('content'),
    },
  })

  // Immediately expire cache so the new post is visible
  updateTag('posts')
  updateTag(`post-${post.id}`)

  redirect(`/posts/${post.id}`)
}
```

```jsx filename="app/lib/actions.js" highlight={1,6} switcher
import { updateTag } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData) {
  // Create post in database
  const post = await db.post.create({
    data: {
      title: formData.get('title'),
      content: formData.get('content'),
    },
  })

  // Immediately expire cache so the new post is visible
  updateTag('posts')
  updateTag(`post-${post.id}`)

  redirect(`/posts/${post.id}`)
}
```

The key differences between `revalidateTag` and `updateTag`:

* **`updateTag`**: Only in Server Actions, immediately expires cache, for read-your-own-writes
* **`revalidateTag`**: In Server Actions and Route Handlers, supports stale-while-revalidate with `profile="max"`

See the [`updateTag` API reference](/docs/app/api-reference/functions/updateTag.md) to learn more.

## `revalidatePath`

`revalidatePath` is used to revalidate a route and following an event. To use it, call it in a [Route Handler](/docs/app/api-reference/file-conventions/route.md) or Server Action:

```tsx filename="app/lib/actions.ts" highlight={1} switcher
import { revalidatePath } from 'next/cache'

export async function updateUser(id: string) {
  // Mutate data
  revalidatePath('/profile')
```

```jsx filename="app/lib/actions.js" highlight={1} switcher
import { revalidatePath } from 'next/cache'

export async function updateUser(id) {
  // Mutate data
  revalidatePath('/profile')
```

See the [`revalidatePath` API reference](/docs/app/api-reference/functions/revalidatePath.md) to learn more.

## `unstable_cache`

> **Good to know**: `unstable_cache` is an experimental API. We recommend opting into [Cache Components](/docs/app/getting-started/cache-components.md) and replacing `unstable_cache` with the [`use cache`](/docs/app/api-reference/directives/use-cache.md) directive. See the [Cache Components documentation](/docs/app/getting-started/cache-components.md) for more details.

`unstable_cache` allows you to cache the result of database queries and other async functions. To use it, wrap `unstable_cache` around the function. For example:

```ts filename="app/lib/data.ts" switcher
import { db } from '@/lib/db'
export async function getUserById(id: string) {
  return db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .then((res) => res[0])
}
```

```jsx filename="app/lib/data.js" switcher
import { db } from '@/lib/db'

export async function getUserById(id) {
  return db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .then((res) => res[0])
}
```

```tsx filename="app/page.tsx" highlight={2,11,13} switcher
import { unstable_cache } from 'next/cache'
import { getUserById } from '@/app/lib/data'

export default async function Page({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params

  const getCachedUser = unstable_cache(
    async () => {
      return getUserById(userId)
    },
    [userId] // add the user ID to the cache key
  )
}
```

```jsx filename="app/page.js" highlight={2,7,9} switcher
import { unstable_cache } from 'next/cache'
import { getUserById } from '@/app/lib/data'

export default async function Page({ params }) {
  const { userId } = await params

  const getCachedUser = unstable_cache(
    async () => {
      return getUserById(userId)
    },
    [userId] // add the user ID to the cache key
  )
}
```

The function accepts a third optional object to define how the cache should be revalidated. It accepts:

* `tags`: an array of tags used by Next.js to revalidate the cache.
* `revalidate`: the number of seconds after cache should be revalidated.

```tsx filename="app/page.tsx" highlight={6-9} switcher
const getCachedUser = unstable_cache(
  async () => {
    return getUserById(userId)
  },
  [userId],
  {
    tags: ['user'],
    revalidate: 3600,
  }
)
```

```jsx filename="app/page.js" highlight={6-9} switcher
const getCachedUser = unstable_cache(
  async () => {
    return getUserById(userId)
  },
  [userId],
  {
    tags: ['user'],
    revalidate: 3600,
  }
)
```

See the [`unstable_cache` API reference](/docs/app/api-reference/functions/unstable_cache.md) to learn more.
## API Reference

Learn more about the features mentioned in this page by reading the API Reference.

- [fetch](/docs/app/api-reference/functions/fetch.md)
  - API reference for the extended fetch function.
- [cacheTag](/docs/app/api-reference/functions/cacheTag.md)
  - Learn how to use the cacheTag function to manage cache invalidation in your Next.js application.
- [revalidateTag](/docs/app/api-reference/functions/revalidateTag.md)
  - API Reference for the revalidateTag function.
- [updateTag](/docs/app/api-reference/functions/updateTag.md)
  - API Reference for the updateTag function.
- [revalidatePath](/docs/app/api-reference/functions/revalidatePath.md)
  - API Reference for the revalidatePath function.
- [unstable_cache](/docs/app/api-reference/functions/unstable_cache.md)
  - API Reference for the unstable_cache function.

these are react suspence docs: 

<Suspense>
<Suspense> lets you display a fallback until its children have finished loading.

<Suspense fallback={<Loading />}>
  <SomeComponent />
</Suspense>
Reference
<Suspense>
Usage
Displaying a fallback while content is loading
Revealing content together at once
Revealing nested content as it loads
Showing stale content while fresh content is loading
Preventing already revealed content from hiding
Indicating that a Transition is happening
Resetting Suspense boundaries on navigation
Providing a fallback for server errors and client-only content
Troubleshooting
How do I prevent the UI from being replaced by a fallback during an update?
Reference 
<Suspense> 
Props 
children: The actual UI you intend to render. If children suspends while rendering, the Suspense boundary will switch to rendering fallback.
fallback: An alternate UI to render in place of the actual UI if it has not finished loading. Any valid React node is accepted, though in practice, a fallback is a lightweight placeholder view, such as a loading spinner or skeleton. Suspense will automatically switch to fallback when children suspends, and back to children when the data is ready. If fallback suspends while rendering, it will activate the closest parent Suspense boundary.
Caveats 
React does not preserve any state for renders that got suspended before they were able to mount for the first time. When the component has loaded, React will retry rendering the suspended tree from scratch.
If Suspense was displaying content for the tree, but then it suspended again, the fallback will be shown again unless the update causing it was caused by startTransition or useDeferredValue.
If React needs to hide the already visible content because it suspended again, it will clean up layout Effects in the content tree. When the content is ready to be shown again, React will fire the layout Effects again. This ensures that Effects measuring the DOM layout don’t try to do this while the content is hidden.
React includes under-the-hood optimizations like Streaming Server Rendering and Selective Hydration that are integrated with Suspense. Read an architectural overview and watch a technical talk to learn more.
Usage 
Displaying a fallback while content is loading 
You can wrap any part of your application with a Suspense boundary:

<Suspense fallback={<Loading />}>
  <Albums />
</Suspense>
React will display your loading fallback until all the code and data needed by the children has been loaded.

In the example below, the Albums component suspends while fetching the list of albums. Until it’s ready to render, React switches the closest Suspense boundary above to show the fallback—your Loading component. Then, when the data loads, React hides the Loading fallback and renders the Albums component with data.

ArtistPage.js
Albums.js

Reload

Clear

Fork
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
import { Suspense } from 'react';
import Albums from './Albums.js';

export default function ArtistPage({ artist }) {
  return (
    <>
      <h1>{artist.name}</h1>
      <Suspense fallback={<Loading />}>
        <Albums artistId={artist.id} />
      </Suspense>
    </>
  );
}

function Loading() {
  return <h2>🌀 Loading...</h2>;
}



Show more
Note
Only Suspense-enabled data sources will activate the Suspense component. They include:

Data fetching with Suspense-enabled frameworks like Relay and Next.js
Lazy-loading component code with lazy
Reading the value of a cached Promise with use
Suspense does not detect when data is fetched inside an Effect or event handler.

The exact way you would load data in the Albums component above depends on your framework. If you use a Suspense-enabled framework, you’ll find the details in its data fetching documentation.

Suspense-enabled data fetching without the use of an opinionated framework is not yet supported. The requirements for implementing a Suspense-enabled data source are unstable and undocumented. An official API for integrating data sources with Suspense will be released in a future version of React.

Revealing content together at once 
By default, the whole tree inside Suspense is treated as a single unit. For example, even if only one of these components suspends waiting for some data, all of them together will be replaced by the loading indicator:

<Suspense fallback={<Loading />}>
  <Biography />
  <Panel>
    <Albums />
  </Panel>
</Suspense>
Then, after all of them are ready to be displayed, they will all appear together at once.

In the example below, both Biography and Albums fetch some data. However, because they are grouped under a single Suspense boundary, these components always “pop in” together at the same time.

ArtistPage.js
Panel.js
Biography.js
Albums.js

Reload

Clear

Fork
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
import { Suspense } from 'react';
import Albums from './Albums.js';
import Biography from './Biography.js';
import Panel from './Panel.js';

export default function ArtistPage({ artist }) {
  return (
    <>
      <h1>{artist.name}</h1>
      <Suspense fallback={<Loading />}>
        <Biography artistId={artist.id} />
        <Panel>
          <Albums artistId={artist.id} />
        </Panel>
      </Suspense>
    </>
  );
}

function Loading() {
  return <h2>🌀 Loading...</h2>;
}



Show more
Components that load data don’t have to be direct children of the Suspense boundary. For example, you can move Biography and Albums into a new Details component. This doesn’t change the behavior. Biography and Albums share the same closest parent Suspense boundary, so their reveal is coordinated together.

<Suspense fallback={<Loading />}>
  <Details artistId={artist.id} />
</Suspense>

function Details({ artistId }) {
  return (
    <>
      <Biography artistId={artistId} />
      <Panel>
        <Albums artistId={artistId} />
      </Panel>
    </>
  );
}
Revealing nested content as it loads 
When a component suspends, the closest parent Suspense component shows the fallback. This lets you nest multiple Suspense components to create a loading sequence. Each Suspense boundary’s fallback will be filled in as the next level of content becomes available. For example, you can give the album list its own fallback:

<Suspense fallback={<BigSpinner />}>
  <Biography />
  <Suspense fallback={<AlbumsGlimmer />}>
    <Panel>
      <Albums />
    </Panel>
  </Suspense>
</Suspense>
With this change, displaying the Biography doesn’t need to “wait” for the Albums to load.

The sequence will be:

If Biography hasn’t loaded yet, BigSpinner is shown in place of the entire content area.
Once Biography finishes loading, BigSpinner is replaced by the content.
If Albums hasn’t loaded yet, AlbumsGlimmer is shown in place of Albums and its parent Panel.
Finally, once Albums finishes loading, it replaces AlbumsGlimmer.
ArtistPage.js
Panel.js
Biography.js
Albums.js

Reload

Clear

Fork
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
import { Suspense } from 'react';
import Albums from './Albums.js';
import Biography from './Biography.js';
import Panel from './Panel.js';

export default function ArtistPage({ artist }) {
  return (
    <>
      <h1>{artist.name}</h1>
      <Suspense fallback={<BigSpinner />}>
        <Biography artistId={artist.id} />
        <Suspense fallback={<AlbumsGlimmer />}>
          <Panel>
            <Albums artistId={artist.id} />
          </Panel>
        </Suspense>
      </Suspense>
    </>
  );
}

function BigSpinner() {
  return <h2>🌀 Loading...</h2>;
}

function AlbumsGlimmer() {
  return (
    <div className="glimmer-panel">
      <div className="glimmer-line" />
      <div className="glimmer-line" />
      <div className="glimmer-line" />
    </div>
  );
}



Show more
Suspense boundaries let you coordinate which parts of your UI should always “pop in” together at the same time, and which parts should progressively reveal more content in a sequence of loading states. You can add, move, or delete Suspense boundaries in any place in the tree without affecting the rest of your app’s behavior.

Don’t put a Suspense boundary around every component. Suspense boundaries should not be more granular than the loading sequence that you want the user to experience. If you work with a designer, ask them where the loading states should be placed—it’s likely that they’ve already included them in their design wireframes.

Showing stale content while fresh content is loading 
In this example, the SearchResults component suspends while fetching the search results. Type "a", wait for the results, and then edit it to "ab". The results for "a" will get replaced by the loading fallback.

App.js
SearchResults.js

Reload

Clear

Fork
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
import { Suspense, useState } from 'react';
import SearchResults from './SearchResults.js';

export default function App() {
  const [query, setQuery] = useState('');
  return (
    <>
      <label>
        Search albums:
        <input value={query} onChange={e => setQuery(e.target.value)} />
      </label>
      <Suspense fallback={<h2>Loading...</h2>}>
        <SearchResults query={query} />
      </Suspense>
    </>
  );
}



Show more
A common alternative UI pattern is to defer updating the list and to keep showing the previous results until the new results are ready. The useDeferredValue Hook lets you pass a deferred version of the query down:

export default function App() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  return (
    <>
      <label>
        Search albums:
        <input value={query} onChange={e => setQuery(e.target.value)} />
      </label>
      <Suspense fallback={<h2>Loading...</h2>}>
        <SearchResults query={deferredQuery} />
      </Suspense>
    </>
  );
}
The query will update immediately, so the input will display the new value. However, the deferredQuery will keep its previous value until the data has loaded, so SearchResults will show the stale results for a bit.

To make it more obvious to the user, you can add a visual indication when the stale result list is displayed:

<div style={{
  opacity: query !== deferredQuery ? 0.5 : 1 
}}>
  <SearchResults query={deferredQuery} />
</div>
Enter "a" in the example below, wait for the results to load, and then edit the input to "ab". Notice how instead of the Suspense fallback, you now see the dimmed stale result list until the new results have loaded:


App.js

Reload

Clear

Fork
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
import { Suspense, useState, useDeferredValue } from 'react';
import SearchResults from './SearchResults.js';

export default function App() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;
  return (
    <>
      <label>
        Search albums:
        <input value={query} onChange={e => setQuery(e.target.value)} />
      </label>
      <Suspense fallback={<h2>Loading...</h2>}>
        <div style={{ opacity: isStale ? 0.5 : 1 }}>
          <SearchResults query={deferredQuery} />
        </div>
      </Suspense>
    </>
  );
}



Show more
Note
Both deferred values and Transitions let you avoid showing Suspense fallback in favor of inline indicators. Transitions mark the whole update as non-urgent so they are typically used by frameworks and router libraries for navigation. Deferred values, on the other hand, are mostly useful in application code where you want to mark a part of UI as non-urgent and let it “lag behind” the rest of the UI.

Preventing already revealed content from hiding 
When a component suspends, the closest parent Suspense boundary switches to showing the fallback. This can lead to a jarring user experience if it was already displaying some content. Try pressing this button:


App.js

Reload

Clear

Fork
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
import { Suspense, useState } from 'react';
import IndexPage from './IndexPage.js';
import ArtistPage from './ArtistPage.js';
import Layout from './Layout.js';

export default function App() {
  return (
    <Suspense fallback={<BigSpinner />}>
      <Router />
    </Suspense>
  );
}

function Router() {
  const [page, setPage] = useState('/');

  function navigate(url) {
    setPage(url);
  }

  let content;
  if (page === '/') {
    content = (
      <IndexPage navigate={navigate} />
    );
  } else if (page === '/the-beatles') {
    content = (
      <ArtistPage
        artist={{
          id: 'the-beatles',
          name: 'The Beatles',
        }}
      />
    );
  }
  return (


Show more
When you pressed the button, the Router component rendered ArtistPage instead of IndexPage. A component inside ArtistPage suspended, so the closest Suspense boundary started showing the fallback. The closest Suspense boundary was near the root, so the whole site layout got replaced by BigSpinner.

To prevent this, you can mark the navigation state update as a Transition with startTransition:

function Router() {
  const [page, setPage] = useState('/');

  function navigate(url) {
    startTransition(() => {
      setPage(url);      
    });
  }
  // ...
This tells React that the state transition is not urgent, and it’s better to keep showing the previous page instead of hiding any already revealed content. Now clicking the button “waits” for the Biography to load:


App.js

Reload

Clear

Fork
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
import { Suspense, startTransition, useState } from 'react';
import IndexPage from './IndexPage.js';
import ArtistPage from './ArtistPage.js';
import Layout from './Layout.js';

export default function App() {
  return (
    <Suspense fallback={<BigSpinner />}>
      <Router />
    </Suspense>
  );
}

function Router() {
  const [page, setPage] = useState('/');

  function navigate(url) {
    startTransition(() => {
      setPage(url);
    });
  }

  let content;
  if (page === '/') {
    content = (
      <IndexPage navigate={navigate} />
    );
  } else if (page === '/the-beatles') {
    content = (
      <ArtistPage
        artist={{
          id: 'the-beatles',
          name: 'The Beatles',
        }}
      />
    );


Show more
A Transition doesn’t wait for all content to load. It only waits long enough to avoid hiding already revealed content. For example, the website Layout was already revealed, so it would be bad to hide it behind a loading spinner. However, the nested Suspense boundary around Albums is new, so the Transition doesn’t wait for it.

Note
Suspense-enabled routers are expected to wrap the navigation updates into Transitions by default.

Indicating that a Transition is happening 
In the above example, once you click the button, there is no visual indication that a navigation is in progress. To add an indicator, you can replace startTransition with useTransition which gives you a boolean isPending value. In the example below, it’s used to change the website header styling while a Transition is happening:


App.js

Reload

Clear

Fork
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
import { Suspense, useState, useTransition } from 'react';
import IndexPage from './IndexPage.js';
import ArtistPage from './ArtistPage.js';
import Layout from './Layout.js';

export default function App() {
  return (
    <Suspense fallback={<BigSpinner />}>
      <Router />
    </Suspense>
  );
}

function Router() {
  const [page, setPage] = useState('/');
  const [isPending, startTransition] = useTransition();

  function navigate(url) {
    startTransition(() => {
      setPage(url);
    });
  }

  let content;
  if (page === '/') {
    content = (
      <IndexPage navigate={navigate} />
    );
  } else if (page === '/the-beatles') {
    content = (
      <ArtistPage
        artist={{
          id: 'the-beatles',
          name: 'The Beatles',
        }}
      />


Show more
Resetting Suspense boundaries on navigation 
During a Transition, React will avoid hiding already revealed content. However, if you navigate to a route with different parameters, you might want to tell React it is different content. You can express this with a key:

<ProfilePage key={queryParams.id} />
Imagine you’re navigating within a user’s profile page, and something suspends. If that update is wrapped in a Transition, it will not trigger the fallback for already visible content. That’s the expected behavior.

However, now imagine you’re navigating between two different user profiles. In that case, it makes sense to show the fallback. For example, one user’s timeline is different content from another user’s timeline. By specifying a key, you ensure that React treats different users’ profiles as different components, and resets the Suspense boundaries during navigation. Suspense-integrated routers should do this automatically.

Providing a fallback for server errors and client-only content 
If you use one of the streaming server rendering APIs (or a framework that relies on them), React will also use your <Suspense> boundaries to handle errors on the server. If a component throws an error on the server, React will not abort the server render. Instead, it will find the closest <Suspense> component above it and include its fallback (such as a spinner) into the generated server HTML. The user will see a spinner at first.

On the client, React will attempt to render the same component again. If it errors on the client too, React will throw the error and display the closest Error Boundary. However, if it does not error on the client, React will not display the error to the user since the content was eventually displayed successfully.

You can use this to opt out some components from rendering on the server. To do this, throw an error in the server environment and then wrap them in a <Suspense> boundary to replace their HTML with fallbacks:

<Suspense fallback={<Loading />}>
  <Chat />
</Suspense>

function Chat() {
  if (typeof window === 'undefined') {
    throw Error('Chat should only render on the client.');
  }
  // ...
}
The server HTML will include the loading indicator. It will be replaced by the Chat component on the client.

Troubleshooting 
How do I prevent the UI from being replaced by a fallback during an update? 
Replacing visible UI with a fallback creates a jarring user experience. This can happen when an update causes a component to suspend, and the nearest Suspense boundary is already showing content to the user.

To prevent this from happening, mark the update as non-urgent using startTransition. During a Transition, React will wait until enough data has loaded to prevent an unwanted fallback from appearing:

function handleNextPageClick() {
  // If this update suspends, don't hide the already displayed content
  startTransition(() => {
    setCurrentPage(currentPage + 1);
  });
}
This will avoid hiding existing content. However, any newly rendered Suspense boundaries will still immediately display fallbacks to avoid blocking the UI and let the user see the content as it becomes available.

React will only prevent unwanted fallbacks during non-urgent updates. It will not delay a render if it’s the result of an urgent update. You must opt in with an API like startTransition or useDeferredValue.

If your router is integrated with Suspense, it should wrap its updates into startTransition automatically.