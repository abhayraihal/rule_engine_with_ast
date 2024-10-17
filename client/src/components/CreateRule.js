import React, { useState } from 'react';
import axios from 'axios';

const CreateRule = () => {
    const [ruleString, setRuleString] = useState('');
    const [ast, setAST] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await axios.post('http://localhost:5000/create-rule', { "rule" : ruleString });
            setAST(response.data.ast);
        } catch (error) {
            setError('Failed to create rule. Please check your input.');
        }
    };

    return (
        <div>
            <h2>Create Rule</h2>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    placeholder="Enter rule (e.g., age > 30 AND department = 'Sales')" 
                    value={ruleString} 
                    onChange={(e) => setRuleString(e.target.value)} 
                    required 
                />
                <button type="submit">Create Rule</button>
            </form>

            {ast && (
                <div>
                    <h3>AST Representation</h3>
                    <pre>{JSON.stringify(ast, null, 2)}</pre>
                </div>
            )}

            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default CreateRule;
