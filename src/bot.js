// @ts-check
const SchoolmasterClient = require('./client/SchoolmasterClient');

const client = new SchoolmasterClient();
client.start();

/*const speech = require('@google-cloud/speech');
const fs = require('fs')
const Event = require('../structures/Event');
const client2 = new speech.SpeechClient();

function exec(filename, encoding, sHertz) {
    const config = {
        encoding: encoding,
        sHertz: sHertz,
        langauge: 'en-US'
    };

    const audio = {
        content: fs.readFileSync(filename).toString('base64')
    };

    const request = {
        config: config,
        audio: audio
    };

    const [op] = client2.longRunningRecognize(request);
    const [response] = await op.promise();
    const text = response.results
        .map(results => results.alternatives[0].transcript)
        .join('\n');

    console.log(text);
}
// am bacc
// imma try to record audio from Discord first, see how that goes, then we can try piping it to this*/
