const { isAccentConversionActive } = require('./ringCentralController');
const WebSocket = require('ws');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

let activeSockets = [];
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function convertToCanadianAccent(text) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/audio/synthesize',
      {
        input: { text },
        voice: "en-CA-Standard-A", 
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Canadian accent audio generated');
    return Buffer.from(response.data.audio);
  } catch (error) {
    console.error('Error in OpenAI TTS:', error.message);
    throw new Error('Failed to generate Canadian accent audio');
  }
}

async function transcribeAudio(audioBuffer) {
  try {
    const audioBytes = audioBuffer.toString('base64');
    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions', 
      {
        model: 'whisper-1',
        file: audioBuffer,
        response_format: 'json',
        language: 'en',
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const transcription = response.data.text;
    console.log(`Transcription: ${transcription}`);
    return transcription;
  } catch (error) {
    console.error('Error in OpenAI transcription:', error.message);
    throw new Error('Failed to transcribe audio');
  }
}

async function handleAudioMessage(ws, message) {
  const transcription = await transcribeAudio(message);
  let processedAudio;
  if (isAccentConversionActive()) {
    processedAudio = await convertToCanadianAccent(transcription);
  } else {
    processedAudio = transcription; 
  }

  return processedAudio;
}

function handleWebSocketConnection(ws) {
  console.log('Client connected');
  activeSockets.push(ws);

  ws.on('message', async (message) => {
    console.log('Received audio data');
    try {
      const processedData = await handleAudioMessage(ws, message);
      ws.send(Buffer.from(processedData));
    } catch (error) {
      console.error('Error handling message:', error);
      ws.send(JSON.stringify({ error: 'Failed to process audio', details: error.message }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    activeSockets = activeSockets.filter((socket) => socket !== ws);
  });
}

module.exports = { handleWebSocketConnection, handleAudioMessage, activeSockets };
