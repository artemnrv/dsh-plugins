# Composer balance

Adds one reading to the composer footer, beside the shipped token statistics
(speed and cache hit): the remaining balance of the signed-in DeepSeek account.

- The reading comes from the same `account` Remote method the Settings → Account
  section uses; it sends no model request and changes nothing in the session log.
- It refreshes after an account change, when the page returns to the foreground,
  and once a minute. A failed read keeps the last known amount and marks it as
  not current in the hover text.
- The visible amount is the topped-up balance, or the granted balance once the
  topped-up wallets are empty; a remaining granted wallet in the same currency
  is appended to the hover text, and an empty one is left out.
- While no account is signed in the reading is not rendered at all.

The Host half registers nothing; turn the bundle off under **Plugins** to remove
the reading.
