const fetch = require('node-fetch');
const _ = require('lodash');

module.exports = async (location, summaryCount) => {

    location = location || 'london';
    const now = new Date();
    var day = '';
    var month = '';

    if (now.getDate() < 10) {
        day += '0' + now.getDate();
    } else {
        day += now.getDate();
    }

    if (now.getMonth() < 9) {
        month += '0' + (now.getMonth() + 1);
    } else {
        month += (now.getMonth() + 1);
    }

    const start = `2019-${month}-${day}`;
    const end = '2019-04-22';

    const params = {
        common: {
            'type': 'default',
            'publickey': '2485d9866900c6670987896d6eaba840c',
            'lang': 'es',
            'version': '201912011',
            'srvsrc': 'https%3A%2F%2Fapp.bookitit.com',
            'start': start,
            'end': end,
            'selectedPeople': '1',
            '_': '' + Math.round((new Date()).getTime())
        },

        edinburgh: {
            'services%5B%5D': 'bkt299838',
            'agendas%5B%5D': 'bkt141174',
            'src': 'https%3A%2F%2Fapp.bookitit.com%2Fes%2Fhosteds%2Fwidgetdefault%2F2485d9866900c6670987896d6eaba840c'
        },

        london: {
            'services%5B%5D': 'bkt180202',
            'agendas%5B%5D': 'bkt86141',
            'src': 'https%3A%2F%2Fapp.bookitit.com%2Fes%2Fhosteds%2Fwidgetdefault%2F2f448acb2b5d63d382c02f0f27053261d'
        }
    }

    const queryString = _({})
        .assign(params.common, params[location])
        .map((v, k) => `${k}=${v}`)
        .value()
        .join('&');

    const response = await fetch("https://app.bookitit.com/onlinebookings/datetime/?callback=fn&" + queryString)
    const text = await response.text();

    const json = JSON.parse(text.substring('callback=fn('.length, text.length - 2));
    const result = _(json.Slots).filter(x => x.availabletime.length > 0).map(x => ({
        date: x.date,
        slots: x.availabletime.length
    }));

    return {
        location,
        start: start,
        end: end,
        total: {
            days: result.value().length,
            slots: result.reduce((sum, x) => {
                return sum + x.slots;
            }, 0)
        },
        upcoming: result.take(summaryCount || 3)
    };
}