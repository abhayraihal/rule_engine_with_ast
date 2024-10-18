import React from 'react'
import CreateRule from './CreateRule'
import CombineRules from './CombineRules'
import EvaluateRule from './EvaluateRule'

function Hero() {
  return (
    <div className='flex flex-col items-center mx-40 gap-5'>
      <h1 className='font-extrabold text-[50px] text-center mt-5'
      >
        <span className='text-[#292929]'>Rule Engine with AST </span>
        </h1>
        
      <CreateRule/>
      <CombineRules/>
      <EvaluateRule/>
    </div>
  )
}

export default Hero