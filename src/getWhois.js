// const whois = require('whois-json');
const whois = require('whois');
const tldjs = require('tldjs');

const keyset = [
    'URL',
    'Domain Name',
    'Updated Date',
    'Creation Date',
    'Registrar Registration Expiration Date',
    'Registrar',
    'Registrant Country'
];
const keyAlias = {
    'URL': 'URL',
    'Domain Name': 'Domain',
    'Updated Date': 'Updated_Date',
    'Creation Date': 'Creation_Date',
    'Registrar Registration Expiration Date': 'Expiration_Date',
    'Registrant Country': 'Reg_Country',
    'Registrar': 'Registrar'
}

const parseUrl = (req, res, next) => {
    try {
        const url = req.query.url;
        if (!url) {
            return res.json({error: 'Please provide a url'});
        }
        let hostname;

        // if (!tldjs.isValid(url))
        //     return res.json({error: 'Invalid Url'});
        if (!tldjs.tldExists(url))
            return res.json({ error: 'Invalid Domain TLD' });
        
        hostname = tldjs.getDomain(url);
        
        req.query.host = hostname;
        next();
    } catch (err) {
        console.error(err.msg);
        res.status(500).json("something went wrong!");
    }
}

// const getDateFormat = (date) => {
//     const year = date.getFullYear(), month = date.getMonth() + 1, day = date.getDate();
//     const hour = date.getHours(), minute = date.getMinutes(), second = date.getSeconds();
//     newDate = `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day} ${hour < 10 ? `0${hour}` : hour}:${minute < 10 ? `0${minute}` : minute}:${second < 10 ? `0${second}` : second}`;
//     return newDate;
// }

// const formatWhois = (whois, url) => {
//     try {
//         const formatWhois = {
//             URL: url,
//             Domain: whois.domainName,
//             Updated_Date: whois.updatedDate ? getDateFormat(new Date(whois.updatedDate)) : getDateFormat(new Date()),
//             Creation_Date: whois.creationDate ? getDateFormat(new Date(whois.creationDate)) : getDateFormat(new Date()),
//             Expiration_Date: whois.registrarRegistrationExpirationDate ? getDateFormat(new Date(whois.registrarRegistrationExpirationDate)) : getDateFormat(new Date()),
//             Registrar: whois.registrar || "GoDaddy.com, LLC",
//             Reg_Country: whois.registrantCountry || "US"
//         }
//         return formatWhois;
//     } catch (err) {
//         console.error(err);
//     }
// }

const formatWhois = (data, domain) => {
    if (domain.indexOf('co.uk') > -1) {
        return {
            domain
        };
    }
    if (data.indexOf('\r\n') > -1)
        data = data.split('\r\n');
    else
        data = data.split('\n');
    data = data.slice(0, 35);
    let obj = {}
    data.forEach((d) => {
        arr = d.split(': ');
        obj[arr[0]] = arr[1]; 
    });
    return obj;
}

const filterResult = (result) => {
    let temp = {};
    for (let i in result) {
        // console.log(i);
        if (keyset.includes(i)) {
            temp[keyAlias[i]] = result[i];
        }
    }
    return temp;
}

const getWhois = async (req, res) => {
    try {
        const host = req.query.host;
        // let data = await whois(host);

        whois.lookup(host, (err, d) => {
            let result = {URL: req.query.url}
            result = { ...result, ...formatWhois(d, host) };
            result = filterResult(result);
            res.json(result);
        })
        // if (!data.domainName) {
        //     return res.json({error: 'Cannot Find Domain!}')
        // }
        // JSON.stringify(data, null, 2);
        // data = formatWhois(data, req.query.url);
        // res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({error: 'Something went wrong, please try again!'});
    }
}

module.exports = { getWhois, parseUrl };
