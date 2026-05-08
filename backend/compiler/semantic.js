/**
 * Semantic Analyzer
 * Checks for semantic errors and builds a Symbol Table.
 */

class SemanticAnalyzer {
  constructor(ast) {
    this.ast = ast;
    this.symbolTable = [];
    this.currentScope = 'Global';
  }

  analyze() {
    if (this.ast.type === 'Program') {
      this.ast.body.forEach(node => this.traverse(node));
    } else {
      this.traverse(this.ast);
    }
    return this.symbolTable;
  }

  traverse(node) {
    if (!node) return;

    if (node.type === 'FunctionDeclaration') {
      this.addToSymbolTable(node.name, 'Function', 'Global', node.returnType);
    } else if (node.type === 'Assignment') {
      const val = this.evaluateStatic(node.right);
      this.addToSymbolTable(node.left.value, 'Variable', this.currentScope, val);
      this.traverse(node.right);
    } else if (node.type === 'BinaryExpression') {
      this.traverse(node.left);
      this.traverse(node.right);
    } else if (node.type === 'Identifier') {
      this.addToSymbolTable(node.value, 'Variable', this.currentScope, 'unknown');
    }
  }

  evaluateStatic(node) {
    if (node.type === 'Literal') return node.value;
    if (node.type === 'Identifier') {
      const entry = this.symbolTable.find(e => e.name === node.value);
      return entry ? entry.value : 'unknown';
    }
    if (node.type === 'BinaryExpression') {
      const left = this.evaluateStatic(node.left);
      const right = this.evaluateStatic(node.right);
      if (typeof left === 'number' && typeof right === 'number') {
        switch (node.operator) {
          case '+': return left + right;
          case '-': return left - right;
          case '*': return left * right;
          case '/': return left / right;
        }
      }
    }
    return 'dynamic';
  }

  addToSymbolTable(name, type, scope, value) {
    let entry = this.symbolTable.find(entry => entry.name === name);
    if (!entry) {
      this.symbolTable.push({ name, type, scope, value });
    } else if (value !== 'unknown' && value !== 'dynamic') {
      entry.value = value;
    }
  }
}

module.exports = SemanticAnalyzer;
