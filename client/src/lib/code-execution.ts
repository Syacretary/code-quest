// Interface for code execution result
export interface CodeExecutionResult {
  output: string;
  success: boolean;
}

/**
 * Executes Python code using Judge0 API or falls back to simulated execution
 * @param code Python code to execute
 * @returns Promise resolving to execution output
 */
export async function executeCode(code: string): Promise<CodeExecutionResult> {
  try {
    // Try using Judge0 API if available
    const apiUrl = "https://judge0-ce.p.rapidapi.com/submissions";
    const apiKey = process.env.JUDGE0_API_KEY;
    
    if (apiKey) {
      // Use real Judge0 API
      const response = await fetch(`${apiUrl}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
        body: JSON.stringify({
          source_code: code,
          language_id: 71, // Python 3
          stdin: "",
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const submissionData = await response.json();
      const token = submissionData.token;
      
      // Wait for execution to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get results
      const resultResponse = await fetch(`${apiUrl}/${token}`, {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
      });
      
      if (!resultResponse.ok) {
        throw new Error(`API error: ${resultResponse.status}`);
      }
      
      const resultData = await resultResponse.json();
      
      return {
        output: resultData.stdout || resultData.stderr || "No output",
        success: resultData.status.id === 3, // 3 = Accepted
      };
    } else {
      // Fall back to simulated execution for simple Python code
      return simulateExecution(code);
    }
  } catch (error) {
    console.error("Code execution error:", error);
    
    // Fall back to simulated execution
    return simulateExecution(code);
  }
}

/**
 * Simulates Python code execution for simple cases
 * This is a fallback when the Judge0 API is not available
 * Only handles basic Python concepts for educational purposes
 */
function simulateExecution(code: string): CodeExecutionResult {
  let output = "";

  try {
    // Very basic simulation for simple Python concepts
    // This is just for demonstration, not a real Python interpreter
    
    // Handle print statements (most basic feature)
    const printRegex = /print\s*\((.*)\)/g;
    const printMatches = code.matchAll(printRegex);
    
    for (const match of printMatches) {
      if (match[1]) {
        // Very naive evaluation of print arguments
        const content = match[1].trim();
        
        // Handle string literals
        if ((content.startsWith('"') && content.endsWith('"')) || 
            (content.startsWith("'") && content.endsWith("'"))) {
          output += content.slice(1, -1) + "\n";
        } 
        // Handle simple arithmetic
        else if (/^[\d\s\+\-\*\/\(\)]+$/.test(content)) {
          try {
            // WARNING: eval is used here only for simple arithmetic in a controlled environment
            // This is NOT safe for real code execution but serves our educational demo
            const result = eval(content);
            output += result + "\n";
          } catch {
            output += "Error: Invalid arithmetic expression\n";
          }
        }
        // Default to assuming it's a variable (which we can't simulate properly)
        else {
          output += `[Simulated] Value of ${content}\n`;
        }
      }
    }
    
    // If no output was generated but code exists
    if (!output && code.trim()) {
      output = "[Code executed with no output]\n";
    }
    
    // Check for basic syntax errors
    if (countOccurrences(code, "(") !== countOccurrences(code, ")")) {
      throw new Error("SyntaxError: Mismatched parentheses");
    }
    
    if ((code.includes("'") && countOccurrences(code, "'") % 2 !== 0) ||
        (code.includes('"') && countOccurrences(code, '"') % 2 !== 0)) {
      throw new Error("SyntaxError: Unterminated string literal");
    }
    
    return {
      output: output || "Code executed successfully with no output",
      success: true,
    };
  } catch (error) {
    return {
      output: error instanceof Error ? error.message : String(error),
      success: false,
    };
  }
}

// Helper function to count occurrences of a character
function countOccurrences(str: string, char: string): number {
  return str.split(char).length - 1;
}
