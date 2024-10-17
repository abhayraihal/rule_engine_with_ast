import React from 'react';
import CreateRule from './components/CreateRule';
import CombineRules from './components/CombineRules';
import EvaluateRule from './components/EvaluateRule';
import './App.css';

function App() {
    return (
        <div className="App">
            <h1>Rule Engine</h1>
            <CreateRule />
            <hr />
            <CombineRules />
            <hr />
            <EvaluateRule />
        </div>
    );
}

export default App;
