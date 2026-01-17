import { GoogleGenAI, Type } from "@google/genai";
import { FoodRecommendation, ActivityRecommendation, TranslationResult, DayPlan, TripProfile } from "../types";

import { getApiKey, getBaseUrl } from "./storage";

// Helper to get authenticated AI instance
const getGenAI = () => {
  // 1. Try to get key from Local Storage (User provided)
  let key = getApiKey();

  // 2. Fallback to Env Var
  if (!key) {
    key = process.env.GEMINI_API_KEY || "";
  }

  if (!key) {
    throw new Error("MISSING_API_KEY");
  }

  // 3. Get Custom Base URL (if any)
  const baseUrl = getBaseUrl();

  // Construct client options
  const options: any = { apiKey: key };
  if (baseUrl) {
    // Note: The SDK might map this differently depending on version, 
    // but typically '{ apiKey, baseUrl }' or passing rootUrl in config works for many proxies.
    // Ideally we'd validte the SDK version capability, but let's try standard init.
    options.baseUrl = baseUrl;
  }

  return new GoogleGenAI(options);
};

// Generic Expert Persona
const getSystemInstruction = (destination: string = "当地") => `
你是一个在${destination}生活了多年的毒舌美食家，也是一位地道的本地通 (Local Expert)。
你的性格设定：
1. **毒舌但客观**：推荐美食时，不要只说好话。如果某家店是专门骗游客的，请直说。
2. **幽默感**：用词风趣，拒绝枯燥的百科全书式回答。
3. **地道**：翻译时，提供当地人最常用的口语。
4. **玩乐专家**：推荐游玩地点时，关注氛围感、拍照出片率和独特性。
`;

export const getFoodRecommendations = async (
  location: string,
  foodType: string,
  destinationContext: string = "当地"
): Promise<FoodRecommendation[]> => {
  const ai = getGenAI();
  const model = "gemini-2.0-flash";
  const prompt = `我在${destinationContext}的【${location}】，想吃【${foodType}】。请推荐 3-4 家地道的店。`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: getSystemInstruction(destinationContext),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "店铺名称" },
              localName: { type: Type.STRING, description: "店铺当地语言名称 (如韩语/日语/泰语)" },
              reason: { type: Type.STRING, description: "毒舌且幽默的推荐理由" },
              price: { type: Type.STRING, description: "人均价格估算" },
            },
            required: ["name", "localName", "reason", "price"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as FoodRecommendation[];
  } catch (error) {
    console.error("Gemini Food Radar Error:", error);
    throw error;
  }
};

export const getActivityRecommendations = async (
  location: string,
  interest: string,
  destinationContext: string = "当地"
): Promise<ActivityRecommendation[]> => {
  const ai = getGenAI();
  const model = "gemini-1.5-flash";
  const prompt = `我在${destinationContext} ${location ? `的【${location}】附近` : ""}，我对【${interest}】感兴趣。请推荐 3 个好玩的地方或体验。`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: getSystemInstruction(destinationContext),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "景点/活动名称" },
              localName: { type: Type.STRING, description: "当地语言名称" },
              description: { type: Type.STRING, description: "有趣的玩法介绍" },
              tips: { type: Type.STRING, description: "实用贴士或避雷指南" },
            },
            required: ["name", "localName", "description", "tips"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as ActivityRecommendation[];
  } catch (error) {
    console.error("Gemini Activity Scout Error:", error);
    throw error;
  }
};

export const translateToLocal = async (text: string, destinationContext: string = "国外"): Promise<TranslationResult> => {
  const ai = getGenAI();
  const model = "gemini-1.5-flash";
  const prompt = `目的地是：${destinationContext}。
  请把这句话翻译成地道的当地语言(生存用语)："${text}"。
  
  返回格式要求 JSON:
  {
    "original": "当地语言原文 (大字体展示用)",
    "pronunciation": "发音指南 (罗马音或中文谐音)"
  }`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: getSystemInstruction(destinationContext),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            original: { type: Type.STRING },
            pronunciation: { type: Type.STRING },
          },
          required: ["original", "pronunciation"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response text");
    return JSON.parse(resultText) as TranslationResult;
  } catch (error) {
    console.error("Gemini Translation Error:", error);
    throw error;
  }
};

export const generateCustomItinerary = async (profile: TripProfile): Promise<DayPlan[]> => {
  const ai = getGenAI();
  // Using flash for speed/cost balance, or pro if complex reasoning needed
  const model = "gemini-2.0-flash";

  const prompt = `
  请为我生成一份详细的、JSON格式的【${profile.destination}】旅行行程表。
  
  **用户资料**：
  - **时间**: ${profile.dates}
  - **住宿地点**: ${profile.hotel}
  - **旅行风格**: ${profile.travelerType}
  - **兴趣**: ${profile.interests}
  - **必去**: ${profile.mustVisit}
  - **饮食**: ${profile.foodPrefs}

  **生成要求**：
  1. **地理顺路**：必须根据地理位置安排每天行程，不要东奔西跑。
  2. **交通方案**：提供从住宿点出发的交通建议。
  3. **风格适配**：如果是松弛感，行程不要太满；如果是特种兵，请安排满。
  4. **语言风格**：保持幽默、地道、年轻化。
  5. **天气穿搭**：根据该目的地该季节的平均天气给出建议。

  请严格按照定义的 JSON Schema 返回数据。
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: getSystemInstruction(profile.destination),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              date: { type: Type.STRING, description: "日期 (e.g. 'Day 1')" },
              dayOfWeek: { type: Type.STRING },
              weather: {
                type: Type.OBJECT,
                properties: {
                  temp: { type: Type.STRING },
                  condition: { type: Type.STRING },
                  outfit: { type: Type.STRING },
                },
                required: ["temp", "condition", "outfit"]
              },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    time: { type: Type.STRING },
                    activity: { type: Type.STRING },
                    location: { type: Type.STRING },
                    transport: { type: Type.STRING },
                    notes: { type: Type.STRING },
                  },
                  required: ["id", "time", "activity", "location", "transport", "notes"]
                }
              }
            },
            required: ["id", "date", "dayOfWeek", "weather", "items"]
          }
        },
      },
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as DayPlan[];
  } catch (error) {
    console.error("Gemini Itinerary Generation Error:", error);
    throw error;
  }
};