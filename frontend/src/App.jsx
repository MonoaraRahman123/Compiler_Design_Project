import React, { useState } from 'react';

function App() {
  const [code, setCode] = useState(`#include <iostream>
using namespace std;

int main() {
    int a = 10;
    int b = 20;
    int c = a + b;
    cout << "The sum of " << a << " and " << b << " is " << c << endl;
    return 0;
}`);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCompile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError('Failed to connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  const placeholderText = `#include <iostream>
using namespace std;

int main() {
    int a = 10;
    int b = 20;
    int c = a + b;
    cout << "The sum of " << a << " and " << b << " is " << c << endl;
    return 0;
}`;

  return (
    <div className="container">
      <header>
        <h1>Compiler Visualization</h1>
        <p>Input arithmetic expressions and see the compilation steps!</p>
      </header>

      <main className="main-content">
        <section className="editor-section">
          <h3>Source Code</h3>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={placeholderText}
          />
          <button onClick={handleCompile} disabled={loading}>
            {loading ? 'Compiling...' : 'Compile'}
          </button>
          {error && <div className="error">{error}</div>}
        </section>

        {result && (
          <section className="results-section">
            {/* Real Execution Output Panel */}
            <div className="phase">
              <h3>Execution Output</h3>
              <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>Output:</div>
              <pre 
                className="code-block" 
                style={{ 
                  backgroundColor: '#1e1e1e', 
                  color: (result.output && result.output.includes('Error:')) ? '#ff4d4d' : '#00ff00',
                  border: (result.output && result.output.includes('Error:')) ? '2px solid #ff4d4d' : 'none'
                }}
              >
                {result.output || 'No output generated.'}
              </pre>
            </div>

            <div className="phase">
              <h3>1. Lexical Analysis (Tokens)</h3>
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {result.tokens.map((t, i) => (
                    <tr key={i}>
                      <td>{t.type}</td>
                      <td>{t.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="phase">
              <h3>2. Syntax Analysis (AST)</h3>
              <pre className="code-block">
                {JSON.stringify(result.parseTree, null, 2)}
              </pre>
            </div>

            <div className="phase">
              <h3>3. Semantic Analysis (Symbol Table)</h3>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Scope</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {result.symbolTable.map((s, i) => (
                    <tr key={i}>
                      <td>{s.name}</td>
                      <td>{s.type}</td>
                      <td>{s.scope}</td>
                      <td>{s.value.toString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="phase">
              <h3>4. Intermediate Code (TAC)</h3>
              <div className="code-block">
                {result.intermediateCode.map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            </div>

            <div className="phase">
              <h3>5. Code Optimization (Constant Folding)</h3>
              <div className="code-block">
                {result.optimizedCode.map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            </div>

            <div className="phase">
              <h3>6. Target Code Generation (Assembly)</h3>
              <div className="code-block">
                {result.targetCode.map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
