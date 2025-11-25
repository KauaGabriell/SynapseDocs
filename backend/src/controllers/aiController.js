import db from "../models/index.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// fallback simple answer if no AI configured
async function simpleAnswer(question, docText) {
  // very naive: return short answer echoing question
  return `Resumo rápido: eu não encontrei um provedor de IA configurado. Pergunta recebida: "${question}". Document length: ${docText?.length || 0} chars.`;
}

const aiController = {};
aiController.chat = async function (req, res) {
  try {
    const projectId = req.params.projectId;
    const userId = req.id_user;

    // check ownership
    const project = await db.Project.findOne({
      where: { id_projects: projectId, id_user: userId },
    });
    if (!project) return res.status(404).json({ error: "Projeto não encontrado" });

    const doc = await db.ApiDocumentation.findOne({ where: { id_project: projectId } });
    if (!doc) return res.status(404).json({ error: "Documentação não encontrada" });

    const question = (req.body.message || "").toString().trim();
    if (!question) return res.status(400).json({ error: "Mensagem vazia" });

    // prepare context: a compact string of the OpenAPI (limit size!)
    let docContent;
    try {
      docContent = typeof doc.content === "string" ? doc.content : JSON.stringify(doc.content);
    } catch (e) {
      docContent = "";
    }

    // limit context to X chars to avoid too long prompt
    const context = docContent.slice(0, 80_000);

    if (!genAI) {
      const reply = await simpleAnswer(question, context);
      return res.json({ reply });
    }

    // Build prompt
    const prompt = `
Você é um assistente técnico que responde com base na documentação OpenAPI fornecida.
Responda de forma objetiva, cite endpoints relevantes (método + caminho), e inclua exemplos de requisição quando aplicável.

DOCUMENTAÇÃO (trecho):
${context}

PERGUNTA:
${question}

INSTRUÇÕES:
- Seja conciso (máx 400 palavras).
- Se a resposta exigir, mostre exemplo de payload JSON.
- Se não encontrar resposta, diga que não encontrou e sugira endpoints relevantes.
`;

    // use Gemini model (similar to your analysisService usage)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.2,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1024,
      },
    });

    let attempt = 0;
    let result;
    while (attempt < 3) {
      try {
        result = await model.generateContent(prompt);
        break;
      } catch (err) {
        attempt++;
        if (attempt >= 3) throw err;
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    const response = await result.response;
    let text = await response.text();

    // clean code fences if present
    text = text.replace(/```(?:json)?\n?/g, "").replace(/```\n?/g, "").trim();

    return res.json({ reply: text });
  } catch (err) {
    console.error("AI chat error:", err);
    return res.status(500).json({ error: "Erro ao gerar resposta de IA" });
  }
};

export default aiController;
