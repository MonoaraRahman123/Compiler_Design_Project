/**
 * Syntax Analyzer (Parser)
 * Builds an Abstract Syntax Tree (AST) from tokens.
 * Supports: assignment, addition, subtraction, multiplication, division, and grouping.
 */

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.cursor = 0;
  }

  peek() {
    return this.tokens[this.cursor];
  }

  eat(type) {
    const token = this.peek();
    if (token && token.type === type) {
      this.cursor++;
      return token;
    }
    throw new Error(`Expected token ${type}, but found ${token ? token.type : 'EOF'}`);
  }

  parse() {
    const body = [];
    while (this.cursor < this.tokens.length) {
      const token = this.peek();
      
      // Handle function definition: int main() { ... }
      if (token.type === 'KEYWORD' && token.value === 'int' && 
          this.tokens[this.cursor + 1]?.type === 'IDENTIFIER' && 
          this.tokens[this.cursor + 2]?.type === 'LPAREN') {
        
        this.eat('KEYWORD'); // int
        const funcName = this.eat('IDENTIFIER').value;
        this.eat('LPAREN');
        this.eat('RPAREN');
        
        body.push({
          type: 'FunctionDeclaration',
          name: funcName,
          returnType: 'int'
        });
        continue;
      }

      if (token.type === 'PREPROCESSOR' || token.type === 'NAMESPACE' || token.type === 'LBRACE' || token.type === 'RBRACE') {
        this.cursor++;
        continue;
      }
      
      // ... existing assignment logic ...
      if (token.type === 'KEYWORD' && token.value === 'int') {
        this.eat('KEYWORD');
      }
      try {
        if (this.peek().type === 'IDENTIFIER' && this.tokens[this.cursor + 1]?.type === 'EQUALS') {
          body.push(this.parseAssignment());
        } else {
          this.cursor++; 
        }
      } catch (e) {
        this.cursor++;
      }
    }
    return { type: 'Program', body };
  }

  // assignment: IDENTIFIER EQUALS expression SEMICOLON
  parseAssignment() {
    const id = this.eat('IDENTIFIER');
    this.eat('EQUALS');
    const expression = this.parseExpression();
    if (this.peek() && this.peek().type === 'SEMICOLON') {
      this.eat('SEMICOLON');
    }
    return {
      type: 'Assignment',
      left: { type: 'Identifier', value: id.value },
      right: expression,
    };
  }

  // expression: term ((PLUS | MINUS) term)*
  parseExpression() {
    let left = this.parseTerm();
    while (this.peek() && (this.peek().type === 'PLUS' || this.peek().type === 'MINUS')) {
      const operator = this.eat(this.peek().type).value;
      const right = this.parseTerm();
      left = {
        type: 'BinaryExpression',
        operator,
        left,
        right,
      };
    }
    return left;
  }

  // term: factor ((MULTIPLY | DIVIDE) factor)*
  parseTerm() {
    let left = this.parseFactor();
    while (this.peek() && (this.peek().type === 'MULTIPLY' || this.peek().type === 'DIVIDE')) {
      const operator = this.eat(this.peek().type).value;
      const right = this.parseFactor();
      left = {
        type: 'BinaryExpression',
        operator,
        left,
        right,
      };
    }
    return left;
  }

  // factor: NUMBER | IDENTIFIER | LPAREN expression RPAREN
  parseFactor() {
    const token = this.peek();
    if (token.type === 'NUMBER') {
      return { type: 'Literal', value: parseInt(this.eat('NUMBER').value) };
    }
    if (token.type === 'IDENTIFIER') {
      return { type: 'Identifier', value: this.eat('IDENTIFIER').value };
    }
    if (token.type === 'LPAREN') {
      this.eat('LPAREN');
      const expression = this.parseExpression();
      this.eat('RPAREN');
      return expression;
    }
    throw new Error(`Unexpected token in factor: ${token.type}`);
  }
}

module.exports = Parser;
