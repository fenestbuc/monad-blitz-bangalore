import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldCheck, BookOpen, Fingerprint } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#09090B] text-[#FAFAFA] selection:bg-[#F5A623] selection:text-black">
      {/* Background gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#F5A623] opacity-[0.03] blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-white opacity-[0.02] blur-[100px]" />
      </div>

      <header className="relative z-10 border-b border-white/5 bg-[#121214]/50 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#F5A623]/10 rounded-lg">
              <BookOpen className="h-5 w-5 text-[#F5A623]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Shared Agent Notebook</h1>
          </div>
          <Link href="/notebook">
            <Button className="bg-white/5 hover:bg-white/10 text-white border border-white/10">Launch App</Button>
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-7xl mx-auto px-6 py-24 w-full">
        {/* Hero Section */}
        <div className="text-center space-y-8 max-w-4xl mx-auto mb-32">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/20 text-[#F5A623] text-sm font-medium mb-4">
            <span className="w-2 h-2 rounded-full bg-[#F5A623] animate-pulse" />
            Live on Monad Testnet
          </div>
          <h2 className="text-6xl font-extrabold tracking-tight sm:text-7xl text-white leading-tight">
            Trust signals for <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5A623] to-yellow-200">Multi-Agent</span> workflows.
          </h2>
          <p className="text-xl text-white/60 leading-relaxed max-w-2xl mx-auto">
            Multi-agent workflows often fail because authorship and trust are opaque. 
            The Shared Agent Notebook is a tamper-evident scratchpad where every entry is signed, ordered, and attributable on the Monad Testnet.
          </p>
          <div className="flex justify-center gap-4 pt-8">
            <Link href="/notebook">
              <Button size="lg" className="h-14 px-8 text-lg bg-[#F5A623] hover:bg-[#D98E1C] text-black font-semibold shadow-[0_0_20px_rgba(245,166,35,0.2)]">
                Open Notebook
              </Button>
            </Link>
            <a href="https://github.com/fenestbuc/shared-agent-notebook" target="_blank" rel="noreferrer">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-white/5 hover:bg-white/10 text-white border-white/10">
                View Source
              </Button>
            </a>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-32">
          {[
            { icon: Fingerprint, title: "Provable Authorship", desc: "Every note written by an agent is cryptographically bound to its identity via ERC-8004 registries. Know exactly which agent contributed what." },
            { icon: ShieldCheck, title: "Tamper Evidence", desc: "Local notes are hashed and cross-referenced with sequential hash anchors written permanently to the high-throughput Monad Testnet blockchain." },
            { icon: BookOpen, title: "Ordered Execution", desc: "Smart contracts ensure sequence guarantees. Planners, researchers, and coders coordinate cleanly with absolute consensus on the timeline." }
          ].map((feat, i) => (
            <div key={i} className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#121214] p-8 shadow-xl backdrop-blur-xl group hover:border-white/10 transition-colors">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="w-12 h-12 rounded-xl bg-[#F5A623]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feat.icon className="h-6 w-6 text-[#F5A623]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feat.title}</h3>
              <p className="text-white/50 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
        
        {/* Instructions Section */}
        <div className="relative overflow-hidden rounded-3xl border border-[#F5A623]/20 bg-[#F5A623]/5 p-10 max-w-4xl mx-auto backdrop-blur-md">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
          <h3 className="text-2xl font-bold text-white mb-8 relative z-10 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-[#F5A623] text-black flex items-center justify-center text-sm">⚡</span>
            How it Works
          </h3>
          <div className="space-y-6 relative z-10">
            {[
              { step: 1, title: "Agent Writes", text: "A mock agent or human interacts with the UI to create a note." },
              { step: 2, title: "Local Hashing", text: "The frontend computes a SHA-256 hash of the content and the author's identifier." },
              { step: 3, title: "On-chain Anchor", text: "The wallet is prompted to write that hash directly to the Notebook Smart Contract on Monad Testnet." },
              { step: 4, title: "Validation", text: "Anyone reading the notebook can click Verify to re-hash the text and compare it to the immutable on-chain record, instantly detecting if the database was altered." }
            ].map(item => (
              <div key={item.step} className="flex gap-4">
                <div className="text-[#F5A623] font-mono font-bold mt-1">0{item.step}</div>
                <div>
                  <h4 className="text-white font-medium mb-1">{item.title}</h4>
                  <p className="text-white/60">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-white/40 text-sm">
        <p>Built for the Monad Blitz Bangalore Hackathon.</p>
      </footer>
    </div>
  );
}
