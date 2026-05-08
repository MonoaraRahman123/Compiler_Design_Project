/**
 * Code Optimizer
 * Performs simple optimizations like Constant Folding.
 */

class Optimizer {
  constructor(instructions) {
    this.instructions = JSON.parse(JSON.stringify(instructions)); // Deep copy
    this.constants = {};
  }

  optimize() {
    const optimized = [];
    
    for (let instr of this.instructions) {
      // Substitute known constants
      if (typeof instr.arg1 === 'string' && this.constants[instr.arg1] !== undefined) {
        instr.arg1 = this.constants[instr.arg1];
      }
      if (typeof instr.arg2 === 'string' && this.constants[instr.arg2] !== undefined) {
        instr.arg2 = this.constants[instr.arg2];
      }

      // Constant Folding
      if (typeof instr.arg1 === 'number' && typeof instr.arg2 === 'number') {
        let result;
        switch (instr.op) {
          case '+': result = instr.arg1 + instr.arg2; break;
          case '-': result = instr.arg1 - instr.arg2; break;
          case '*': result = instr.arg1 * instr.arg2; break;
          case '/': result = instr.arg1 / instr.arg2; break;
        }
        if (result !== undefined) {
          this.constants[instr.result] = result;
          // We can replace this instruction with a simple assignment if we want,
          // or just track it for later instructions. 
          // For visualization, let's simplify it to an assignment.
          optimized.push({ op: '=', arg1: result, arg2: null, result: instr.result });
          continue;
        }
      }

      // Track assignments to constants
      if (instr.op === '=' && typeof instr.arg1 === 'number') {
        this.constants[instr.result] = instr.arg1;
      }

      optimized.push(instr);
    }

    return optimized;
  }
}

module.exports = Optimizer;
