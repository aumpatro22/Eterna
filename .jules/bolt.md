## 2025-06-23 - Fixed N+1 queries in Memorial Detail View
**Learning:** Found an N+1 query issue for the `Memory` models nested within the memorial. In particular, accessing `memories` causes a query, and for each memory, accessing the `author` (specifically `author_username`) causes an additional query.
**Action:** Use `.prefetch_related('memories__author', 'tags', 'messages', 'candles', 'photos', 'timeline_events')` to fetch the nested models and memory authors efficiently without triggering an additional query for each memory author.

## 2024-08-06 - N+1 Queries on Generic Foreign Keys
**Learning:** Using `select_related` only fetches normal foreign keys. Using Generic Foreign Keys like `content_object` within loops without prefetching leads to N+1 performance bottlenecks.
**Action:** Use `.prefetch_related('content_object')` on QuerySets that pull `GenericForeignKey` relationships that will be iterated over.
