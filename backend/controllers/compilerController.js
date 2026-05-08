const Lexer = require('../compiler/lexer');
const Parser = require('../compiler/parser');
const SemanticAnalyzer = require('../compiler/semantic');
const IntermediateGenerator = require('../compiler/intermediate');
const Optimizer = require('../compiler/optimizer');
const CodeGenerator = require('../compiler/codegen');

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

exports.compile = (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'No code provided' });
    }

    // --- 1. Real Compilation/Execution using MinGW ---
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    
    const cppFile = path.join(tempDir, 'program.cpp');
    const exeFile = path.join(tempDir, 'program.exe');
    
    fs.writeFileSync(cppFile, code);

    // Compile using g++
    exec(`g++ "${cppFile}" -o "${exeFile}"`, (compileErr, stdout, stderr) => {
      let programOutput = '';
      
      if (compileErr) {
        programOutput = `Compilation Error:\n${stderr}`;
        return finishResponse(programOutput);
      }

      // Run the compiled executable
      exec(`"${exeFile}"`, (runErr, runStdout, runStderr) => {
        if (runErr) {
          programOutput = `Runtime Error:\n${runStderr}`;
        } else {
          programOutput = runStdout;
        }
        finishResponse(programOutput);
      });
    });

    function finishResponse(output) {
      try {
        // --- 2. Internal Visualization Phases ---
        // Lexical Analysis
        const lexer = new Lexer(code);
        const tokens = lexer.tokenize();

        // Syntax Analysis
        const parser = new Parser(tokens);
        const parseTree = parser.parse();

        // Semantic Analysis
        const semantic = new SemanticAnalyzer(parseTree);
        const symbolTable = semantic.analyze();

        // Intermediate Code Generation
        const irGen = new IntermediateGenerator(parseTree);
        const tacInstructions = irGen.generate();
        const intermediateCode = IntermediateGenerator.format(tacInstructions);

        // Optimization
        const optimizer = new Optimizer(tacInstructions);
        const optimizedInstructions = optimizer.optimize();
        const optimizedCode = IntermediateGenerator.format(optimizedInstructions);

        // Target Code Generation
        const codegen = new CodeGenerator(optimizedInstructions);
        const targetCode = codegen.generate();

        res.json({
          tokens,
          parseTree,
          symbolTable,
          intermediateCode,
          optimizedCode,
          targetCode,
          output // Real C++ execution output
        });
      } catch (innerError) {
        res.json({ tokens: [], parseTree: {}, symbolTable: [], intermediateCode: [], optimizedCode: [], targetCode: [], output: `Visualization failed: ${innerError.message}. Code output: ${output}` });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
