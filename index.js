const chalk = require('chalk');
const query = require('./query-slots');
const _ = require('lodash');
const sms = require('./sms');
const crypto = require('crypto');

const INTERVAL = 1 * 60;
const LOCATION = 'london';

const makeMsg = summary => `${summary.location.toUpperCase()} - ${summary.total.slots} slots over ${summary.total.days} days - soonest ${summary.upcoming.reduce((sum, x) => {
    return sum + x.slots;
}, 0)} slots on ${summary.upcoming.map(x => new Date(x.date).toString().substring(0, 10)).join(', ')}`;

const sha1 = msg => crypto.createHash('sha1').update(msg).digest('hex');

const smshistory = {};
var execCount = 0;

const exec = async () => {
    const summary = await query(LOCATION, 3);
    const msg = makeMsg(summary);

    const hash = sha1(msg);
    if (!smshistory[hash]) {
        const now = new Date();
        smshistory[hash] = now;
        if (summary.total.slots && execCount) {
            const result1 = await sms(msg, 'casey');
            console.log(chalk.green(`SMS (casey) ${result1.status} @ ${now.toString()}`));
            const result2 = await sms(msg, 'yula');
            console.log(chalk.green(`SMS (yula) ${result2.status} @ ${now.toString()}`));
        } else {
            console.log('skipped sms');
        }
        console.log(chalk.grey(msg));
        execCount++
        //console.log(chalk.grey(JSON.stringify(summary, undefined, 4)));
    }
}

const go = function() {
    exec()
        .then(() => {})
        .catch(err => {
            console.log(err)
        })
}

console.log(chalk.grey(`checking ${chalk.whiteBright.bold(LOCATION.toUpperCase())} every ${chalk.whiteBright.bold(INTERVAL)}s`))
go();
setInterval(go, INTERVAL * 1000)