/*
import { ChatOpenAI } from "@langchain/openai";
const llm = new ChatOpenAI({
  model: '0:llama3.2:3b',
  apiKey: "sk-c53df5dbc46a4a4dbef4124946ec78fe",
  temperature: 0,
  maxRetries: 2,
  verbose: true,
  configuration: {
      baseURL: "https://dev-llm.openrainbow.io/ollama/v1",
      defaultHeaders: { 'Authorization': `Bearer sk-c53df5dbc46a4a4dbef4124946ec78fe` }
  }
});

const inputText = "MistralAI is an AI company that ";
const completion = await llm.invoke(inputText);
console.log(completion);
*/
import axios from 'axios';
let data = JSON.stringify({
  "model": "1.ibnzterrell/Meta-Llama-3.3-70B-Instruct-AWQ-INT4",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "Tell me a joke."
    }
  ]
});

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://dev-llm.openrainbow.io/ollama/v1/chat/completions',
  headers: { 
    'Content-Type': 'application/json', 
    'Authorization': 'Bearer sk-c53df5dbc46a4a4dbef4124946ec78fe'
  },
  data : data
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});