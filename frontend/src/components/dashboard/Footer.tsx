import React from 'react';
import { IconType } from 'react-icons';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';

export default function Footer() {
    return (
        <footer className="px-8 py-6 bg-blue-200">
            <div className='flex items-start justify-between gap-4'>
                <div className='flex flex-col gap-4 mx-4 items-start'>
                    <div className='text-[1rem] font-medium'> Smart Event Photo Management Platform </div>
                    <div className='text-[0.8rem] font-medium'> Contact Us </div>
                    <div className='text-[0.8rem] font-medium'> Privacy Policy </div>
                </div>
                <div className='flex flex-col items-end gap-4'>
                    <div className='text-[0.8rem] font-medium'>Follow Us</div>
                    <div className='flex gap-4'>
                        <a href="https://www.facebook.com/YourPage" target="_blank" rel="noopener noreferrer" className='mx-2'>
                            <FaFacebookF size={18} />
                        </a>
                        <a href="https://www.twitter.com/YourProfile" target="_blank" rel="noopener noreferrer" className='mx-2'>
                            <FaInstagram size={18} />
                        </a>
                        <a href="https://www.instagram.com/YourProfile" target="_blank" rel="noopener noreferrer" className='mx-2'>
                            <FaTwitter size={18} />
                        </a>
                    </div>
                </div>
            </div>
            <div className='text-center m-4 text-[0.8rem]'>© {new Date().getFullYear()} Smart Event Photo Management Platform. All rights reserved.</div>
        </footer>
    );
}