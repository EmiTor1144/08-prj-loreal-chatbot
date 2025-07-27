// Copy this code into your Cloudflare Worker script

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only process POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    const apiKey = env.OPENAI_API_KEY; // Make sure to name your secret OPENAI_API_KEY in the Cloudflare Workers dashboard
    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    
    // Add error handling for JSON parsing
    let userInput;
    try {
      userInput = await request.json();
    } catch (error) {
      return new Response('Invalid JSON in request body', { status: 400, headers: corsHeaders });
    }

    // Validate that messages array exists
    if (!userInput.messages || !Array.isArray(userInput.messages)) {
      return new Response('Missing or invalid messages array', { status: 400, headers: corsHeaders });
    }

    const requestBody = {
      model: 'gpt-4o',
      messages: userInput.messages,
      max_completion_tokens: 300,
    };

    // Add error handling for OpenAI API call
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      // Check if OpenAI API returned an error
      if (!response.ok) {
        return new Response(JSON.stringify(data), { status: response.status, headers: corsHeaders });
      }

      return new Response(JSON.stringify(data), { headers: corsHeaders });
    } catch (error) {
      return new Response('Error calling OpenAI API', { status: 500, headers: corsHeaders });
    }
  }
};
