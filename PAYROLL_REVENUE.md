# Payroll Developer Fee & Payroll Revenue

This document covers the **0.8% payroll developer fee** and the admin
**Payroll Revenue** reporting endpoint.

---

## 1. Overview

A configurable developer fee is withheld from **every company → team payroll
transfer**, whether triggered via **Pay Now** (single member, group, or all) or
via **scheduled payroll group runs** (including retries and top-up repairs).

The fee is collected using Bridge's native
[developer fee](https://apidocs.bridge.xyz/platform/orchestration/fees-and-mins/devfees)
(`developer_fee` on `POST /v0/transfers`). The company's Bridge wallet is
debited the **gross** amount (net salary + fee); the team member still receives
their **full net** salary. In other words, the fee is effectively deducted from
the company's wallet balance.

Non-payroll transfers (company self-withdrawals, team crypto withdrawals, team
fiat off-ramps, virtual-account on-ramps) are **not** charged this fee.

---

## 2. Configuration

The fee percentage is controlled by a single environment variable:

```bash
# Percent (0–99) of each payroll transfer withheld as the developer fee.
# Default: 0 (fee disabled). Set to 0.8 for the current 0.8% fee.
PAYROLL_DEVELOPER_FEE_PERCENT=0.8
```

- Unset / empty / non-numeric / negative → treated as `0` (no fee).
- Values above `99` are capped at `99`.
- Must be set in **every** environment (local, staging, production) where the
  fee should apply. `.env` is not committed, so remember to configure the
  deployment environment (e.g. Render) explicitly.

Implementation lives in `src/modules/bridge/bridge-wallet.ts`
(`getPayrollRunDeveloperFeePercent`, `grossUpForDeveloperFee`,
`estimateDeveloperFee`, and the `developer_fee` field in `createCryptoTransfer`).

---

## 3. Fee mechanics (gross-up)

For a configured **net** salary `N` and fee percent `P`, we send a **gross**
amount `G` such that, after Bridge withholds `floor(G_cents * P / 100)`, the
recipient nets exactly `N`:

```
feeCents   = floor(G_cents * P / 100)
G_cents    = N_cents + feeCents      (smallest G that lands exactly on N)
```

### Worked example (P = 0.8%)

| Configured net (team receives) | Gross debited from company | Developer fee collected |
| ------------------------------ | -------------------------- | ----------------------- |
| `100.00`                       | `100.81`                   | `0.81`                  |
| `500.00`                       | `504.04`                   | `4.04`                  |
| `1000.00`                      | `1008.07`                  | `8.07`                  |
| `2500.00`                      | `2520.17`                  | `20.17`                 |

> The fee is stored per transfer as `grossAmount - netAmount`, which equals the
> `developer_fee` sent to Bridge for that transfer.

---

## 4. Admin endpoint — Payroll Revenue

```
GET /admin-dashboard/payroll-revenue
```

- **Auth:** `AdminJwtGuard` — requires a valid admin bearer token
  (`Authorization: Bearer <adminAccessToken>`).
- Returns aggregate revenue **stats** plus a paginated **list** of individual
  payroll transfers and the fee withheld from each.

### Query parameters

| Param       | Type   | Default | Notes                                                                           |
| ----------- | ------ | ------- | ------------------------------------------------------------------------------- |
| `page`      | number | `1`     | 1-based page index.                                                             |
| `limit`     | number | `20`    | Page size (max `100`).                                                          |
| `companyId` | string | —       | Restrict to a single company.                                                   |
| `status`    | enum   | —       | Filter list rows: `INITIATED` \| `PROCESSING` \| `SUCCESSFUL` \| `FAILED`.      |
| `from`      | ISO    | —       | Inclusive lower bound on transfer time (e.g. `2026-07-01`).                     |
| `to`        | ISO    | —       | Inclusive upper bound on transfer time.                                         |

> The `stats` totals are always computed across **all** statuses (respecting
> `companyId`/`from`/`to`), so a `status` filter narrows only the list rows, not
> the revenue totals.

### Response shape

```jsonc
{
  "success": true,
  "statusCode": 200,
  "message": "Payroll revenue fetched successfully.",
  "data": {
    "stats": {
      "payrollRevenue": "33.09",       // fees collected on SUCCESSFUL transfers
      "pendingRevenue": "8.07",        // fees on INITIATED/PROCESSING transfers
      "currency": "USDC",
      "feePercent": 0.8,               // currently configured fee percent
      "settledTransferCount": 3,
      "pendingTransferCount": 1
    },
    "data": [
      {
        "transactionId": "b1e0…",
        "bridgeTransactionId": "transfer_abc123",
        "company": { "id": "cmp_123", "name": "Acme Inc." },
        "recipient": {
          "name": "Ada Lovelace",
          "email": "ada@acme.com",
          "walletAddress": "0xAbC…dEf"
        },
        "transferType": "payroll_run", // pay_now_group | pay_now_member | pay_now_all | payroll_run | payroll_top_up
        "transferAmount": "1000.00",   // net received by the recipient
        "grossAmount": "1008.07",      // debited from the company (net + fee)
        "feeAmount": "8.07",           // developer fee withheld
        "currency": "USDC",
        "status": "SUCCESSFUL",
        "transactionTime": "2026-07-28T09:12:44.120Z",
        "transferDate": "2026-07-28T09:12:44.120Z"
      }
    ],
    "meta": { "total": 4, "page": 1, "limit": 20, "totalPages": 1 }
  }
}
```

### Example request

```bash
curl -X GET \
  'https://<api-host>/admin-dashboard/payroll-revenue?page=1&limit=20&from=2026-07-01' \
  -H 'Authorization: Bearer <adminAccessToken>'
```

---

## 5. Test data

The fee per transfer is derived from each `Transaction` row where
`type = "PAYROLL"`: `feeAmount = amount (gross) - metadata.netAmount`. To
exercise the endpoint locally, insert a few payroll transactions against an
existing company `Wallet` (`walletId`) and team membership (`metadata.membershipId`).

### Sample `Transaction` rows

Assume company wallet `wlt_acme` and memberships `mem_ada`, `mem_alan`.

| amount (gross) | type      | status       | currency | metadata (excerpt)                                                          |
| -------------- | --------- | ------------ | -------- | --------------------------------------------------------------------------- |
| `1008.07`      | `PAYROLL` | `SUCCESSFUL` | `USDC`   | `{ "mode":"payroll_run","membershipId":"mem_ada","netAmount":1000,"toAddress":"0xAbC" }`   |
| `504.04`       | `PAYROLL` | `SUCCESSFUL` | `USDC`   | `{ "mode":"pay_now_member","membershipId":"mem_alan","netAmount":500,"toAddress":"0xDeF" }` |
| `100.81`       | `PAYROLL` | `SUCCESSFUL` | `USDC`   | `{ "mode":"pay_now_group","membershipId":"mem_ada","netAmount":100,"toAddress":"0xAbC" }`   |
| `1008.07`      | `PAYROLL` | `PROCESSING` | `USDC`   | `{ "mode":"payroll_run","membershipId":"mem_alan","netAmount":1000,"toAddress":"0xDeF" }`   |

### Expected computed output

| Transfer            | net       | gross     | fee       | counts toward         |
| ------------------- | --------- | --------- | --------- | --------------------- |
| Ada — payroll_run   | `1000.00` | `1008.07` | `8.07`    | payrollRevenue        |
| Alan — pay_now      | `500.00`  | `504.04`  | `4.04`    | payrollRevenue        |
| Ada — pay_now_group | `100.00`  | `100.81`  | `0.81`    | payrollRevenue        |
| Alan — payroll_run  | `1000.00` | `1008.07` | `8.07`    | pendingRevenue        |

Resulting `stats`:

```json
{
  "payrollRevenue": "12.92",
  "pendingRevenue": "8.07",
  "currency": "USDC",
  "feePercent": 0.8,
  "settledTransferCount": 3,
  "pendingTransferCount": 1
}
```

### Insert helper (SQL)

```sql
INSERT INTO "Transaction"
  (id, amount, category, type, status, currency, "walletId", metadata, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), '1008.07', 'STABLECOIN', 'PAYROLL', 'SUCCESSFUL', 'USDC',
   'wlt_acme',
   '{"mode":"payroll_run","membershipId":"mem_ada","netAmount":1000,"grossAmount":1008.07,"toAddress":"0xAbC"}',
   now(), now());
```

> In real runs these rows are created automatically by
> `settlePayrollBridgeTransfers` (pay-now) and the payroll engine (scheduled
> runs); the webhook processor later flips `status` from `PROCESSING` to
> `SUCCESSFUL` once Bridge settles the transfer.
