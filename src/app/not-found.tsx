import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="text-center max-w-md">
          <div className="text-8xl font-bold text-[#E6EBFF] mb-4 select-none">404</div>
          <h1 className="text-2xl font-bold text-[#001A80] mb-3">Page Not Found</h1>
          <p className="text-gray-500 mb-8">
            The page you&apos;re looking for doesn&apos;t exist or may have been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="bg-[#0033FF] hover:bg-[#001A80] text-white">
              <Link href="/">Return Home</Link>
            </Button>
            <Button asChild variant="outline" className="border-[#0033FF]/30 text-[#0033FF]">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
