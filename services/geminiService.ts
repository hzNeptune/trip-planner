import { GoogleGenAI, Type } from "@google/genai";
import { FoodRecommendation, ActivityRecommendation, TranslationResult, DayPlan, TripProfile } from "../types";

import { getApiKey, getBaseUrl } from "./storage";



// Helper to determine mode
const isOpenIMode = () => {
  const key = getApiKey();
  return key?.startsWith("sk-");
};

// --- OpenAI Compatible Implementation ---
const callOpenAI = async (
  systemPrompt: string,
  userPrompt: string,
  model: string = "gpt-3.5-turbo" // Default fallback if not specified, though we might want to map gemini-1.5 to gpt-4o-mini
) => {
  const apiKey = getApiKey();
  const baseUrl = getBaseUrl();

  if (!baseUrl) {
    throw new Error("请在设置中在'代理地址'栏填入API的中转地址 (例如 httsp://api.xyz.com)");
  }

  // Rough mapping of Gemini models to OpenAI equivalents for aggregators
  // Many aggregators support 'gemini-pro' mapped to valid models, 
  // but safer to use a common alias or pass the user's selection if we had one.
  // For now, let's try to map "gemini-1.5-flash" -> "gpt-4o-mini" (fast/cheap) 
  // and "gemini-2.0-flash" -> "gpt-4o" (smarter) to ensure good results from the aggregator.
  // OR: Just keep the model name if the aggregator supports gemini pass-through. 
  // Let's stick to "gpt-4o-mini" for general queries to be safe on quota.
  const targetModel = model.includes("2.0") ? "gpt-4o" : "gpt-4o-mini";

  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: targetModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API Error (${response.status}): ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("API returned empty response");

  return content; // Expecting JSON string
};


// --- Original Google SDK Implementation (Wrapped) ---
const getGenAI = () => {
  let key = getApiKey();
  // Fallback to Env Var
  if (!key) {
    key = process.env.GEMINI_API_KEY || "";
  }
  if (!key) throw new Error("MISSING_API_KEY");

  // Note: For official Google SDK, we ignore custom BaseURL usually, 
  // unless user really wants to proxy Google protocol, but 'sk-' check handles the main case.
  return new GoogleGenAI({ apiKey: key });
};

// Generic Expert Persona
const getSystemInstruction = (destination: string = "当地") => `
你是一个在${destination}生活了多年的毒舌美食家，也是一位地道的本地通 (Local Expert)。
你的性格设定：
1. **毒舌但客观**：推荐美食时，不要只说好话。如果某家店是专门骗游客的，请直说。
2. **幽默感**：用词风趣，拒绝枯燥的百科全书式回答。
3. **地道**：翻译时，提供当地人最常用的口语。
4. **玩乐专家**：推荐游玩地点时，关注氛围感、拍照出片率和独特性。
5. **格式严格**：必须返回纯净的 JSON 格式，不要包含 Markdown 代码块标记（如 \`\`\`json）。
`;

export const getFoodRecommendations = async (
  location: string,
  foodType: string,
  destinationContext: string = "当地"
): Promise<FoodRecommendation[]> => {
  const prompt = `我在${destinationContext}的【${location}】，想吃【${foodType}】。请推荐 3-4 家地道的店。
  
  请返回 JSON 数组，格式如下:
  [
    {
      "name": "店铺名称",
      "localName": "当地语言名称",
      "reason": "毒舌推荐理由",
      "price": "人均价格"
    }
  ]`;

  try {
    let jsonString = "";

    if (isOpenIMode()) {
      jsonString = await callOpenAI(getSystemInstruction(destinationContext), prompt, "gemini-1.5-flash");
    } else {
      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: {
          systemInstruction: getSystemInstruction(destinationContext),
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                localName: { type: Type.STRING },
                reason: { type: Type.STRING },
                price: { type: Type.STRING },
              },
              required: ["name", "localName", "reason", "price"],
            },
          }
        }
      });
      jsonString = response.text || "[]";
    }

    // Clean up potential markdown formatting if OpenAI returns it
    jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString) as FoodRecommendation[];
  } catch (error) {
    console.error("Food Radar Error:", error);
    throw error;
  }
};

export const getActivityRecommendations = async (
  location: string,
  interest: string,
  destinationContext: string = "当地"
): Promise<ActivityRecommendation[]> => {
  const prompt = `我在${destinationContext} ${location ? `的【${location}】附近` : ""}，我对【${interest}】感兴趣。请推荐 3 个好玩的地方或体验。
    
    请返回 JSON 数组，格式如下:
    [
        {
            "name": "名称",
            "localName": "当地名",
            "description": "介绍",
            "tips": "贴士"
        }
    ]`;

  try {
    let jsonString = "";
    if (isOpenIMode()) {
      jsonString = await callOpenAI(getSystemInstruction(destinationContext), prompt, "gemini-1.5-flash");
    } else {
      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: {
          systemInstruction: getSystemInstruction(destinationContext),
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                localName: { type: Type.STRING },
                description: { type: Type.STRING },
                tips: { type: Type.STRING },
              },
              required: ["name", "localName", "description", "tips"],
            },
          },
        },
      });
      jsonString = response.text || "[]";
    }

    jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString) as ActivityRecommendation[];
  } catch (error) {
    console.error("Activity Error:", error);
    throw error;
  }
};

export const translateToLocal = async (text: string, destinationContext: string = "国外"): Promise<TranslationResult> => {
  const prompt = `目的地是：${destinationContext}。
    请把这句话翻译成地道的当地语言(生存用语)："${text}"。
    
    返回格式要求 JSON:
    {
        "original": "当地语言原文 (大字体展示用)",
        "pronunciation": "发音指南 (罗马音或中文谐音)"
    }`;

  try {
    let jsonString = "";
    if (isOpenIMode()) {
      jsonString = await callOpenAI(getSystemInstruction(destinationContext), prompt, "gemini-1.5-flash");
    } else {
      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
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
      jsonString = response.text || "{}";
    }

    jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString) as TranslationResult;
  } catch (error) {
    console.error("Translation Error:", error);
    throw error;
  }
};

export const generateCustomItinerary = async (profile: TripProfile): Promise<DayPlan[]> => {
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

  返回格式 Example (JSON Array):
  [
    {
        "id": "day1", "date": "Day 1", "dayOfWeek": "周一",
        "weather": { "temp": "20°C", "condition": "晴", "outfit": "卫衣" },
        "items": [
            { "id": "d1-1", "time": "10:00", "activity": "...", "location": "...", "transport": "...", "notes": "..." }
        ]
    }
  ]
  `;

  try {
    let jsonString = "";
    if (isOpenIMode()) {
      // Use a smart model for itinerary
      jsonString = await callOpenAI(getSystemInstruction(profile.destination), prompt, "gemini-2.0-flash");
    } else {
      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
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
                date: { type: Type.STRING }, // description skipped for brevity
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
      jsonString = response.text || "[]";
    }

    jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString) as DayPlan[];
  } catch (error) {
    console.error("Itinerary Error:", error);
    throw error;
  }
};