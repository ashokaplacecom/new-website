import { InstagramIcon, LinkedinIcon, TwitterIcon, MailIcon } from 'lucide-react'

import { Separator } from '@/components/ui/separator'

import Logo from '@/components/shadcn-studio/logo'

const Footer = () => {
  return (
    <footer>
      <div className='mx-auto flex max-w-7xl items-center justify-between gap-3 px-0 py-4 max-md:flex-col sm:px-2 sm:py-6 md:gap-6 md:py-8'>
        <div className='flex flex-1 items-center justify-start gap-3 pl-4 md:pl-0'>
          <Logo className='gap-2 [&>img]:h-6 [&>span]:text-lg' />
        </div>

        <div className='flex flex-1 items-center justify-center gap-5 whitespace-nowrap'>
          <a href='/about' className='opacity-80 transition-opacity duration-300 hover:opacity-100'>
            About
          </a>
          <a href='/contact' className='opacity-80 transition-opacity duration-300 hover:opacity-100'>
            Feedback
          </a>
          <a href='/contact' className='opacity-80 transition-opacity duration-300 hover:opacity-100'>
            Contact
          </a>
        </div>

        <div className='flex flex-1 items-center justify-end gap-4 pr-4 md:pr-0'>
          <a href='https://www.linkedin.com/showcase/ashoka-university-career-development-office' target='_blank' className='transition-transform hover:scale-110'>
            <LinkedinIcon className='size-5 text-[#0077b5]' />
          </a>
          <a href='https://www.instagram.com/placecomashoka/' target='_blank' className='transition-transform hover:scale-110'>
            <InstagramIcon className='size-5 text-[#E1306C]' />
          </a>
          <a href='https://mail.google.com/mail/?extsrc=mailto&url=mailto%3Aconnect.placecom%40ashoka.edu.in' target='_blank' rel='noopener noreferrer' className='transition-transform hover:scale-110'>
            <MailIcon className='size-5 text-[#D14836]' />
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
          <span className='font-medium text-primary font-900'> Made by Ananya Karel, Anshika Chaudhry, Ibrahim Khalil, Saransh Goel, & Soham Tulsyan</span>
        </p>
      </div>
    </footer>
  )
}

export default Footer
