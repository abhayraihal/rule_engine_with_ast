import React, { useState } from 'react';
import axios from 'axios';
import { Textarea } from '../textarea';
import { Button } from '../button';

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
                <Textarea
                    placeholder="Paste AST here"
                    value={ast}
                    onChange={(e) => setAST(e.target.value)}
                    required
                ></Textarea>

                <Textarea
                    placeholder="Enter JSON data"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    required
                ></Textarea>

                <Button type="submit">Evaluate</Button>
            </form>
            {result !== null && <p>Result: {result.toString()}</p>}
            {error && <p className="text-red-500">{error}</p>}
        </div>
    );
};

export default EvaluateRule;
