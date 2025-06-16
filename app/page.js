import { UserButton } from "@stackframe/stack";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden font-[family-name:var(--font-geist-sans)]">
      {/* Header Navigation */}
      <header className="w-full py-4 px-6 md:px-10 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center">
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/logo.svg"
              alt="Logoipsum"
              width={150}
              height={40}
              className="h-10 w-auto"
            />
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button
              asChild
              variant="default"
              className="rounded-full px-6"
              size="lg"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 md:px-10 py-16 md:py-24 mt-8">
        {/* Magic UI Badge */}
        <div className="mb-10">
          {/* <div className="inline-flex items-center rounded-full bg-[#FDF7F2]/80 px-3 py-1 text-sm border border-[#f3e6da]">
            <span className="mr-1">🪄</span>
            <span className="text-[#E9A87C] font-medium">
              Introducing Magic UI
            </span>
            <span className="ml-1">→</span>
          </div> */}
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8 max-w-5xl">
          <span>Revolutionize Learning with</span> <br />
          <span className="bg-gradient-to-r from-purple-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
            AI-Powered Voice Agent
          </span>
          <span className="inline-flex ml-3">
            <Image
              src="/lecture.png"
              alt="Microphone"
              width={50}
              height={50}
              className="object-contain mr-2"
            />
            <Image
              src="/language.png"
              alt="Books"
              width={50}
              height={50}
              className="object-contain"
            />
          </span>
        </h1>

        {/* Call to Action */}
        <div className="mt-10">
          <Button
            asChild
            variant="default"
            className="rounded-full text-lg px-8 py-6 h-auto"
            size="lg"
          >
            <Link href="/dashboard">Get Started!</Link>
          </Button>
        </div>
      </section>

      {/* App Preview Section */}
      <section className="w-full flex justify-center pb-20 px-6">
        <div className="relative max-w-4xl w-full">
          <div className="bg-gradient-to-b from-sky-50 to-white p-4 md:p-8 rounded-xl shadow-lg border border-gray-100">
            <Image
              src="/image.png"
              alt="AI Voice Agent Dashboard"
              width={1200}
              height={600}
              className="w-full h-auto rounded-lg shadow-sm"
              priority
            />
          </div>
        </div>
      </section>
    </div>
  );
}
