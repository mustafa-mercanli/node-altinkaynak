# Project description
## Altinkaynak
This package is used for fetching altinkaynak.com rates based on TRY currency. To use it, simpy do that;

```
const Altinkaynak = require('altinkaynak');
    
const altin = new Altinkaynak();

const try_currencies = await altin.get_try_currencies();
console.log(JSON.stringify(try_currencies));

const rate = await altin.get_rate("USD","EUR");
console.log(JSON.stringify(rate));
```