import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import morgan from "morgan";
import fs from "node:fs";

dotenv.config();

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

app.get("/imput-prompt", async (req, res) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const prompt = "Write a short history about a haunted house.";
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  console.log(text);
  res.send(text);
});

app.get("/image", async (req, res) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

  const prompt = "What's different between these pictures?";

  const imageParts = [
    fileToGenerativePart("Cat.jpg", "image/jpeg"),
    fileToGenerativePart("Dog.jpg", "image/jpeg"),
  ];

  const result = await model.generateContent([prompt, ...imageParts]);
  const response = await result.response;
  const text = response.text();
  console.log(text);
  res.send(text);
});

app.get("/chat", async (req, res) => {
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: "Hello, I have 2 dogs in my house.",
      },
      {
        role: "model",
        parts: "Great to meet you. What would you like to know?",
      },
    ],
    generationConfig: {
      maxOutputTokens: 100,
    },
  });

  const msg = "How many paws are in my house?";

  const result = await chat.sendMessage(msg);
  const response = await result.response;
  const text = response.text();
  console.log(text);
  res.send(text);
});
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
