/**
 * Lexical Analyzer (Tokenizer)
 * Converts source code string into an array of tokens.
 */

class Lexer {
  constructor(input) {
    this.input = input;
    this.tokens = [];
    this.cursor = 0;
  }

  tokenize() {
    const tokenSpec = [
      [/^\s+/, null],                
      [/^#include\s+<[a-zA-Z.]+>/, 'PREPROCESSOR'], // #include <iostream>
      [/^using\s+namespace\s+[a-zA-Z_]+;/, 'NAMESPACE'], // using namespace std;
      [/^(int|float|return|cout|endl)\b/, 'KEYWORD'],
      [/^[a-zA-Z_][a-zA-Z0-9_]*/, 'IDENTIFIER'], 
      [/^[0-9]+/, 'NUMBER'],          
      [/^"([^"\\]|\\.)*"/, 'STRING'],  // String literals
      [/^<<?/, 'OPERATOR'],           // << or <
      [/^=/, 'EQUALS'],               
      [/^\+/, 'PLUS'],                
      [/^-/, 'MINUS'],
      [/^\*/, 'MULTIPLY'],
      [/^\//, 'DIVIDE'],
      [/^\(/, 'LPAREN'],              
      [/^\)/, 'RPAREN'],
      [/^\{/, 'LBRACE'],              
      [/^\}/, 'RBRACE'],
      [/^;/, 'SEMICOLON'],            
    ];

    while (this.cursor < this.input.length) {
      const remainingInput = this.input.slice(this.cursor);
      let matched = false;

      for (const [regex, type] of tokenSpec) {
        const match = regex.exec(remainingInput);
        if (match) {
          const value = match[0];
          this.cursor += value.length;
          if (type) {
            this.tokens.push({ type, value });
          }
          matched = true;
          break;
        }
      }

      if (!matched) {
        throw new Error(`Unexpected character at position ${this.cursor}: ${this.input[this.cursor]}`);
      }
    }

    return this.tokens;
  }
}

module.exports = Lexer;
