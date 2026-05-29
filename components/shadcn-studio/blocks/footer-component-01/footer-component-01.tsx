import { FacebookIcon, InstagramIcon, LinkedinIcon, TwitterIcon, YoutubeIcon } from 'lucide-react'

import { Separator } from '@/components/ui/separator'

import Logo from '@/components/shadcn-studio/logo'

const Footer = () => {
  return (
    <footer>
      <div className='mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 max-md:flex-col sm:px-6 sm:py-6 md:gap-6 md:py-8'>
        <a href='https://ashoka.edu.in'>
          <div className='flex items-center gap-3'>
            <Logo className='gap-3' />
          </div>
        </a>

        <div className='flex items-center gap-5 whitespace-nowrap'>
          <a href='#' className='opacity-80 transition-opacity duration-300 hover:opacity-100'>
            About
          </a>
          <a href='#' className='opacity-80 transition-opacity duration-300 hover:opacity-100'>
            Feedback
          </a>
          <a href='/contact' className='opacity-80 transition-opacity duration-300 hover:opacity-100'>
            Contact
          </a>
          {/* <a href='#' className='opacity-80 transition-opacity duration-300 hover:opacity-100'>
            Career
          </a> */}
        </div>

        <div className='flex items-center gap-4'>
          <a href='https://www.linkedin.com/showcase/ashoka-university-career-development-office' target='_blank'>
            <LinkedinIcon className='size-5' />
          </a>
          <a href='https://www.instagram.com/placecomashoka/' target='_blank'>
            <InstagramIcon className='size-5' />
          </a>
          <a href='#'>
            <TwitterIcon className='size-5' />
          </a>
          <a href='#'>
            <YoutubeIcon className='size-5' />
          </a>
        </div>
      </div>

      <Separator />

      <div className='mx-auto flex max-w-7xl justify-center px-4 py-8 sm:px-6'>
        <p className='text-center font-medium text-sm md:text-base text-balance'>
          {`©${new Date().getFullYear()}`}{' '}
          <a href='https://ashoka.edu.in' className='hover:underline'>
            Connect Placement Committee, Ashoka University
          </a>
          <br />
          <span className='font-medium text-primary font-900'> Made by Ananya Karel, Anshika Chaudhry, Ibrahim Khalil, Soham Tulsyan, & Saransh Goel</span>
        </p>
      </div>
    </footer>
  )
}

export default Footer
