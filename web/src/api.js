import axios from 'axios';

export const getOpenAIDescription = async (word, newDescription = false, prevDescriptions = "") => {
    const prompt = newDescription
        ? `You're playing Alias game with an user.
User is trying to guess the word "${word}".
The user answered wrong. There are previous descriptions and user answers:
${prevDescriptions}
You need to help the user to find the right answer without saying the word "${word}".
You can provide another description or describe the difference between the right answer and the user answers but without saying word "${word}".
Remember: NEVER SAY THE ANSWER (word ${word}) and its cognates!!!
Answer with one sentence addressing the user.`
        : `I want you to play alias game with an user.
Your word is "${word}".
You need to provide a simple description of this word.
Remember: never say the word ${word} and its cognates!!!
Answer with one sentence. `;

    try {
        const response = await axios.post('http://localhost:5001/api/openai', { prompt });
        return response.data.description
    } catch (error) {
        console.error("Error fetching descriptions from OpenAI", error);
        return newDescription ? "No new description available" : ["No descriptions available"];
    }
};