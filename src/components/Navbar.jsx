import React from 'react'
import { Button } from './ui/button'
import Link from 'next/link'
const Navbar = () => {

    return (
        <div className="bg-gray-800 shadow-lg sticky top-0 backdrop-blur-md bg-opacity-50 min-h-[60px] w-full z-50">
            <nav className="container mx-auto px-4">
                <div className='flex justify-between items-center h-[60px]'>
                    <Button asChild className='text-xl '>
                       <Link href='/'>
                           Loan Default Prediction
                        </Link>
                    </Button>
                </div>
                
            </nav>
            <div className='h-[0.75px] opacity-50 w-[90%] m-auto bg-white'></div>
        </div>
    )
}

export default Navbar