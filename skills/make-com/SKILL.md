---
name: make-com
description: >-
  Generate Make.com (formerly Integromat) scenario blueprints as valid importable JSON.
  Corrects: invented module names that don't exist, wrong JSON structure, incorrect
  mapper reference syntax ({{moduleId.field}} not {{module.field}}), missing metadata
  that causes import failures, confusing filters with modules.
  Use when building Make.com automations: "build a Make.com scenario",
  "create a Make.com integration", "automate X with Make", "Make.com blueprint",
  "Make.com scenario", "build this in Make".
  Output is always a valid JSON blueprint the user imports — never executable code.
  Never substitute JavaScript or Python. Hunter pastes and connects accounts himself.
---

# Make.com Scenario Blueprints

## What goes wrong without this skill

- **Invented module names**: `google-sheets:WriteRow` doesn't exist. It's `google-sheets:addRow`. Wrong names silently fail on import.
- **Wrong mapper syntax**: Claude writes `{{module.field}}` or `{{output.field}}`. Correct is `{{moduleId.field}}` where moduleId is the integer `"id"` of the source module.
- **Missing metadata block**: Blueprints without the top-level `metadata` object fail to import.
- **Filters as modules**: Filters are not modules. They are `filter` keys on router routes.
- **Wrong instant flag**: Webhook triggers require `"instant": true` in metadata. Polling triggers need `false`. Getting this wrong breaks scheduling.

---

## Blueprint JSON Structure

Every Make.com blueprint is a single JSON object with exactly this shape:

```json
{
  "name": "Scenario Name",
  "flow": [],
  "metadata": {
    "instant": false,
    "version": 1,
    "scenario": {
      "roundtrips": 1,
      "maxErrors": 3,
      "autoCommit": true,
      "autoCommitTriggerLast": true,
      "sequential": false,
      "confidential": false,
      "dataloss": false
    },
    "designer": { "orphans": [] }
  }
}
```

Set `"instant": true` only when the trigger module is a webhook (`webhook:CustomWebHook`, `typeform:watchResponses`, etc.).

---

## Module Object Shape

```json
{
  "id": 1,
  "module": "bundleId:actionId",
  "version": 1,
  "parameters": {},
  "mapper": {},
  "metadata": {
    "designer": { "x": 0, "y": 0 }
  }
}
```

- `id`: sequential integers starting at 1. Router branches continue the sequence inside `routes`.
- `parameters`: static configuration — which connection, which spreadsheet ID, which table. These are set by the user in Make's UI after import.
- `mapper`: dynamic data — expressions referencing prior module outputs. This is where `{{n.field}}` syntax goes.
- Place modules 300px apart in x: `"designer": {"x": 0}`, `"designer": {"x": 300}`, etc.

---

## Mapper Syntax — The Most Critical Part

Previous module output referenced as `{{moduleId.field}}`:

```json
"mapper": {
  "to": "{{1.email}}",
  "subject": "New submission: {{1.name}}",
  "body": "{{1.firstName}} {{1.lastName}} submitted at {{now}}"
}
```

- `1` is the `"id"` value of the source module — an integer, not the module name
- Nested: `{{1.address.city}}`
- Array item field: `{{1.items[].name}}`
- Date format: `{{formatDate(1.submittedAt; "YYYY-MM-DD")}}`
- Current timestamp: `{{now}}`

**Never use**: `{{module.field}}`, `{{output.field}}`, `{{$json.field}}`, `{{trigger.field}}`

---

## Verified Module Names

These exist. Do not invent others. If uncertain, use `http:ActionSendData`.

**Triggers (go first in flow, drive instant/polling setting):**
```
webhook:CustomWebHook          → instant: true
google-sheets:watchRows        → instant: false
airtable:watchRecords          → instant: false
gmail:TriggerEmail             → instant: false
typeform:watchResponses        → instant: true
rss:triggerFeed                → instant: false
slack:getTriggerEvent          → instant: true
```

**Actions:**
```
http:ActionSendData            → HTTP request (method, URL, headers, body)
google-sheets:addRow           → append row
google-sheets:updateRow        → update row by row number
google-sheets:searchRows       → find rows matching value
google-sheets:getRow           → get row by number
airtable:createRecord          → create record
airtable:updateRecord          → update by record ID
airtable:searchRecords         → search by formula
gmail:ActionSendEmail          → send email via Gmail
slack:createMessage            → post message to channel
openai:CreateChatCompletion    → chat completion (GPT-4o, etc.)
json:ParseJSON                 → parse a JSON string into fields
json:CreateJSON                → build JSON string from mapped fields
tools:SetVariables             → store and transform values
builtin:BasicFeeder            → iterator — loop over each item in an array
builtin:BasicRouter            → router — split into parallel branches
builtin:BasicAggregator        → aggregate array back to single bundle
```

---

## HTTP Request Module (Safe Default for Unknown APIs)

When the target service has no dedicated module, use this:

```json
{
  "id": 2,
  "module": "http:ActionSendData",
  "version": 3,
  "parameters": { "handleErrors": false },
  "mapper": {
    "url": "https://api.example.com/endpoint",
    "method": "post",
    "headers": [
      { "name": "Authorization", "value": "Bearer YOUR_TOKEN" },
      { "name": "Content-Type", "value": "application/json" }
    ],
    "bodyType": "raw",
    "contentType": "application/json",
    "data": "{\"email\": \"{{1.email}}\", \"name\": \"{{1.name}}\"}",
    "parseResponse": true
  },
  "metadata": { "designer": { "x": 300, "y": 0 } }
}
```

---

## Router Pattern

A router splits the flow into parallel branches. Branches are nested `flow` arrays inside the router's `routes`. Module IDs continue sequentially inside routes.

```json
{
  "id": 3,
  "module": "builtin:BasicRouter",
  "version": 1,
  "parameters": {},
  "mapper": {},
  "routes": [
    {
      "flow": [
        {
          "id": 4,
          "module": "gmail:ActionSendEmail",
          "version": 1,
          "parameters": {},
          "mapper": { "to": "{{1.email}}", "subject": "Approved" },
          "metadata": { "designer": { "x": 600, "y": -150 } }
        }
      ],
      "label": "Approved",
      "filter": {
        "name": "Status is approved",
        "conditions": [[
          { "a": "{{1.status}}", "b": "approved", "o": "text:equal" }
        ]]
      }
    },
    {
      "flow": [],
      "label": "Other"
    }
  ],
  "metadata": { "designer": { "x": 300, "y": 0 } }
}
```

Filter condition operators:
```
text:equal          text:notequal       text:contains
number:equal        number:greater      number:less
boolean:equal       general:exist       general:notexist
```

Conditions array is an array of arrays (outer = OR groups, inner = AND conditions).

---

## Iterator Pattern

When a prior module returns an array and you need to process each item:

```json
{
  "id": 4,
  "module": "builtin:BasicFeeder",
  "version": 1,
  "parameters": { "array": "{{2.items}}" },
  "mapper": {},
  "metadata": { "designer": { "x": 600, "y": 0 } }
}
```

After this module, `{{4.value}}` refers to each item in the array during iteration. Specific fields: `{{4.value.email}}`, `{{4.value.name}}`.

---

## Output Format

1. Output raw JSON only. No markdown code fences wrapping the entire blueprint.
2. After the JSON, add a plain-text section:

```
CONNECTIONS NEEDED:
  - [Service name] — [credential type, e.g. OAuth2 or API Key]

REPLACE THESE:
  - [any placeholder value and where it appears]

TRIGGER TYPE: [instant webhook / polling — recommended interval if polling]

IMPORT STEPS:
  1. Go to Make.com → Scenarios → Import Blueprint
  2. Paste this JSON
  3. Connect accounts when prompted
  4. Set schedule if polling trigger
  5. Activate
```

3. Never include real API keys or tokens in the blueprint.
4. Never execute or simulate. Hunter imports and activates manually.
