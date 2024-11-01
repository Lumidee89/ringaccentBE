const { isAccentConversionActive } = require('./ringCentralController');
const WebSocket = require('ws');
const speech = require('@google-cloud/speech');
const client = new speech.SpeechClient();
const textToSpeech = require('@google-cloud/text-to-speech');
const ttsClient = new textToSpeech.TextToSpeechClient();

let activeSockets = [];

async function convertToCanadianAccent(text) {
    const request = {
      input: { text },
      voice: { languageCode: 'en-CA', name: 'en-CA-Wavenet-A' },
      audioConfig: { audioEncoding: 'LINEAR16' },
    };
  
    const [response] = await ttsClient.synthesizeSpeech(request);
    console.log('Canadian accent audio generated');
    return response.audioContent;
  }

async function handleAudioMessage(ws, message) {
  const transcription = await transcribeAudio(message);
  let processedAudio;
  if (isAccentConversionActive()) {
    processedAudio = await convertToCanadianAccent(transcription);
  } else {
    processedAudio = transcription;
  }

  ws.send(processedAudio);
}

function handleWebSocketConnection(ws) {
    console.log('Client connected');
    activeSockets.push(ws);
  
    ws.on('message', async (message) => {
      console.log('Received audio data');
    });
  
    ws.on('close', () => {
      console.log('Client disconnected');
      activeSockets = activeSockets.filter(socket => socket !== ws);
    });
  }

async function transcribeAudio(audioBuffer) {
  const audioBytes = audioBuffer.toString('base64');
  const request = {
    audio: {
      content: audioBytes,
    },
    config: {
      encoding: 'LINEAR16',
      languageCode: 'en-US',
      model: 'default',
    },
  };

  const [response] = await client.recognize(request);
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');
  
  console.log(`Transcription: ${transcription}`);
  return transcription;
}

module.exports = { handleWebSocketConnection, handleAudioMessage, activeSockets };
