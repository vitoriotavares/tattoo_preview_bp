O Gemini 2.5 Flash Image Preview, apelidado "Nano Banana", foi lançado em 26 de agosto de 2025. Inicialmente apareceu anonimamente no LMArena
  antes do Google revelar ser o criador. É o modelo de geração e edição de imagens mais rápido e eficiente da Google.

  Capacidades Principais

  1. Consistência de Personagem: Mantém aparência através de múltiplas edições
  2. Fusão Multi-imagem: Combina várias imagens em uma composição única
  3. Edição Conversacional: Modificações usando linguagem natural
  4. Conhecimento Mundial Integrado: Usa o conhecimento do Gemini para resultados contextuais

  💡 Melhores Práticas de Prompting para TattooPreview

  1. Descreva Cenas, Não Palavras-chave

  ❌ Ruim: "tatuagem, braço, realista, dragão"
  ✅ Bom: "Aplique esta tatuagem de dragão no braço da pessoa com qualidade fotorrealista, seguindo os contornos naturais do músculo e
  preservando a iluminação ambiente da pele"

  2. Use Linguagem Fotográfica

  - Mencione: ângulos de câmera, tipos de lente, iluminação
  - Exemplos: "85mm portrait lens", "soft diffused lighting", "macro detail shot"

  3. Prompts Específicos para Tatuagem

  Para Adicionar Tatuagem:
  const addTattooPrompt = `
  Using the provided tattoo design reference, apply it to the person's ${bodyPart} 
  with photorealistic quality. Ensure:
  - Natural integration with skin texture and pores
  - Proper perspective following body contours  
  - Realistic ink saturation as if freshly healed
  - Appropriate shadow and highlight integration
  - Seamless blending with existing skin tone
  - Preserve any natural marks like moles or freckles around the area
  `;

  Para Remover Tatuagem:
  const removeTattooPrompt = `
  Remove the tattoo from the ${location} while maintaining photorealistic skin appearance.
  Requirements:
  - Reconstruct underlying skin texture with natural pores and fine lines
  - Match surrounding skin tone variations and patterns perfectly
  - Preserve all natural body marks (moles, freckles, scars)
  - Maintain consistent lighting and shadows
  - No visible artifacts, blur, or smoothing
  - Keep the same skin age and condition
  `;

  Para Retocar Tatuagem:
  const enhanceTattooPrompt = `
  Enhance and restore this existing tattoo to professional photography quality.
  Adjustments needed:
  - Sharpen line work to crisp black definition
  - Restore color vibrancy to fresh ink appearance
  - Fix any fading or blur from age
  - Enhance contrast between ink and skin
  - Preserve original artistic style and design intent
  - Apply subtle highlights to make it pop
  Style: ${style} tattoo photography
  `;

  4. Técnicas Avançadas

  Controle de Aspect Ratio:
  "Update the image... Do not change the input aspect ratio."

  Edição Iterativa:
  // Primeira iteração
  "Add the tattoo to the forearm"
  // Segunda iteração  
  "Make the tattoo 20% larger and adjust the angle to follow the arm curve better"
  // Terceira iteração
  "Increase the black ink saturation for a fresher look"

  Multi-imagem para Composição:
  const multiImagePrompt = [
    { text: "Combine these images:" },
    { inlineData: { mimeType: "image/png", data: bodyImage }},
    { text: "Use this tattoo design:" },
    { inlineData: { mimeType: "image/png", data: tattooDesign }},
    { text: "Apply the tattoo to the shoulder area with natural skin integration" }
  ];

  🔧 Implementação Técnica

  import { GoogleGenAI } from "@google/genai";

  const processeTattoo = async (
    mode: 'add' | 'remove' | 'enhance',
    bodyImage: Buffer,
    tattooImage?: Buffer
  ) => {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    const config = {
      model: "gemini-2.5-flash-image-preview",
      generationConfig: {
        temperature: 0.4, // Menor para mais consistência
        topK: 32,
        topP: 0.8,
      }
    };

    const response = await ai.models.generateContent({
      ...config,
      contents: [
        { text: getPromptByMode(mode) },
        { inlineData: {
          mimeType: "image/png",
          data: bodyImage.toString("base64")
        }},
        ...(tattooImage ? [{
          inlineData: {
            mimeType: "image/png",
            data: tattooImage.toString("base64")
          }
        }] : [])
      ]
    });

    return response;
  };

  💰 Custos

  - $0.039 por imagem (1290 tokens de output)
  - $30.00 por 1 milhão de tokens

  ⚠️ Limitações Conhecidas

  - Dificuldade com rostos pequenos
  - Spelling preciso em texto
  - Detalhes muito finos podem ser perdidos

  ✅ Recomendações para TattooPreview

  1. Sempre preserve proporções: Adicione explicitamente no prompt
  2. Use referências múltiplas: Para manter consistência de estilo
  3. Seja específico sobre localização: "inner forearm", "upper back", etc.
  4. Mencione qualidade: "professional tattoo photography", "high-resolution"
  5. Iteração é chave: Refine em múltiplos passos para resultado perfeito




  models/gemini-2.5-flash-image-preview