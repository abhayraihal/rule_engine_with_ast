import React, { useState } from 'react';
import axios from 'axios';

const EvaluateRule = () => {
    const [ast, setAST] = useState('');
    const [data, setData] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await axios.post('http://localhost:5000/evaluate-rule', { "ast": JSON.parse(ast), "data": JSON.parse(data) });
            setResult(response.data.result);
        } catch (error) {
            setError('Failed to evaluate rule. Please check your input.');
        }
    };

    return (
        <div>
            <h2>Evaluate Rule</h2>
            <form onSubmit={handleSubmit}>
                <textarea
                    placeholder="Paste AST here"
                    value={ast}
                    onChange={(e) => setAST(e.target.value)}
                    required
                ></textarea>

                <textarea
                    placeholder="Enter JSON data"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    required
                ></textarea>

                <button type="submit">Evaluate</button>
            </form>

            {result !== null && <p>Result: {result.toString()}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default EvaluateRule;
