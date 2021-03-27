/*const speech = require('@google-cloud/speech');
const fs = require('fs')
const Event = require('../structures/Event');
const client = new speech.SpeechClient();


// TODO(Joe): add discord related stuff

class STTEvent extends Event {
	constructor() {
		super('stt', {
			emitter: 'client', // 
			event: 'stt',
		});
	}

	exec(filename, encoding, sHertz) {
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

        const [op] = client.longRunningRecognize(request);
        const [response] = await op.promise();
        const text = response.results
            .map(results => results.alternatives[0].transcript)
            .join('\n');

        console.log(text);
	}
}

module.exports = ReadyEvent;*/
