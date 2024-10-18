import React, { useState } from 'react';
import axios from 'axios';
import { Input } from '../input';
import { Button } from '../button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';  
  import { BsCopy } from "react-icons/bs";

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
            const response = await axios.post('http://localhost:5000/combine-rules', { "rules": rules });
            setCombinedAST(response.data.ast);
        } catch (error) {
            setCombinedAST(null);
            setError('Error! Please check your input.');
        }
    };
    
    const copyToClipboard = () => {
        navigator.clipboard.writeText(JSON.stringify(combinedAST, null, 2))
            .then(() => {
                alert('AST copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    };

    return (
        <Card style={{ width: '800px'}}>
            <CardHeader>
                <CardTitle>Combine Rules</CardTitle>
                <CardDescription>Combine multiple rules into a single AST.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    {rules.map((rule, index) => (
                        <Input
                            key={index}
                            type="text"
                            placeholder={`Rule ${index + 1}`}
                            value={rule}
                            onChange={(e) => handleRuleChange(index, e.target.value)}
                            required
                            className='m-2'
                        />
                    ))}
                </form>
            </CardContent>
            <CardFooter className='flex flex-row justify-center'>
                <Button className='mr-2' type="button" onClick={addRuleInput}>Add Another Rule</Button>
                <Button className='ml-2' type="submit" onClick={handleSubmit}>Combine Rules</Button>
            </CardFooter>
            {combinedAST && (
                <div className='flex flex-col items-center'>
                    <h3 className='text-1xl font-semibold pt-0 p-6'>Combined AST Representation</h3>
                    <div className='relative'>
                        <button 
                            onClick={copyToClipboard} 
                            className='absolute right-0.5 bg-white p-1 rounded shadow'
                        >
                            <BsCopy />
                        </button>
                        <pre className='p-6 pt-0'>{JSON.stringify(combinedAST, null, 2)}</pre>
                    </div>
                </div>
            )}
            {error && <p className="text-red-500 text-center py-3">{error}</p>}
        </Card>
    );
};

export default CombineRules;
