import pool from '@/lib/pool';

/**
 * POST /api/chatbot/respond
 * 
 * Handles chatbot responses by matching user input to keywords in the database.
 * Returns the most relevant response based on keyword matches and priority.
 * 
 * Request: { message: string }
 * Response: { response: string, category: string, keywords_matched: string[] }
 */

export async function POST(request) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return Response.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const userInput = message.toLowerCase().trim();

    const result = await pool.query(
      `SELECT id, keywords, response, category, priority 
       FROM chatbot_responses 
       WHERE active = true
       ORDER BY priority DESC, id ASC`
    );

    if (result.rows.length === 0) {
      return Response.json({
        response: "I'm currently offline, but I'll be back soon! Try discussing with other students in the forum or exploring the resources tab. 🚀",
        category: 'offline',
        keywords_matched: []
      });
    }

    // Find best matching response
    let bestMatch = null;
    let bestMatchCount = 0;
    let bestMatchedKeywords = [];

    for (const row of result.rows) {
      const keywords = Array.isArray(row.keywords) ? row.keywords : [];
      const matchedKeywords = [];

      // Count keyword matches
      for (const keyword of keywords) {
        if (userInput.includes(keyword.toLowerCase())) {
          matchedKeywords.push(keyword);
        }
      }

      // Update best match if this has more keyword hits or same hits but higher priority
      if (
        matchedKeywords.length > bestMatchCount ||
        (matchedKeywords.length === bestMatchCount && 
         (!bestMatch || row.priority > bestMatch.priority))
      ) {
        bestMatch = row;
        bestMatchCount = matchedKeywords.length;
        bestMatchedKeywords = matchedKeywords;
      }
    }

    // If no keywords matched, return the fallback response (lowest priority)
    if (!bestMatch) {
      const fallback = result.rows.find(r => r.category === 'fallback');
      bestMatch = fallback || result.rows[result.rows.length - 1];
      bestMatchedKeywords = [];
    }

    console.log(`🤖 Chatbot: Matched "${userInput}" to category "${bestMatch.category}" with ${bestMatchCount} keywords`);

    return Response.json({
      response: bestMatch.response,
      category: bestMatch.category,
      keywords_matched: bestMatchedKeywords,
      confidence: bestMatchCount > 0 ? 'high' : 'low'
    });
  } catch (error) {
    console.error('Chatbot API error:', error);
    return Response.json(
      { 
        error: 'Failed to get response',
        response: 'Sorry, something went wrong! Try again later. 🤖'
      },
      { status: 500 }
    );
  }
}
