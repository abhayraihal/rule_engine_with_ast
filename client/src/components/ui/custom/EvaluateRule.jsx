import React, { useState } from 'react';
import axios from 'axios';
import { Textarea } from '../textarea';
import { Button } from '../button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';  

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
            setResult(null);
            setError('Error! Please check your input.');
        }
    };

    return (
        <Card style={{ width: '800px'}}>
            <CardHeader>
                <CardTitle>Evaluate Rule</CardTitle>
                <CardDescription>Evaluate a rule based on an AST and JSON data.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className='flex flex-col'>
                    <Textarea
                        placeholder="Paste AST here"
                        value={ast}
                        onChange={(e) => setAST(e.target.value)}
                        required
                        className='my-2'
                        style={{height: '150px'}}
                    ></Textarea>

                    <Textarea
                        placeholder="Enter JSON data: 
{
'age':45,
'salary':4500000
}"
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                        required
                        className='my-2'
                        style={{height: '150px'}}
                    ></Textarea>
                </form>
            </CardContent>
            <CardFooter className='justify-center'>
                <Button type="submit" onClick={handleSubmit}>Evaluate</Button>
            </CardFooter>
            {result !== null && <p className='p-6 pt-0 text-center'>Result: {result.toString()}</p>}
            {error && <p className="text-red-500 text-center py-3">{error}</p>}
        </Card>
    );
};

export default EvaluateRule;
