/**
 * Intermediate Code Generator
 * Converts the AST into 3-Address Code (TAC).
 */

class IntermediateGenerator {
  constructor(ast) {
    this.ast = ast;
    this.instructions = [];
    this.tempCount = 0;
  }

  generate() {
    if (this.ast.type === 'Program') {
      this.ast.body.forEach(node => this.traverse(node));
    } else {
      this.traverse(this.ast);
    }
    return this.instructions;
  }

  newTemp() {
    return `t${++this.tempCount}`;
  }

  traverse(node) {
    if (node.type === 'Assignment') {
      const result = this.traverse(node.right);
      this.instructions.push({
        op: '=',
        arg1: result,
        arg2: null,
        result: node.left.value,
      });
      return node.left.value;
    }

    if (node.type === 'BinaryExpression') {
      const left = this.traverse(node.left);
      const right = this.traverse(node.right);
      const result = this.newTemp();
      this.instructions.push({
        op: node.operator,
        arg1: left,
        arg2: right,
        result: result,
      });
      return result;
    }

    if (node.type === 'Literal' || node.type === 'Identifier') {
      return node.value;
    }
  }

  static format(instructions) {
    return instructions.map(instr => {
      if (instr.op === '=') {
        return `${instr.result} = ${instr.arg1}`;
      }
      return `${instr.result} = ${instr.arg1} ${instr.op} ${instr.arg2}`;
    });
  }
}

module.exports = IntermediateGenerator;
