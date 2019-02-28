const beep = require('beepbeep')
const numbers = require('./phone-numbers')();

module.exports = (msg, to) => {

    beep();

    const twilio = require('twilio');

    const accountSid = 'AC03a490e339c7779ddeee72a13239ed93'; // Your Account SID from www.twilio.com/console
    const authToken = '190c3d46a18278dc172d54d4d7c4ac75'; // Your Auth Token from www.twilio.com/console

    const client = new twilio(accountSid, authToken);

    return client.messages.create({
        body: msg,
        to: numbers[to], // Text this number
        from: numbers.from // From a valid Twilio number
    });
}