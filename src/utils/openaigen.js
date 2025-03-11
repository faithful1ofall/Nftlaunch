//"use server";
import openai from "./openaimodel";

export const generateCollectionTheme = async (userPrompt) => {
  try {
    if (!userPrompt) {
      return { error: "Prompt is required" };
    }
    console.log('start collection theme', userPrompt);

    // Generate structured collection theme
    const themePrompt = `
  Based on the prompt: ${userPrompt}, generate a structured NFT collection theme.  
Return **only** a JSON object with the following structure, with no extra text, explanations, or formatting:  

{
  "CollectionName": "string (max 50 chars)",
  "Description": "string (max 200 chars)",
  "ArtStyle": "string (max 50 chars)",
  "Layers": {
    "Background": "string (max 100 chars)",
    "Characters": "string (max 100 chars)",
    "Clothing": "string (max 100 chars)",
    "Accessories": "string (max 100 chars)"
  },
  "RarityDistribution": {
    "Common": "string (max 50 chars)",
    "Rare": "string (max 50 chars)",
    "Epic": "string (max 50 chars)",
    "Legendary": "string (max 50 chars)"
  }
}  

Ensure the entire JSON response does not exceed **950 characters**.  
Do **not** include any introductions, explanations, or additional text—return **only** valid JSON.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: themePrompt }],
      temperature: 0.7,
    });
    console.log('server response', response);

    if (!response.choices || !response.choices[0].message.content) {
      throw new Error(`No theme generated.`);
    }

    
    const cleanResponse = response.choices[0].message.content;
    const collectionTheme = cleanResponse.replace(/```json|```/g, '').trim();

  //  const match = cleanResponse.match(/```json\n([\s\S]*?)\n```/);
    
   // const collectionTheme = match[1];
    

    return { success: true, collectionTheme, response };
  } catch (error) {
    console.error("Error generating NFT collection theme:", error);
    return { error: error.message };
  }
};

export const generateNFTCollection = async (collectionTheme, numNFTs = 10) => {
  try {
    if (!collectionTheme) {
      return { error: "Collection theme is required" };
    }

    // Step 1: Generate Images for all NFTs in one batch
    const imagePrompt = `${collectionTheme}, highly detailed, fantasy style, NFT artwork`;
    const imageRes = await openai.images.generate({
      prompt: imagePrompt,
      n: numNFTs,
      size: "512x512",
    });

    if (!imageRes.data || imageRes.data.length !== numNFTs) {
      throw new Error(`Expected ${numNFTs} images, but received ${imageRes.data.length}`);
    }

    const imageUrls = imageRes.data.map(img => img.url);

    // Step 2: Generate Metadata for all NFTs in one batch
    const metadataPrompt = `
Generate unique metadata for a set of ${numNFTs} NFTs called '${collectionTheme}'.  

Each NFT should have attributes in the following format:  
An **array of objects**, where each object contains:  
- **"display_type"**: Either **"string"** or **"number"**  
- **"trait_type"**: Trait name (e.g., **"Background"**, **"Clothing"**, **"Magic"**, **"Accessories"**, **"Special Effects"**)  
- **"value"**: A descriptive string or numerical value  

**Example Format:**
\`\`\`json
[
  {
    "name": "NFT Name 1",
    "description": "Brief description of the NFT",
    "attributes": [
      { "display_type": "string", "trait_type": "Background", "value": "Starry Night" },
      { "display_type": "string", "trait_type": "Clothing", "value": "Golden Armor" },
      { "display_type": "number", "trait_type": "Magic", "value": 85 }
    ]
  },
  { 
    "name": "NFT Name 2",
    "description": "Brief description of the NFT",
    "attributes": [
      { "display_type": "string", "trait_type": "Background", "value": "Cyber City" },
      { "display_type": "string", "trait_type": "Accessories", "value": "Neon Glasses" },
      { "display_type": "number", "trait_type": "Special Effects", "value": 95 }
    ]
  }
]
\`\`\`

Ensure the response **only** contains **a valid JSON array**—do **not** include any explanations, formatting, or additional text.`
;
    const metadataRes = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: metadataPrompt }],
      temperature: 0.7,
    });
    console.log('metadataRes', metadataRes);

    if (!metadataRes.choices || !metadataRes.choices[0].message.content) {
      throw new Error(`No metadata generated for the collection`);
    }

    const rawres = metadataRes.choices[0].message.content;
    
    const cleanres = rawres.replace(/```json|```/g, '').trim();
  //  const match = rawres.match(/```json\n([\s\S]*?)\n```/);
    
  //  const metadataArray = JSON.parse(match[1]);
    
    
    const metadataArray = JSON.parse(cleanres);

    if (!Array.isArray(metadataArray) || metadataArray.length !== numNFTs) {
      throw new Error(`Metadata response is not in the expected array format.`);
    }

    // Step 3: Fetch all images via proxy in parallel
    const nftCollection = await Promise.all(imageUrls.map(async (imageUrl, index) => {
      const proxyUrl = `/api/image?url=${encodeURIComponent(imageUrl)}`;
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch image ${index + 1}: ${response.statusText}`);
      }

      const blob = await response.blob();

      return {
        id: index + 1,
        imageUrl,
        proxyUrl,
        blob,
        metadata: metadataArray[index], // Assign metadata to the corresponding NFT
      };
    }));

    return { success: true, nftCollection };
  } catch (error) {
    console.error("Error generating NFT collection:", error);
    return { error: error.message };
  }
};

export const generateImage = async (FormData) => {
  try {
    const prompt = FormData;
    if (!prompt) {
      return { error: "Prompt is required" };
    }

    // Generate an image using OpenAI
    const res = await openai.images.generate({
      prompt: prompt,
      n: 1,
      size: "512x512",
    });

    const imageUrl = res.data[0].url;
    if (!imageUrl) {
      throw new Error("Image URL not found in response");
    }

    // Fetch the image using our API proxy to avoid CORS issues
    const proxyUrl = `/api/image?url=${encodeURIComponent(imageUrl)}`;
    const response = await fetch(proxyUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    console.log('proxy', response, imageUrl);

    const blob = await response.blob();
    return { imageUrl, blob,  proxyUrl};
  } catch (error) {
    console.error("Error generating AI image:", error);
    return { error: error.message };
  }
};
