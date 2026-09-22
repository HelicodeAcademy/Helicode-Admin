# Offramp Revenue — Admin Dashboard

This document is for the **admin frontend** integrating Helicode cash-out
(offramp) fee reporting. It mirrors
[Payroll Revenue](./PAYROLL_REVENUE.md).

Customer-facing cash-out quote fields live in
[`../team/team-wallet/OFFRAMP_FEES.md`](../team/team-wallet/OFFRAMP_FEES.md).
This endpoint is **admin-only**.

---

## 1. Overview

Helicode withholds a **0.2%** developer fee (configurable via
`OFFRAMP_DEVELOPER_FEE_PERCENT`) on cash-outs. The sender pays: the wallet is
debited the amount they typed; the bank / destination receives the remainder.

This endpoint reports that fee across:

| `source`       | What it is                         | Table                         |
| -------------- | ---------------------------------- | ----------------------------- |
| `TEAM_FIAT`    | Team member bank / MoMo cash-out   | `TeamWithdrawal`              |
| `COMPANY_FIAT` | Company bank / MoMo cash-out       | `CompanyWithdrawal`           |
| `TEAM_CRYPTO`  | Team member crypto send            | `Transaction` (`TEAM_WITHDRAWAL`, kind `TEAM_CRYPTO_WITHDRAWAL`) |

Company crypto `POST /wallet/withdraw` is **not** charged and is **not** listed.

The fee is stored per withdrawal as `metadata.fee`:

```json
{ "amountUsdc": 100, "feePercent": 0.2, "feeUsdc": 0.2, "netUsdc": 99.8 }
```

Bridge floors the fee to **2 decimal places**. Cash-outs under **5 USDC** at
0.2% collect **$0.00** (`floor(0.004) = 0`). Older rows from before the fee
launched also show `feeAmount: "0.00"`.

---

## 2. Endpoint

```
GET /admin-dashboard/offramp-revenue
```

- **Auth:** `AdminJwtGuard` — `Authorization: Bearer <adminAccessToken>`
- Returns aggregate **stats** plus a paginated **list** of cash-outs and the
  fee on each.

Envelope is the same as the rest of the admin dashboard:

```json
{
  "status": true,
  "statusCode": 200,
  "message": "Offramp revenue fetched successfully.",
  "data": { }
}
```

### Query parameters

| Param       | Type   | Default | Applies to | Notes                                                                                          |
| ----------- | ------ | ------- | ---------- | ---------------------------------------------------------------------------------------------- |
| `page`      | number | `1`     | list       | 1-based page index.                                                                            |
| `limit`     | number | `20`    | list       | Page size (max `100`).                                                                         |
| `companyId` | string | —       | stats+list | Restrict to a single company.                                                                  |
| `source`    | enum   | —       | stats+list | `TEAM_FIAT` \| `COMPANY_FIAT` \| `TEAM_CRYPTO`.                                                |
| `provider`  | enum   | —       | stats+list | `YELLOWCARD` \| `QUIDAX`. Excludes team crypto (no fiat provider).                             |
| `status`    | enum   | —       | **list only** | Revenue bucket: `COLLECTED` \| `PENDING` \| `FAILED`.                                      |
| `from`      | ISO    | —       | stats+list | Inclusive lower bound on cash-out time (e.g. `2026-07-01`).                                    |
| `to`        | ISO    | —       | stats+list | Inclusive upper bound on cash-out time.                                                        |

> Same pattern as payroll revenue: `status` narrows **list rows only**.
> `stats.offrampRevenue` / `pendingRevenue` always cover every bucket
> (still respecting `companyId` / `from` / `to` / `source` / `provider`).

### Example requests

```bash
# All cash-outs, page 1
curl -X GET \
  'https://<api-host>/admin-dashboard/offramp-revenue?page=1&limit=20' \
  -H 'Authorization: Bearer <adminAccessToken>'

# Collected team bank cash-outs in a date range
curl -X GET \
  'https://<api-host>/admin-dashboard/offramp-revenue?source=TEAM_FIAT&status=COLLECTED&from=2026-09-01&to=2026-09-30' \
  -H 'Authorization: Bearer <adminAccessToken>'
```

---

## 3. Response shape

```jsonc
{
  "status": true,
  "statusCode": 200,
  "message": "Offramp revenue fetched successfully.",
  "data": {
    "stats": {
      "offrampRevenue": "1.42",      // fees on COLLECTED cash-outs
      "pendingRevenue": "0.20",      // fees still in flight
      "currency": "USDC",
      "feePercent": 0.2,             // currently configured percent
      "settledTransferCount": 3,
      "pendingTransferCount": 1,
      "bySource": {
        "teamFiat": {
          "collected": "1.22",
          "pending": "0.20",
          "settledTransferCount": 2,
          "pendingTransferCount": 1
        },
        "companyFiat": {
          "collected": "0.20",
          "pending": "0.00",
          "settledTransferCount": 1,
          "pendingTransferCount": 0
        },
        "teamCrypto": {
          "collected": "0.00",
          "pending": "0.00",
          "settledTransferCount": 0,
          "pendingTransferCount": 0
        }
      }
    },
    "data": [
      {
        "withdrawalId": "uuid",
        "source": "TEAM_FIAT",          // TEAM_FIAT | COMPANY_FIAT | TEAM_CRYPTO
        "provider": "QUIDAX",           // YELLOWCARD | QUIDAX | null (crypto)
        "bridgeTransferId": "transfer_…",
        "company": { "id": "cmp_123", "name": "Acme Inc." },
        "member": {                     // null name/email on COMPANY_FIAT
          "name": "Ada Lovelace",
          "email": "ada@acme.com"
        },
        "destination": {
          "walletAddress": null,        // set on TEAM_CRYPTO
          "payoutAccountName": "ADA LOVELACE",
          "payoutAccountNumber": "0123456789"
        },
        "transferType": "team_fiat",
        "transferAmount": "610.78",     // net to partner / destination
        "grossAmount": "612.00",        // debited from the wallet
        "feeAmount": "1.22",            // Helicode developer fee
        "feePercent": 0.2,              // percent stored on this row
        "currency": "USDC",
        "localAmount": "950000.00",     // fiat payout amount; null on crypto
        "localCurrency": "NGN",
        "country": "NG",
        "status": "COMPLETED",          // native withdrawal / transaction status
        "revenueStatus": "COLLECTED",   // COLLECTED | PENDING | FAILED | null
        "transactionTime": "2026-09-18T12:04:11.000Z",
        "transferDate": "2026-09-18T12:04:11.000Z"
      }
    ],
    "meta": { "total": 4, "page": 1, "limit": 20, "totalPages": 1 }
  }
}
```

Money fields in `stats` and on each list row (`transferAmount`, `grossAmount`,
`feeAmount`, `localAmount`) are **strings with 2 decimal places**, same as
payroll revenue.

---

## 4. Status mapping (for the UI)

`status` on each row is the **native** lifecycle value. Use `revenueStatus` for
the collected / pending / failed chips and for the `status` query param.

### Fiat (`TEAM_FIAT`, `COMPANY_FIAT`)

| Native `status`                                      | `revenueStatus` | Counts toward        |
| ---------------------------------------------------- | --------------- | -------------------- |
| `COMPLETED`, `CRYPTO_CONFIRMED`, `FIAT_PROCESSING`   | `COLLECTED`     | `offrampRevenue`     |
| `INITIATED`, `YC_PAYMENT_CREATED`, `CRYPTO_SENT`     | `PENDING`       | `pendingRevenue`     |
| `FAILED`, `CANCELLED`, `PENDING_REFUND`, `REFUNDED`, `REFUND_FAILED` | `FAILED` | neither (list only) |

`CRYPTO_CONFIRMED` / `FIAT_PROCESSING` count as collected because Bridge has
already taken `developer_fee`, even if local-currency payout is still moving.

### Team crypto (`TEAM_CRYPTO`)

| Native `status`              | `revenueStatus` | Counts toward    |
| ---------------------------- | --------------- | ---------------- |
| `SUCCESSFUL`                 | `COLLECTED`     | `offrampRevenue` |
| `INITIATED`, `PROCESSING`    | `PENDING`       | `pendingRevenue` |
| `FAILED`                     | `FAILED`        | neither          |

Suggested UI:

- KPI: **Offramp revenue** → `stats.offrampRevenue`
- KPI: **Pending** → `stats.pendingRevenue`
- Optional breakdown cards from `stats.bySource`
- Table columns: time, company, member, source, provider, gross, fee, net, native status
- Filters: date range, company, source, provider, revenue status

---

## 5. Worked example (0.2%)

| Cash-out                         | Gross     | Fee      | Net      | Native status     | Counts toward    |
| -------------------------------- | --------- | -------- | -------- | ----------------- | ---------------- |
| Team NGN (Quidax)                | `612.00`  | `1.22`   | `610.78` | `COMPLETED`       | offrampRevenue   |
| Team NGN                         | `100.00`  | `0.20`   | `99.80`  | `CRYPTO_SENT`     | pendingRevenue   |
| Company GHS                      | `100.00`  | `0.20`   | `99.80`  | `COMPLETED`       | offrampRevenue   |
| Team crypto                      | `2.00`    | `0.00`   | `2.00`   | `SUCCESSFUL`      | offrampRevenue (fee $0) |

Resulting `stats`:

```json
{
  "offrampRevenue": "1.42",
  "pendingRevenue": "0.20",
  "currency": "USDC",
  "feePercent": 0.2,
  "settledTransferCount": 3,
  "pendingTransferCount": 1
}
```

---

## 6. Frontend notes

- Do **not** recompute the fee as `gross × 0.2 / 100`. Always display
  `feeAmount` / `transferAmount` from the API (Bridge 2dp floor).
- `feePercent` on **stats** is the **current** env value. `feePercent` on a
  **row** is what was stored when that cash-out ran.
- Pagination `meta.total` is the filtered **list** count (after `status`), not
  the number of rows that contributed to `stats`.
- Auth, token refresh, and error codes are the same as the rest of
  [README.md](./README.md) (`401` / `403` / `400`).
