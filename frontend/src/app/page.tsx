import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { About } from "@/components/landing/about"
import { Pricing } from "@/components/landing/pricing"
import { Contact } from "@/components/landing/contact"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <Features />
        <About />
        <Pricing />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
