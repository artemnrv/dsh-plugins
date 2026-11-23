/**
 * Composer balance: the remaining account balance as one
 * `conversation.composer.dock` entry, beside the shipped token statistics.
 *
 * Data comes from the existing Client `account` Remote namespace, whose
 * `getBalance` method the account settings plugin already uses. The reading is
 * refreshed on account changes, when the page becomes visible, and once a
 * minute; a failed read keeps the last known amount and marks it as not
 * current, while a signed-out account removes the entry instead of showing a
 * stale figure.
 */
window.__ModuleLoader__.load({
  id: '@local/composer-balance',
  factory(require) {
    const React = require('react')

    const NAMESPACE = 'composer.balance'
    const REFRESH_INTERVAL_MS = 60_000
    const ICON_SIZE = 14

    /**
     * Runtime dictionaries for the pill's own texts, one entry per shipped
     * locale. Wallet names follow the wording of Settings → Account
     * ("topped-up balance" / "granted balance").
     */
    const DICTIONARIES = {
      en: {
        'pill.toppedUp': 'Topped-up balance: {value}',
        'pill.toppedUpWithGranted': 'Topped-up balance: {value} · granted balance: {granted}',
        'pill.granted': 'Granted balance: {value}',
        'pill.stale': 'not updated',
      },
      zh: {
        'pill.toppedUp': '充值余额：{value}',
        'pill.toppedUpWithGranted': '充值余额：{value} · 赠金余额：{granted}',
        'pill.granted': '赠金余额：{value}',
        'pill.stale': '未更新',
      },
      ru: {
        'pill.toppedUp': 'Пополненный баланс: {value}',
        'pill.toppedUpWithGranted': 'Пополненный баланс: {value} · предоставленный баланс: {granted}',
        'pill.granted': 'Предоставленный баланс: {value}',
        'pill.stale': 'не обновлено',
      },
      de: {
        'pill.toppedUp': 'Aufgeladenes Guthaben: {value}',
        'pill.toppedUpWithGranted': 'Aufgeladenes Guthaben: {value} · gewährte Balance: {granted}',
        'pill.granted': 'Gewährte Balance: {value}',
        'pill.stale': 'nicht aktualisiert',
      },
      es: {
        'pill.toppedUp': 'Saldo recargado: {value}',
        'pill.toppedUpWithGranted': 'Saldo recargado: {value} · saldo concedido: {granted}',
        'pill.granted': 'Saldo concedido: {value}',
        'pill.stale': 'no actualizado',
      },
      fr: {
        'pill.toppedUp': 'Solde rechargé : {value}',
        'pill.toppedUpWithGranted': 'Solde rechargé : {value} · solde accordé : {granted}',
        'pill.granted': 'Solde accordé : {value}',
        'pill.stale': 'non actualisé',
      },
      ja: {
        'pill.toppedUp': 'チャージ残高：{value}',
        'pill.toppedUpWithGranted': 'チャージ残高：{value} · 付与残高：{granted}',
        'pill.granted': '付与残高：{value}',
        'pill.stale': '未更新',
      },
      pt: {
        'pill.toppedUp': 'Saldo reabastecido: {value}',
        'pill.toppedUpWithGranted': 'Saldo reabastecido: {value} · saldo concedido: {granted}',
        'pill.granted': 'Saldo concedido: {value}',
        'pill.stale': 'não atualizado',
      },
    }

    /** The shipped statistics pill skin: one 12px tertiary reading on the composer dock line. */
    const PILL_STYLE = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      boxSizing: 'border-box',
      maxWidth: '100%',
      padding: '1px 8px',
      borderRadius: 'var(--dsw-radius-sm, 6px)',
      color: 'var(--dsw-alias-label-tertiary)',
      fontSize: 'calc(var(--dsh-content-font-size-secondary, 13px) - 1px)',
      lineHeight: 'calc(20px + var(--dsh-content-font-delta-secondary, 0px))',
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
    }

    const LABEL_STYLE = {
      minWidth: '0',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }

    const ICON_STYLE = { flex: 'none', width: '14px', height: '14px' }

    /**
     * Currency symbol of one Platform wallet.
     * @param {unknown} currency - wallet currency code.
     * @returns {string} the symbol the amount is shown with.
     */
    function symbolOf(currency) {
      return currency === 'USD' ? '$' : '¥'
    }

    /**
     * Whether one wire value is a wallet this pill can format.
     * @param {unknown} wallet - candidate wallet.
     * @returns {boolean} true for a wallet-shaped object.
     */
    function isWallet(wallet) {
      return wallet !== null && wallet !== undefined && typeof wallet === 'object'
    }

    /**
     * Format a wallet amount the way Platform Web shows balances: two decimals
     * truncated rather than rounded, digits grouped for the browser locale,
     * `0.00` for an emptied wallet, and `<¥0.01` for one holding less than a
     * cent.
     * @param {unknown} raw - decimal amount string from the wallet.
     * @param {string} symbol - currency symbol.
     * @returns {string} display text.
     */
    function formatAmount(raw, symbol) {
      const text = String(raw === null || raw === undefined ? '' : raw).trim()
      if (text === '') return symbol
      const numeric = Number(text)
      if (!Number.isFinite(numeric)) return symbol + text
      const negative = numeric < 0
      const magnitude = Math.abs(numeric)
      if (magnitude === 0) return symbol + '0.00'
      if (magnitude < 0.01) return negative ? '-' + symbol + '0.01' : '<' + symbol + '0.01'
      // A decimal string is truncated to cents; an exponent form carries no
      // digits to truncate, so it is expanded once before the same treatment.
      const plain = /[eE]/u.test(text) ? magnitude.toFixed(2) : text.replace(/^[+-]/u, '')
      const parts = plain.split('.')
      const whole = parts[0] === undefined || parts[0] === '' ? '0' : parts[0]
      const fraction = parts[1] === undefined ? '' : parts[1]
      const cents = (fraction + '00').slice(0, 2)
      return (negative ? '-' : '') + symbol + Number(whole).toLocaleString() + '.' + cents
    }

    /**
     * Reduce one balance reading to what the pill shows: the wallet that funds
     * requests, plus a granted wallet in the same currency when one is left.
     * @param {{ wallets: readonly any[], bonus: readonly any[], stale: boolean } | null} value - published reading.
     * @returns {{ amount: string, granted: string | null, fromGranted: boolean, stale: boolean } | null} display summary, or null when no wallet is known.
     */
    function summarize(value) {
      if (value === null || value === undefined) return null
      const paidWallets = (Array.isArray(value.wallets) ? value.wallets : []).filter(isWallet)
      const grantedWallets = (Array.isArray(value.bonus) ? value.bonus : []).filter(isWallet)
      const funds = wallet => Number(wallet.balance) > 0
      const paid = paidWallets.find(funds)
      const granted = grantedWallets.find(funds)
      // A wallet emptied of topped-up funds is not what the user still has, so
      // a granted wallet takes the reading over when it carries the money.
      const visible = paid ?? granted ?? paidWallets[0] ?? grantedWallets[0]
      if (visible === undefined) return null
      const symbol = symbolOf(visible.currency)
      const showGranted = paid !== undefined && granted !== undefined && granted.currency === visible.currency
      return {
        amount: formatAmount(visible.balance, symbol),
        granted: showGranted ? formatAmount(granted.balance, symbol) : null,
        fromGranted: paid === undefined,
        stale: value.stale === true,
      }
    }

    /**
     * One account-balance reader shared by every mounted pill.
     * @param {any} ctx - client plugin context.
     * @returns {{ get: () => any, subscribe: (listener: () => void) => () => void, read: () => Promise<void>, dispose: () => void }} the store.
     */
    function createStore(ctx) {
      let current = null
      let signature = ''
      let reading = false
      let disposed = false
      const listeners = new Set()

      /** @param {any} next - newest reading, or null when nothing should show. */
      const publish = next => {
        const wallets = value => (Array.isArray(value) ? value : [])
          .map(wallet => `${wallet === null || wallet === undefined ? '' : wallet.currency}:${wallet === null || wallet === undefined ? '' : wallet.balance}`)
          .join(',')
        const nextSignature = next === null
          ? ''
          : wallets(next.wallets) + '|' + wallets(next.bonus) + '|' + (next.stale === true ? 'stale' : '')
            + '|' + String(next.code === undefined ? '' : next.code)
        if (nextSignature === signature) return
        signature = nextSignature
        current = next
        for (const listener of [...listeners]) {
          try { listener() } catch (error) { console.error('[composer-balance] listener failed', error) }
        }
      }

      /** Keep the last known amount on screen but stop calling it current. */
      const markStale = (code) => {
        if (current === null) { publish({ wallets: [], bonus: [], stale: false, code }); return }
        if (current.stale === true && current.code === code) return
        publish({ wallets: current.wallets, bonus: current.bonus, stale: true, code })
      }

      /** Read the balance once; concurrent and hidden-page calls are skipped. */
      const read = async () => {
        if (disposed || reading) return
        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
        let account
        try { account = ctx.accountUi.getSnapshot() } catch (error) { return }
        if (account === null || account === undefined) { publish({ wallets: [], bonus: [], stale: false, code: 'no-accountUi' }); return }
        if (account.failed) { publish({ wallets: [], bonus: [], stale: false, code: 'stream-failed' }); return }
        if (account.view === undefined) { publish({ wallets: [], bonus: [], stale: false, code: 'no-view' }); return }
        if (account.view.status !== 'credential-stored') {
          publish({ wallets: [], bonus: [], stale: false, code: 'signed-out:' + String(account.view.status) })
          return
        }
        reading = true
        try {
          const result = await ctx.remote.account.getBalance(ctx.accountUi.clientMetadata(ctx.locale.getSnapshot().active))
          if (disposed) return
          if (!result.ok) {
            const reason = result.error === null || result.error === undefined ? '' : String(result.error.code === undefined ? result.error : result.error.code)
            markStale('not-ok:' + reason)
            return
          }
          const value = result.value
          if (value === null || value === undefined) { markStale('null-balance'); return }
          if (value.status !== 'ready') { markStale('status:' + String(value.status)); return }
          const wallets = Array.isArray(value.value) ? value.value : []
          const bonus = Array.isArray(value.bonusWallets) ? value.bonusWallets : []
          if (wallets.length === 0 && bonus.length === 0) { markStale('no-wallets'); return }
          publish({ wallets, bonus, stale: false, code: 'ok' })
        } catch (error) {
          // A refused or failed read keeps the last known reading, marked stale.
          markStale('throw:' + String(error === null || error === undefined ? error : error.message).slice(0, 40))
        } finally {
          reading = false
        }
      }

      return {
        get: () => current,
        subscribe: listener => { listeners.add(listener); return () => { listeners.delete(listener) } },
        read,
        dispose: () => { disposed = true; listeners.clear() },
      }
    }

    /**
     * Build the dock entry component around one store.
     * @param {ReturnType<typeof createStore>} store - shared balance reader.
     * @returns {any} the React component rendered by the slot.
     */
    function createBalancePill(store) {
      return function BalancePill(props) {
        const t = typeof props.t === 'function' ? props.t : key => key
        const [value, setValue] = React.useState(() => store.get())
        React.useEffect(() => {
          let active = true
          const sync = () => { if (active) setValue(store.get()) }
          sync()
          const off = store.subscribe(sync)
          return () => { active = false; off() }
        }, [])
        const summary = summarize(value)
        if (summary === null) {
          // Temporary diagnostic marker: shows the branch that produced no reading.
          const code = value === null || value === undefined
            ? 'idle'
            : value.code === undefined ? 'unknown' : String(value.code)
          return React.createElement('span', {
            style: Object.assign({}, PILL_STYLE, { color: 'var(--dsw-alias-state-warn-primary)' }),
          }, 'B:' + code)
        }
        const reading = summary.granted !== null
          ? t('pill.toppedUpWithGranted', { value: summary.amount, granted: summary.granted })
          : summary.fromGranted
            ? t('pill.granted', { value: summary.amount })
            : t('pill.toppedUp', { value: summary.amount })
        // The reading is one visible amount; everything else, including a
        // stale marker, stays in the hover text and the accessible name.
        const title = summary.stale ? reading + ' · ' + t('pill.stale') : reading
        return React.createElement('span', {
          role: 'img',
          'aria-label': title,
          title,
          style: PILL_STYLE,
        },
        React.createElement('svg', {
          viewBox: '0 0 16 16',
          width: ICON_SIZE,
          height: ICON_SIZE,
          'aria-hidden': true,
          focusable: 'false',
          style: ICON_STYLE,
        },
        React.createElement('rect', {
          x: 1.7, y: 3.6, width: 12.6, height: 8.8, rx: 2.1,
          fill: 'none', stroke: 'currentColor', strokeWidth: 1.3,
        }),
        React.createElement('circle', { cx: 10.7, cy: 8, r: 1.15, fill: 'currentColor' })),
        React.createElement('span', { 'aria-hidden': true, style: LABEL_STYLE }, summary.amount))
      }
    }

    return {
      inject: ['slots', 'locale', 'remote', 'remote.account', 'accountUi'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NAMESPACE, DICTIONARIES), 'balance: dictionaries')
        const store = createStore(ctx)
        const BalancePill = createBalancePill(store)
        ctx.effect(() => {
          const stopAccount = ctx.on('account-ui/change', () => { void store.read() })
          const stopRefresh = ctx.on('account-ui/refresh', () => { void store.read() })
          const timer = setInterval(() => { void store.read() }, REFRESH_INTERVAL_MS)
          const onVisibility = () => { void store.read() }
          if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVisibility)
          void store.read()
          return () => {
            clearInterval(timer)
            if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVisibility)
            stopAccount()
            stopRefresh()
            store.dispose()
          }
        }, 'balance: balance reads')
        ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({
          name: 'conversation.composer.dock',
          id: 'account-balance',
          order: 2,
          locale: NAMESPACE,
        }, BalancePill))
      },
    }
  },
})
