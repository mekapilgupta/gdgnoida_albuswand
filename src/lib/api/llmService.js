const OPENROUTER_API_KEY = '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';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL_ID = 'google/gemma-3n-e2b-it:free';

/**
 * @param {any} aqiData
 */
export async function getAqiInsights(aqiData) {
	console.log('🤖 LLM Service: Starting getAqiInsights with data:', aqiData);
	
	if (!aqiData) {
		console.log('🤖 LLM Service: No AQI data provided, returning null');
		return null;
	}

	const prompt = `
        Given the following AQI data for Delhi, provide a summary and actionable advice.
        Data: ${JSON.stringify(aqiData, null, 2)}

        Provide the following:
        1. A brief, engaging summary of the current air quality situation.
        2. Actionable advice for different groups (e.g., general public, sensitive groups, outdoor workers).
        3. A warning if any station has a particularly high AQI.

        Format the output as a JSON object with the following keys: 'summary', 'advice', 'warning'.
    `;

	console.log('🤖 LLM Service: Generated prompt:', prompt.substring(0, 200) + '...');

	try {
		console.log('🤖 LLM Service: Making API request to OpenRouter...');
		console.log('🤖 LLM Service: API URL:', API_URL);
		console.log('🤖 LLM Service: Model ID:', MODEL_ID);
		console.log('🤖 LLM Service: API Key present:', !!OPENROUTER_API_KEY);

		const response = await fetch(API_URL, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${OPENROUTER_API_KEY}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				model: MODEL_ID,
				messages: [{ role: 'user', content: prompt }],
			}),
		});

		console.log('🤖 LLM Service: API Response status:', response.status);
		console.log('🤖 LLM Service: API Response ok:', response.ok);

		if (!response.ok) {
			const errorText = await response.text();
			console.error('🤖 LLM Service: API Error response:', errorText);
			throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
		}

		const data = await response.json();
		console.log('🤖 LLM Service: Received data from API:', data);
		console.log('🤖 LLM Service: Choices available:', data.choices?.length);

		if (!data.choices || data.choices.length === 0) {
			console.error('🤖 LLM Service: No choices returned from API');
			return null;
		}

		const content = data.choices[0].message.content;
		console.log('🤖 LLM Service: Raw content from API:', content);

		// Safely parse the JSON content - handle markdown code blocks
		try {
			let jsonContent = content;
			
			// Extract JSON from markdown code blocks if present
			if (content.includes('```json')) {
				console.log('🤖 LLM Service: Detected markdown code block, extracting JSON...');
				const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
				if (jsonMatch && jsonMatch[1]) {
					jsonContent = jsonMatch[1].trim();
					console.log('🤖 LLM Service: Extracted JSON from markdown:', jsonContent);
				}
			}
			
			const parsedContent = JSON.parse(jsonContent);
			console.log('🤖 LLM Service: Successfully parsed JSON content:', parsedContent);
			return parsedContent;
		} catch (e) {
			console.error('🤖 LLM Service: Error parsing LLM response JSON:', e);
			console.log('🤖 LLM Service: Returning raw content as summary');
			return { summary: content, advice: '', warning: '' };
		}
	} catch (error) {
		console.error('🤖 LLM Service: Error fetching AQI insights:', error);
		console.error('🤖 LLM Service: Error stack:', error.stack);
		return null;
	}
}