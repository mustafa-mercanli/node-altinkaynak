const Altinkaynak = require('./index');
(async () => {
    const alt = new Altinkaynak();
    const try_currencies = await alt.get_try_currencies();
    console.log(JSON.stringify(try_currencies));
    const rate = await alt.get_rate("USD","EUR");
    console.log(JSON.stringify(rate));
})();