import React, { useState } from 'react';
import axios from 'axios';

const CombineRules = () => {
    const [rules, setRules] = useState(['']);
    const [combinedAST, setCombinedAST] = useState(null);
    const [error, setError] = useState(null);

    const handleRuleChange = (index, value) => {
        const newRules = [...rules];
        newRules[index] = value;
        setRules(newRules);
    };

    const addRuleInput = () => setRules([...rules, '']);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await axios.post('http://localhost:5000/combine-rules', { "rules" : rules });
            setCombinedAST(response.data.combinedAST);
        } catch (error) {
            setError('Failed to combine rules. Please check your input.');
        }
    };

    return (
        <div>
            <h2>Combine Rules</h2>
            <form onSubmit={handleSubmit}>
                {rules.map((rule, index) => (
                    <input
                        key={index}
                        type="text"
                        placeholder={`Rule ${index + 1}`}
                        value={rule}
                        onChange={(e) => handleRuleChange(index, e.target.value)}
                        required
                    />
                ))}
                <button type="button" onClick={addRuleInput}>Add Another Rule</button>
                <button type="submit">Combine Rules</button>
            </form>

            {combinedAST && (
                <div>
                    <h3>Combined AST Representation</h3>
                    <pre>{JSON.stringify(combinedAST, null, 2)}</pre>
                </div>
            )}

            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default CombineRules;
