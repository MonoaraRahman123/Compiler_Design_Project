...../**
 * Target Code Generator
 * Translates Optimized TAC into pseudo-assembly.
 */

class CodeGenerator {
  constructor(instructions) {
    this.instructions = instructions;
  }

  generate() {
    const assembly = [];

    for (const instr of this.instructions) {
      if (instr.op === '=') {
        assembly.push(`LOAD R1, ${instr.arg1}`);
        assembly.push(`STORE R1, ${instr.result}`);
      } else {
        assembly.push(`LOAD R1, ${instr.arg1}`);
        assembly.push(`LOAD R2, ${instr.arg2}`);
        
        let opCode = '';
        switch (instr.op) {
          case '+': opCode = 'ADD'; break;
          case '-': opCode = 'SUB'; break;
          case '*': opCode = 'MUL'; break;
          case '/': opCode = 'DIV'; break;
        }
        
        assembly.push(`${opCode} R1, R1, R2`);
        assembly.push(`STORE R1, ${instr.result}`);
      }
    }

    return assembly;
  }
}

module.exports = CodeGenerator;
