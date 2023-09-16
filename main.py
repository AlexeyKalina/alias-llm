import os
import random
from typing import List, Optional
import openai


def description_prompt(word: str) -> str:
    return f"""
I want you to play alias game with an user.
Your word is "{word}". You need to provide a simple description of this word. Remember: never say the word {word} and its cognates!!! Answer with one sentence. 
"""


def another_description_prompt(word: str, user_word: str, previous_descriptions: List[str]):
    return f"""
You're playing Alias game with an user.
Your word is "{word}". The user was wrong. He answered: "{user_word}" on your previous description: "{previous_descriptions[0]}". You need to help the user to find the right answer without saying word "{word}". You can provide another description or describe the difference between the right answer and the user answer but without saying word "{word}". Remember: NEVER SAY THE ANSWER (word {word}) and its cognates!!! Answer with one sentence addressing the user.
"""


def guess_prompt(description: str):
    return f"""
I want you to play alias game with an user.
Guess the word by user description: "{description}". Answer with one word. 
"""


def another_guess_prompt(description: str, previous_description: str, previous_word: str):
    return f"""
You're playing Alias game with an user.
You guessed wrong. Your answer was "{previous_word}". Previous description: "{previous_description}". New description: "{description}". Guess the word by user descriptions. Answer with one word. 
"""


def get_completion_from_messages(messages,
                                 model="gpt-3.5-turbo",
                                 temperature=0.0,
                                 max_tokens=500):
    response = openai.ChatCompletion.create(
        model=model,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return response.choices[0].message["content"]


def ask_llm(message: str) -> str:
    messages = [
        {'role': 'system', 'content': message},
    ]
    return get_completion_from_messages(messages, temperature=0.2)


def guess(word: str, user_word: Optional[str] = None, previous: Optional[str] = None) -> bool:
    if previous is None:
        description = ask_llm(description_prompt(word))
    else:
        description = ask_llm(another_description_prompt(word, user_word, [previous]))
    print(f"Guess the word: {description}")
    answer = input().lower().strip()
    if answer == word:
        print("Right!")
    elif answer == "idk":
        print(f"The right answer is {word}.")
    elif answer == "change_rule":
        print("It's your turn to describe!")
        return True
    else:
        print("No, let's try again!")
        return guess(word, answer, description)
    return False


def describe(word: str, previous_sentence: Optional[str] = None, previous_word: Optional[str] = None) -> bool:
    print(f'Describe the word: "{word}"')
    description = input().lower().strip()
    if description == 'idk':
        return False
    if description == 'change_rule':
        print("It's your turn to guess!")
        return True
    if previous_word is None:
        answer = ask_llm(guess_prompt(description))
    else:
        answer = ask_llm(another_guess_prompt(description, previous_sentence, previous_word))
    answer = answer.lower().strip()
    print(f"I think it\'s {answer}.")
    if answer == word:
        print("That's right!")
    else:
        print("No, let's try again!")
        return describe(word, description, answer)
    return False


def run_alias():
    with open("dicts/words.txt", "r") as file:
        words = [w.strip() for w in file.readlines()]
    random.shuffle(words)
    should_guess = True
    for word in words:
        if should_guess:
            if guess(word):
                should_guess = False
        else:
            if describe(word):
                should_guess = True


if __name__ == '__main__':
    openai.api_key = os.environ['OPENAI_API_KEY']
    run_alias()
