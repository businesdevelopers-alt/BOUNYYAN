import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisReport, ComplianceStatus } from "../types";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION_ANALYST = `
You are a Senior Engineering Compliance Specialist for the Kingdom of Saudi Arabia.
Your role is to analyze architectural and engineering drawings (provided as images) against the Saudi Building Code (SBC).
Focus areas:
1. SBC 201 (General Building)
2. SBC 801 (Fire Code)
3. Accessibility Standards
4. Structural Integrity (General checks)

When analyzing an image:
- Identify key elements: Exits, Corridors, Rooms, Parking, Ramps.
- Flag non-compliance issues (e.g., dead-end corridors > 6m, door widths < 900mm, missing fire exits).
- Be precise with SBC references.
- **CRITICAL**: For every finding, provide a 2D bounding box [ymin, xmin, ymax, xmax] (normalized 0-1 coordinates) that strictly highlights the specific area of the issue on the drawing.
- If the image is unclear or abstract, provide a best-effort analysis based on visible geometry.
`;

const SYSTEM_INSTRUCTION_CHAT = `
You are an expert AI Consultant for Saudi Engineering Compliance.
You help engineers understand and fix compliance issues in their AutoCAD/BIM designs.
You have deep knowledge of:
- Saudi Building Code (SBC) 201, 801, 501, 601.
- MOMRAH (Ministry of Municipal and Rural Affairs and Housing) regulations.
- Civil Defense requirements.

Provide actionable, technical advice. Be professional, concise, and helpful.
`;

export const analyzeDrawingImage = async (base64Image: string, fileName: string): Promise<AnalysisReport> => {
  try {
    const model = "gemini-2.5-flash"; // Efficient for multimodal analysis
    
    // Schema for structured output
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        overallScore: { type: Type.NUMBER, description: "A score from 0 to 100 based on compliance." },
        summary: { type: Type.STRING, description: "Executive summary of the compliance scan." },
        findings: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              category: { type: Type.STRING },
              description: { type: Type.STRING },
              reference: { type: Type.STRING, description: "The specific SBC code reference." },
              status: { type: Type.STRING, enum: ["PASS", "FAIL", "WARNING", "NEEDS_CLARIFICATION"] },
              recommendation: { type: Type.STRING },
              location: { type: Type.STRING, description: "Approximate location on drawing." },
              boundingBox: {
                type: Type.ARRAY,
                items: { type: Type.NUMBER },
                description: "Bounding box [ymin, xmin, ymax, xmax] in normalized 0-1 coordinates."
              }
            },
            required: ["id", "category", "description", "status", "recommendation"]
          }
        }
      },
      required: ["overallScore", "summary", "findings"]
    };

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg", // Assuming converted to jpeg or png before sending
              data: base64Image
            }
          },
          {
            text: "Analyze this engineering drawing for Saudi Building Code compliance. Focus on fire safety, egress, dimensions, and room labeling. Return a detailed JSON report."
          }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_ANALYST,
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return {
        ...data,
        scanDate: new Date().toISOString(),
        fileName: fileName,
        imageBase64: base64Image
      };
    }
    throw new Error("No data returned from Gemini");

  } catch (error) {
    console.error("Analysis failed", error);
    // Fallback/Mock data if analysis fails (or for demo purposes if key is invalid)
    return {
      overallScore: 0,
      summary: "Error processing analysis. Please ensure valid API Key and image format.",
      scanDate: new Date().toISOString(),
      fileName: fileName,
      imageBase64: base64Image,
      findings: [
        {
          id: "err-1",
          category: "System",
          description: "Could not complete AI analysis.",
          reference: "N/A",
          status: ComplianceStatus.FAIL,
          recommendation: "Try uploading a clearer image or check connection.",
          boundingBox: [0.1, 0.1, 0.9, 0.9] // Mock box
        }
      ]
    };
  }
};

export const sendChatMessage = async (history: { role: string, parts: { text: string }[] }[], newMessage: string) => {
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    history: history,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_CHAT,
    },
  });

  const result = await chat.sendMessage({ message: newMessage });
  return result.text;
};