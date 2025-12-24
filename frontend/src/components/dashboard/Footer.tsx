import React from 'react';

export default function Footer() {
    return (
        <footer className="flex flex-col items-center justify-center gap-8 p-4 bg-[#f5f5f5]">
            <div className='flex items-center justify-center gap-4'>
                <div className='flex flex-col items-start justify-center gap-4'>
                    <div className='text-[0.8rem] font-medium'> Smart Event Photo Management Platform </div>
                    <div className='text-[0.8rem] font-medium'> Contact Us </div>
                    <div className='text-[0.8rem] font-medium'> Privacy Policy </div>
                </div>
                <div className='flex flex-col items-start justify-center gap-4'>
                    <div className='text-[0.8rem] font-medium'>Follow Us</div>
                    <div className='flex justify-center items-center'>
                        <a href="https://www.facebook.com/YourPage" target="_blank" rel="noopener noreferrer" className='mx-2'>
                            <img src="/icons/facebook.svg" alt="Facebook" className='w-6 h-6' />
                        </a>
                        <a href="https://www.twitter.com/YourProfile" target="_blank" rel="noopener noreferrer" className='mx-2'>
                            <img src="/icons/twitter.svg" alt="Twitter" className='w-6 h-6' />
                        </a>
                        <a href="https://www.instagram.com/YourProfile" target="_blank" rel="noopener noreferrer" className='mx-2'>
                            <img src="/icons/instagram.svg" alt="Instagram" className='w-6 h-6' />
                        </a>
                    </div>
                </div>

            </div>
            <div className='text-center m-4 text-[0.8rem]'>© {new Date().getFullYear()} Smart Event Photo Management Platform. All rights reserved.</div>
        </footer>
    );
}