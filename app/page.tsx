import { Activity, Server, Bell, Shield, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/30">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              DS
            </div>
            <span className="text-xl font-bold tracking-tight">Divloo Store</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-foreground transition-colors">
              Log in
            </Link>
            <Link 
              href="/signup" 
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 lg:py-32 xl:py-48">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
          <div className="container relative mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center text-center space-y-8">
              <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                Server Monitoring v2.0 is Live
              </div>
              <div className="space-y-4 max-w-4xl">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                  Monitor Your Servers with{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
                    Absolute Precision
                  </span>
                </h1>
                <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Real-time insights, proactive alerts, and comprehensive analytics for your entire infrastructure. Ensure perfect uptime and performance.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link 
                  href="/dashboard" 
                  className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-base font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 gap-2"
                >
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
                <Link 
                  href="#features" 
                  className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-8 text-base font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  View Features
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-muted/40">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Everything you need to stay online</h2>
              <p className="max-w-[85%] text-muted-foreground sm:text-lg">
                Powerful tools designed to keep your servers running smoothly and your team informed.
              </p>
            </div>
            <div className="mx-auto grid justify-center gap-8 sm:grid-cols-2 md:max-w-[64rem] lg:grid-cols-3 pt-12">
              <div className="relative overflow-hidden rounded-lg border bg-background p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50 group">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4 group-hover:scale-110 transition-transform">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">Real-time Metrics</h3>
                <p className="text-sm text-muted-foreground">Monitor CPU, memory, and network usage with millisecond precision.</p>
              </div>
              <div className="relative overflow-hidden rounded-lg border bg-background p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50 group">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 mb-4 group-hover:scale-110 transition-transform">
                  <Server className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="font-bold mb-2">Infrastructure Overview</h3>
                <p className="text-sm text-muted-foreground">See all your servers in one place with our comprehensive dashboard.</p>
              </div>
              <div className="relative overflow-hidden rounded-lg border bg-background p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50 group">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10 mb-4 group-hover:scale-110 transition-transform">
                  <Bell className="h-6 w-6 text-yellow-500" />
                </div>
                <h3 className="font-bold mb-2">Smart Alerts</h3>
                <p className="text-sm text-muted-foreground">Get notified instantly when things go wrong via Email, Slack, or SMS.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5"></div>
          <div className="container relative mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center text-center space-y-8">
              <Shield className="h-16 w-16 text-primary mb-2 opacity-80" />
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Ready to secure your infrastructure?</h2>
              <p className="text-muted-foreground sm:text-lg max-w-[600px]">
                Join thousands of developers who trust Divloo Store Server Monitoring for their mission-critical applications.
              </p>
              <ul className="grid gap-2 sm:grid-cols-2 text-sm text-left mx-auto max-w-md w-full mb-6">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> 14-day free trial</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> No credit card required</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Cancel anytime</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> 24/7 support</li>
              </ul>
              <Link 
                href="/signup" 
                className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-base font-medium text-primary-foreground shadow transition-all hover:scale-105"
              >
                Start Your Free Trial
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4 md:px-6">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; {new Date().getFullYear()} Divloo Store Server Monitoring. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/contact" className="hover:text-foreground">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
