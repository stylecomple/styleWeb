
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productName, currentDescription, categories, subcategories } = await req.json();
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // Build context from categories and subcategories
    let categoryContext = '';
    if (categories && categories.length > 0) {
      categoryContext += ` This product belongs to the following categories: ${categories.join(', ')}.`;
    }
    if (subcategories && subcategories.length > 0) {
      categoryContext += ` Subcategories: ${subcategories.join(', ')}.`;
    }

    const prompt = `Create a compelling marketing description for a product called "${productName}".${categoryContext} ${currentDescription ? `Current description: "${currentDescription}". Improve and enhance it.` : 'Create a new description.'} Make it concise, engaging, and focused on benefits. Keep it under 150 words. Write in Arabic and make sure the description is suitable for the product's category. Return ONLY the description text without any introductory phrases or explanations.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
        }
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Gemini API error:', data);
      throw new Error(data.error?.message || 'Failed to generate description');
    }

    let generatedDescription = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedDescription) {
      throw new Error('No description generated');
    }

    // Clean up any introductory phrases that might still appear
    generatedDescription = generatedDescription
      .replace(/^Here's.*?description.*?:?\s*/i, '')
      .replace(/^إليك.*?وصف.*?:?\s*/i, '')
      .replace(/^تحسين.*?وصف.*?:?\s*/i, '')
      .trim();

    return new Response(JSON.stringify({ description: generatedDescription }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-product-description function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
