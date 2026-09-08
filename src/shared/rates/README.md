# FX rates (USD base)

- `DEFAULT_USD_RATES` — offline defaults (units of local per 1 USD)
- `setLiveRates()` — merge rates from API
- `getRate(code)` / `usdToLocal` / `localToUsd` / `formatUsdAsLocal`
- Bill presets: `localQuickAmounts`, `localAirtimeAmounts`, `localDataBundles`

App currency UI uses `useCurrency()` which reads the same rate table.
