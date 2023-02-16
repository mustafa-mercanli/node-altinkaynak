const http = require('http');
const urllib = require("url");
var xml2js = require('xml2js');


class Altinkaynak{
    username = "AltinkaynakWebServis"
    password = "AltinkaynakWebServis"
    headers = {"Content-Type":"text/xml; charset=utf-8"}
    raw_response = null

    constructor(){
        
    }

    get_try_currencies = () => {
        return new Promise((resolve,reject)=>{
            const xml_data = `<?xml version="1.0" encoding="utf-8"?>
            <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                <soap:Header>
                    <AuthHeader xmlns="http://data.altinkaynak.com/">
                        <Username>${this.username}</Username>
                        <Password>${this.password}</Password>
                    </AuthHeader>
                </soap:Header>
                <soap:Body>
                    <GetCurrency xmlns="http://data.altinkaynak.com/" />
                </soap:Body>
            </soap:Envelope>`

            const url = 'http://data.altinkaynak.com/DataService.asmx'
            const {hostname,path} = urllib.parse(url);

            const options = {
                hostname,
                path,
                method: 'POST',
                headers:{
                    'Content-Type': 'text/xml; charset=utf-8',
                    'Content-Length': xml_data.length
                }
            };
            
            const post_req = http.request(options, function(res) {
                res.setEncoding('utf8');
                let data = "";
                res.on('data', (chunk) => {
                    data+=chunk;
                });
                res.on('end',()=>{
                    const parser = new xml2js.Parser();
                    parser.parseStringPromise(data).then((result) => {
                        const xml_node = result["soap:Envelope"]["soap:Body"][0]["GetCurrencyResponse"][0]["GetCurrencyResult"];
                        parser.parseStringPromise(xml_node).then((result)=>{
                            const try_currencies = {};
                            result.Kurlar.Kur.forEach(item => {
                                const currency = item.Kod[0];
                                const sell = item.Satis[0];
                                const buy = item.Alis[0];
                                const [date,time] = item.GuncellenmeZamani[0].split(" ");
                                const [day,month,year] = date.split(".");
                                const[hour,min,sec] = time.split(":");
                                let newDate = new Date(`${year}-${("0"+month).slice(-2)}-${("0"+day).slice(-2)}T${hour}:${min}:${sec}.000Z`);
                                newDate.setHours(newDate.getHours() - 3);
                                const datetime_utc = newDate.toISOString();
                                try_currencies[currency] = { sell,buy,datetime_utc };
                                try_currencies["TRY"] = {sell:1,buy:1,datetime_utc}
                            });
                            resolve(try_currencies);
                        }).catch((err)=>{
                            reject(err);
                        })
                    })
                      .catch((err) => {
                        reject(err);
                    });
                });
            }).on("error", (err) => {
                reject(err);
            });

            post_req.write(xml_data);
            post_req.end();
        });
        
    }

    get_rate = async (base_currency,currency) => {
        const b_curr = base_currency.toUpperCase();
        const curr = currency.toUpperCase();
        const try_currencies = await this.get_try_currencies();
        return {
            sell:try_currencies[b_curr].sell / try_currencies[curr].sell,
            buy:try_currencies[b_curr].buy / try_currencies[curr].buy,
            datetime_utc:try_currencies[b_curr].datetime_utc
           }

    }

}

module.exports = Altinkaynak;

/* Usage
(async () => {
    const Altinkaynak = require('altinkaynak');
    
    const alt = new Altinkaynak();

    const try_currencies = await alt.get_try_currencies();
    console.log(JSON.stringify(try_currencies));

    const rate = await alt.get_rate("USD","EUR");
    console.log(JSON.stringify(rate));
})();
*/