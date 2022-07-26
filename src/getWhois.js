const whois = require('whois-json');

const extractDomain = (req, res, next) => {
    try {
        const url = req.query.url;
        if (!url) {
            return res.status(500).json('cannot find domain');
        }
        let hostname;

        if (url.indexOf("//") > -1) {
            hostname = url.split('/')[2];
        } else {
            hostname = url.split('/')[0];
        }

        hostname = hostname.split(':')[0];
        hostname = hostname.split('?')[0];
        if (hostname.indexOf("www.") > -1)
            hostname = hostname.split('www.')[1];
        

        req.query.host = hostname;
        next();
    } catch (err) {
        console.error(err.msg);
        res.status(500).json("something went wrong!");
    }
}

const getDateFormat = (date) => {
    const year = date.getFullYear(), month = date.getMonth() + 1, day = date.getDate();
    const hour = date.getHours(), minute = date.getMinutes(), second = date.getSeconds();
    newDate = `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day} ${hour < 10 ? `0${hour}` : hour}:${minute < 10 ? `0${minute}` : minute}:${second < 10 ? `0${second}` : second}`;
    return newDate;
}

const formatWhois = (whois, url) => {
    try {
        const formatWhois = {
            URL: url,
            Domain: whois.domainName,
            Updated_Date: whois.updatedDate ? getDateFormat(new Date(whois.updatedDate)) : getDateFormat(new Date()),
            Creation_Date: whois.creationDate ? getDateFormat(new Date(whois.creationDate)) : getDateFormat(new Date()),
            Expiration_Date: whois.registrarRegistrationExpirationDate ? getDateFormat(new Date(whois.registrarRegistrationExpirationDate)) : getDateFormat(new Date()),
            Registrar: whois.registrar || "GoDaddy.com, LLC",
            Reg_Country: whois.registrantCountry || "US"
        }
        return formatWhois;
    } catch (err) {
        console.error(err);
    }
}

const getWhois = async (req, res) => {
    try {
        const host = req.query.host;
        let data = await whois(host);
        if (!data.domainName) {
            return res.status(500).json('Cannot Find Domain!')
        }
        JSON.stringify(data, null, 2);
        data = formatWhois(data, req.query.url);
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json('Something went wrong, please try again!');
    }
}

module.exports = { getWhois, extractDomain };
