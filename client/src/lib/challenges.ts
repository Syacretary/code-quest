// Interface for Python challenges
export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: "variables" | "control_flow" | "loops" | "functions" | "data_structures";
  example?: string;
  starterCode: string;
  solution: string;
  experienceReward: number;
  validateFn: (output: string) => boolean;
}

export const challenges: Challenge[] = [
  {
    id: "python-hello-world",
    title: "Hello, Coder!",
    description: "Welcome to Python! Let's start with the classic beginner task - printing a message to the screen. Write a program that prints 'Hello, Code Quest!'",
    difficulty: "beginner",
    category: "variables",
    starterCode: "# Write your code below\n\n",
    solution: "print('Hello, Code Quest!')",
    experienceReward: 10,
    validateFn: (output) => {
      return output.includes("Hello, Code Quest!");
    }
  },
  {
    id: "python-variables",
    title: "Character Stats",
    description: "Create variables for a character's name, level, and health points. Then print them in a formatted message.",
    difficulty: "beginner",
    category: "variables",
    example: "Example output:\nHero Name: Pythoria\nLevel: 5\nHP: 100",
    starterCode: "# Create variables for name, level, and health\n# Then print them in a formatted message\n\n",
    solution: "name = 'Pythoria'\nlevel = 5\nhealth = 100\n\nprint('Hero Name:', name)\nprint('Level:', level)\nprint('HP:', health)",
    experienceReward: 15,
    validateFn: (output) => {
      return output.includes("Hero Name:") && 
             output.includes("Level:") && 
             output.includes("HP:");
    }
  },
  {
    id: "python-conditionals",
    title: "Treasure Chest",
    description: "You found a treasure chest! Write a program that decides if it's safe to open based on its color. If the chest is 'red', print 'Danger! Do not open!'. If it's 'green', print 'Safe to open!'. For any other color, print 'Approach with caution.'",
    difficulty: "beginner",
    category: "control_flow",
    example: "For chest_color = 'red'\nOutput: Danger! Do not open!",
    starterCode: "chest_color = 'red'\n\n# Write your code below\n",
    solution: "chest_color = 'red'\n\nif chest_color == 'red':\n    print('Danger! Do not open!')\nelif chest_color == 'green':\n    print('Safe to open!')\nelse:\n    print('Approach with caution.')",
    experienceReward: 20,
    validateFn: (output) => {
      return output.includes("Danger! Do not open!");
    }
  },
  {
    id: "python-loops",
    title: "Magic Countdown",
    description: "Create a magical countdown! Write a program that counts down from 10 to 1, and then prints 'Spell Activated!'",
    difficulty: "beginner",
    category: "loops",
    starterCode: "# Create a countdown from 10 to 1\n# Then print 'Spell Activated!'\n\n",
    solution: "for i in range(10, 0, -1):\n    print(i)\nprint('Spell Activated!')",
    experienceReward: 25,
    validateFn: (output) => {
      return output.includes("10") && 
             output.includes("5") && 
             output.includes("1") && 
             output.includes("Spell Activated!");
    }
  },
  {
    id: "python-functions",
    title: "Power Calculator",
    description: "Create a function called 'calculate_power' that takes two arguments: 'base' and 'exponent'. The function should return the result of raising the base to the exponent power. Then call your function with base=2 and exponent=3, and print the result.",
    difficulty: "intermediate",
    category: "functions",
    example: "For base=2 and exponent=3\nOutput: 8",
    starterCode: "# Define your function here\n\n\n# Call your function with base=2 and exponent=3\n",
    solution: "def calculate_power(base, exponent):\n    return base ** exponent\n\nresult = calculate_power(2, 3)\nprint(result)",
    experienceReward: 30,
    validateFn: (output) => {
      return output.includes("8");
    }
  }
];
