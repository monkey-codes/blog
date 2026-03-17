# API Reference

Public REST API for accessing candidate data. All endpoints use the Supabase REST (PostgREST) interface.

## Base URL

**Local development:**
```
http://127.0.0.1:54321/rest/v1
```

**Production:**
```
https://<PROJECT_REF>.supabase.co/rest/v1
```

## Authentication

All requests require the publishable anon key in both headers:

```
apikey: <SUPABASE_ANON_KEY>
Authorization: Bearer <SUPABASE_ANON_KEY>
```

## Filtering & Pagination

These endpoints support standard [PostgREST query parameters](https://postgrest.org/en/stable/references/api/tables_views.html):

| Parameter | Example | Description |
|-----------|---------|-------------|
| `select` | `?select=full_name,headline` | Return only specific columns |
| `eq` | `?candidate_id=eq.<uuid>` | Filter by exact match |
| `order` | `?order=display_order.asc` | Sort results |
| `limit` | `?limit=10` | Limit number of rows |
| `offset` | `?offset=5` | Skip rows for pagination |

Request a single object (instead of an array) by adding the header:

```
Accept: application/vnd.pgrst.object+json
```

---

## Endpoints

### GET `/candidate_profiles_public`

Returns candidate profile information (personal/contact details, no salary or private fields).

**Response:** `application/json` — array of objects

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | `uuid` | no | Candidate ID |
| `full_name` | `string` | no | Full name |
| `headline` | `string` | yes | Professional headline |
| `elevator_pitch` | `string` | yes | Short career summary |
| `location` | `string` | yes | Geographic location |
| `remote_preference` | `string` | yes | e.g. `"remote"`, `"hybrid"`, `"onsite"` |
| `github_url` | `string` | yes | GitHub profile URL |
| `linkedin_url` | `string` | yes | LinkedIn profile URL |
| `twitter_url` | `string` | yes | Twitter/X profile URL |
| `website_url` | `string` | yes | Personal website URL |

<details>
<summary>Example response</summary>

```json
[
  {
    "id": "e1855555-de6c-4fe8-b5d9-f95142681a1b",
    "full_name": "Johan Zietsman",
    "headline": "Data Infrastructure Engineer at Block/Cash App | Streaming & Batch Data Systems at Scale | Kafka, Kotlin, DynamoDB, Spark, AWS",
    "elevator_pitch": "Software engineer with 20+ years of experience, currently focused on data infrastructure at Block/Cash App...",
    "location": "Brisbane, Australia",
    "remote_preference": "remote",
    "github_url": "https://github.com/monkey-codes",
    "linkedin_url": "https://www.linkedin.com/in/johan-zietsman",
    "twitter_url": null,
    "website_url": "https://johanzietsman.com"
  }
]
```

</details>

---

### GET `/experiences_public`

Returns work experience entries, ordered by `display_order` ascending.

**Response:** `application/json` — array of objects

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | `uuid` | no | Experience entry ID |
| `candidate_id` | `uuid` | no | FK to candidate profile |
| `company_name` | `string` | no | Company name |
| `title` | `string` | no | Job title |
| `start_date` | `date` | no | Start date (`YYYY-MM-DD`) |
| `end_date` | `date` | yes | End date (`YYYY-MM-DD`), `null` if current |
| `is_current` | `boolean` | no | Whether this is the current role |
| `bullet_points` | `string[]` | yes | Array of achievement/responsibility descriptions |
| `display_order` | `integer` | no | Sort order (lower = more recent) |

<details>
<summary>Example response</summary>

```json
[
  {
    "id": "e014fd9d-f286-458f-8d3f-674737de26fe",
    "candidate_id": "e1855555-de6c-4fe8-b5d9-f95142681a1b",
    "company_name": "Block / Cash App",
    "title": "Machine Learning Engineer (Systems) L6",
    "start_date": "2023-11-01",
    "end_date": null,
    "is_current": true,
    "bullet_points": [
      "Migrated 134 Kafka event pipelines from legacy data-centre infrastructure...",
      "Built the critical production pipeline (Argo path)..."
    ],
    "display_order": 1
  }
]
```

</details>

---

### GET `/skills_public`

Returns skills with proficiency category and years of experience.

**Response:** `application/json` — array of objects

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | `uuid` | no | Skill entry ID |
| `candidate_id` | `uuid` | no | FK to candidate profile |
| `skill_name` | `string` | no | Name of the skill |
| `category` | `string` | no | One of: `"strong"`, `"moderate"`, `"gap"` |
| `years_experience` | `number` | yes | Years of experience (0 for gaps) |

<details>
<summary>Example response</summary>

```json
[
  {
    "id": "f305ecbf-2172-4a96-93b7-72709d437966",
    "candidate_id": "e1855555-de6c-4fe8-b5d9-f95142681a1b",
    "skill_name": "Kotlin",
    "category": "strong",
    "years_experience": 7
  },
  {
    "id": "0de2df0e-7abf-4c32-934a-0efc30537b86",
    "candidate_id": "e1855555-de6c-4fe8-b5d9-f95142681a1b",
    "skill_name": "Machine Learning / ML Modeling",
    "category": "gap",
    "years_experience": 0
  }
]
```

</details>

---

### GET `/faq_responses_public`

Returns frequently asked questions and answers. Only includes entries marked as common questions.

**Response:** `application/json` — array of objects

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | `uuid` | no | FAQ entry ID |
| `candidate_id` | `uuid` | no | FK to candidate profile |
| `question` | `string` | no | The question |
| `answer` | `string` | no | The candidate's answer |

<details>
<summary>Example response</summary>

```json
[
  {
    "id": "80aba7e4-e3a0-4ffa-a6d2-4266b5bcc5ec",
    "candidate_id": "e1855555-de6c-4fe8-b5d9-f95142681a1b",
    "question": "Why are you looking for a new role?",
    "answer": "I'm looking for a new challenge. I've delivered significant impact at Block across multiple large-scale data infrastructure projects and I'm ready for the next thing."
  }
]
```

</details>

---

## Common Query Examples

**Get a specific candidate's profile:**
```
GET /candidate_profiles_public?id=eq.<candidate_id>
```

**Get all experiences for a candidate:**
```
GET /experiences_public?candidate_id=eq.<candidate_id>&order=display_order.asc
```

**Get only strong skills:**
```
GET /skills_public?candidate_id=eq.<candidate_id>&category=eq.strong
```

**Select specific fields:**
```
GET /candidate_profiles_public?select=full_name,headline,location
```
