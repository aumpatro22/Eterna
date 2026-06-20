# Eterna V1 Release Audit Report

**Date of Audit:** June 20, 2026  
**Auditor Status:** Senior Software Architect, Security Engineer, & UX Reviewer  

---

## Executive Summary & Readiness Scores

Eterna is a memory preservation platform built on a core philosophy: **memories are the content, stories are the bridge, and human connection is the outcome**. It rejects the hook-based, addictive mechanics of modern social media (followers, likes, Reels, infinite scroll, trending algorithms) in favor of a quiet, warm, journal-style scrapbook experience.

While the design aesthetics, landing page storytelling, and baseline access controls are highly aligned with this mission, the system currently contains **critical security and privacy issues** that must be resolved prior to release.

| Dimension | Score (0–10) | Rating |
| :--- | :--- | :--- |
| **Security Audit** | **3 / 10** | Critical Issues Found ❌ |
| **Test Coverage** | **4 / 10** | Missing Major App CRUD Coverage ⚠️ |
| **User Experience** | **7 / 10** | Satisfactory but has Missing Flows ⚠️ |
| **Performance** | **6 / 10** | Optimization & Caching Opportunities ⚠️ |
| **Accessibility** | **6 / 10** | Basic Support, Lacks Screen Reader Semantics ⚠️ |
| **Overall Confidence** | **35%** | **Not Ready** 🔴 |

### RELEASE STATUS
> [!CAUTION]
> **🔴 Not Ready (Launch Blocked by Critical Security & Privacy Issues)**
>
> We recommend blocking the production deployment until the **User Email Exposure**, **Private Memorial IDORs**, **File Upload Validation**, and **Rate Limiting** issues are resolved.

---

## PART 1 — SECURITY AUDIT

### 1. User Email Exposure (IDOR & Privacy)
* **Problem:** The Django REST Framework serializes user data via `UserSerializer` inside the public `ProfileSerializer`. This includes the user's registered email address.
* **Why it matters:** Anyone querying a public profile (or any circle connection) gets the user's email address returned in the JSON payload (`profile.user.email`). This is a severe privacy breach, exposing users to spam, scraping, phishing, and stalker risk.
* **Risk Level:** **CRITICAL ❌**
* **Recommendation:** Create a `UserPublicSerializer` that serializes only public fields (`id`, `username`, `first_name`, `last_name`) and excludes the `email` field, using it for all public-facing profile serializations.

---

### 2. Guestbook & Candle IDOR on Private Memorials
* **Problem:** The endpoints `/api/memorials/<pk>/messages/` (`add_message`) and `/api/memorials/<pk>/candles/` (`light_candle`) retrieve the target `Memorial` via `get_object_or_404(Memorial, pk=pk)` but **do not check its visibility or owner/contributor relationships**.
* **Why it matters:** Any visitor (even anonymous) can manually submit a POST request to add a message or light a candle on a private memorial if they know or guess the integer database ID. This bypasses the memorial's private scope check.
* **Risk Level:** **CRITICAL ❌**
* **Recommendation:** Implement a permission check inside `add_message` and `light_candle` views to reject the request with `403 Forbidden` if the memorial is private and the user is not the owner or a registered contributor.

---

### 3. Missing Backend File Upload Validation
* **Problem:** The system supports image and voice note uploads across profiles, memorials, memories, and noticeboard messages but performs **no backend file validation** (mime-type verification, extension whitelist, or file size limits).
* **Why it matters:** An attacker can upload arbitrary dangerous files (such as `.exe`, `.js`, or `.zip` files) to the media storage. If the hosting provider serves media with executable permissions, this can lead to Remote Code Execution (RCE). Furthermore, massive image files (e.g., 50MB raw formats) can be uploaded, causing server storage exhaustion.
* **Risk Level:** **CRITICAL ❌**
* **Recommendation:** Write a reusable Django validator class for `FileField` and `ImageField` that validates the file extension against a whitelist (`jpg`, `jpeg`, `png`, `webp`, `mp3`, `wav`, `m4a`), checks the actual magic number (MIME-type), and caps file size (e.g., 5MB for photos, 10MB for audio).

---

### 4. No Rate Limiting (Brute Force & Flooding)
* **Problem:** Django REST Framework throttles are completely omitted from `settings.py`. There are no rate-limiting decorators or middlewares active.
* **Why it matters:** Attackers can brute-force password/login endpoints (`/api/auth/login/`), flood direct messages (`/api/conversations/<pk>/messages/send/`), create thousands of duplicate accounts, or spam safety reports to overwhelm moderators.
* **Risk Level:** **CRITICAL ❌**
* **Recommendation:** Configure global rate-limiting classes inside `settings.py` under the `REST_FRAMEWORK` settings:
  ```python
  'DEFAULT_THROTTLE_CLASSES': [
      'rest_framework.throttling.AnonRateThrottle',
      'rest_framework.throttling.UserRateThrottle'
  ],
  'DEFAULT_THROTTLE_RATES': {
      'anon': '60/minute',
      'user': '1000/day',
  }
  ```
  Apply stricter throttles on authentication and message-sending views.

---

### 5. Lack of Community User Blocking System
* **Problem:** There is no community-level block list. If a moderator removes a member from a public community, the removed user can immediately request access again or spam invitations.
* **Why it matters:** Disruptive users cannot be permanently banned from requesting access to a public community, creating an emotional safety issue for community members.
* **Risk Level:** **WARNING ⚠️**
* **Recommendation:** Create a `CommunityBlock` model (`community`, `user`, `blocked_by`, `created_at`) and verify inside the `join_community` request flow that the user is not on this block list.

---

### 6. Contributor Delete Privilege Overlap
* **Problem:** In `delete_memory`, any user verified as a contributor to the memorial can delete any memory:
  ```python
  if memorial.owner != user and not is_contributor and memory.author != user:
      raise PermissionDenied()
  ```
* **Why it matters:** A regular contributor can delete a memory written by another contributor or family member.
* **Risk Level:** **WARNING ⚠️**
* **Recommendation:** Restrict memory deletion to the memorial owner and the memory's original author:
  ```python
  if memorial.owner != user and memory.author != user:
      return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
  ```

---

### 7. Client-Side XSS Reliance
* **Problem:** Safe rendering is performed entirely on the React client side. The backend does not sanitize HTML tags on text fields (e.g., memory stories, tale contents, and direct messages) before storing them.
* **Why it matters:** If other clients (such as email newsletters, RSS feeds, or third-party APIs) render Eterna data without strict escaping, they will be vulnerable to Stored XSS.
* **Risk Level:** **WARNING ⚠️**
* **Recommendation:** Install `django-bleach` and sanitize all stored text inputs in the serializers before saving.

---

## PART 2 — TEST COVERAGE

### Existing Tests
We implemented **6 automated integration test cases** in `users/tests.py` covering:
* Profile privacy rules (`CONNECTIONS_ONLY` and `PRIVATE` access blocks).
* Profile timeline event adding/deleting.
* Direct message conversation flows, text sends, blocking enforcement, and block-owner check.
* Content safety reports filing using `GenericForeignKey` content types.
* Community co-admin limits (enforcing the maximum limit of 3 co-admins).

### Missing Tests
* **Memorials App (0%):** Missing tests for Memorial creation, updating, deletion, invitation lifecycles, contributor approvals, candle lighting, and guestbook messages.
* **Tales App (0%):** Missing tests for Tale publishing, chapter addition, re-ordering, and page-splitting.
* **Communities App (0%):** Missing tests for community creation, request lists, request responses, and archiving.
* **Frontend App (0%):** No unit testing or end-to-end Cypress/Playwright suites.

---

## PART 3 — USER EXPERIENCE REVIEW

### 1. Missing About Page
* **Problem:** The landing page makes strong claims about Eterna's philosophy (no ads, no algorithms, no likes), but the About route is missing.
* **Why it matters:** First-time users cannot read the manifesto, which is critical for explaining Eterna's financial model and long-term memory preservation trust.
* **Risk Level:** **CRITICAL ❌**
* **Recommendation:** Build `/about` detailing Eterna's purpose, funding model (privacy-first, no ad-tech), and architectural refusal of standard social media elements.

### 2. Community Settings Modification UI
* **Problem:** There is no frontend interface for community admins to update community details (rules, welcome messages, icons, covers) after creation. These settings can only be managed in the Django admin panel.
* **Why it matters:** Users who create a support circle cannot update rules or welcome messages as the circle grows.
* **Risk Level:** **WARNING ⚠️**
* **Recommendation:** Create a "Settings" tab in the moderator panel of the community detail page to POST changes to a new patch settings endpoint.

---

## PART 4 — LANDING PAGE REVIEW

* **Storytelling and Emotion:** **PASS ✅ (Excellent)**. The page avoids standard SaaS grids and instead uses a handcrafted, notebook-inspired interface (pressed flower SVGs, ink splashes, doodle arrows).
* **Core Message:** Emphasizes preservation, storytelling, and emotional validation rather than addictive feeds.
* **CTA and Flow:** Clear navigation to register or view memorials, leading the user directly to the core experience.

---

## PART 5 — PERFORMANCE REVIEW

### 1. N+1 Queries on Memorials Listing
* **Problem:** `MemorialListView` queries `Memorial.objects` and uses `select_related('owner')`, but serializes many-to-many `tags` using `ExperienceTagSerializer` without fetching them in the database query.
* **Why it matters:** When listing memorials (6 per page), Django executes a separate database query to fetch tags for *every* memorial, leading to N+1 query overhead.
* **Risk Level:** **WARNING ⚠️**
* **Recommendation:** Add `prefetch_related('tags')` to the `MemorialListView` queryset.

### 2. Large Image Delivery
* **Problem:** User uploads are stored in original sizes and served directly via `/media/`.
* **Why it matters:** Large mobile photos (5–10MB) can cause significant page lag and excessive bandwidth consumption.
* **Risk Level:** **WARNING ⚠️**
* **Recommendation:** Implement image resizing on the backend using Pillow during model `save()` operations, converting all profile and cover uploads to optimized WebP formats.

---

## PART 6 — ACCESSIBILITY

* **Decorative Elements:** The pressed flower and arrow SVGs lack `aria-hidden="true"`, causing screen readers to read raw SVG tags.
* **Interactive Elements:** Focus rings are suppressed or customized in `index.css` without keyboard-visible focus state alternatives.
* **Recommendation:** 
  * Add `aria-hidden="true"` to all decorative SVGs.
  * Enforce visible `:focus-visible` outlines using a custom dotted border.
