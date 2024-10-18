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
  } from "@/components/ui/card"  
import { BsCopy } from "react-icons/bs";

  const CreateRule = () => {
    const [ruleString, setRuleString] = useState('');
    const [ast, setAST] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const response = await axios.post('http://localhost:5000/create-rule', { "rule": ruleString });
            setAST(response.data.ast);
        } catch (error) {
            setAST(null);
            setError('Failed to create rule. Please check your input.');
        }
    };
    
    const copyToClipboard = () => {
        navigator.clipboard.writeText(JSON.stringify(ast, null, 2))
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
                <CardTitle>Create Rule</CardTitle>
                <CardDescription>Enter a rule to generate its AST representation.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <Input
                        type="text"
                        placeholder="Enter rule (e.g., age > 30 AND department = 'Sales')"
                        value={ruleString}
                        onChange={(e) => setRuleString(e.target.value)}
                        required
                    />
                </form>
            </CardContent>
            <CardFooter className='justify-center' >
                <Button type="submit" onClick={handleSubmit}>Create Rule</Button>
            </CardFooter>
            {ast && (
                <div className='flex flex-col items-center'>
                    <h3 className='text-1xl font-semibold pt-0 p-6'>AST Representation</h3>
                    <div className='relative'>
                        <button 
                            onClick={copyToClipboard} 
                            className='absolute right-0.5 bg-white p-1 rounded shadow'
                        >
                            <BsCopy />
                        </button>
                        <pre className='p-6 pt-0'>{JSON.stringify(ast, null, 2)}</pre>
                    </div>
                </div>
            )}
            {error && <p className="text-red-500 text-center py-3">{error}</p>}
        </Card>
    );
};

export default CreateRule;
