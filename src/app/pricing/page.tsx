"use client";

import Link from "next/link";
import { Zap, Check, Crown, Youtube, Headphones } from "lucide-react";
import { Header } from "@/components/Header";
import { SubscribeButton } from "@/components/SubscribeButton";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-swiftr-brand-light/20">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Start free and upgrade when you need more. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="glass-card p-8">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-6 w-6 text-swiftr-brand" />
              <h2 className="text-2xl font-bold text-slate-900">Free</h2>
            </div>
            <p className="text-4xl font-bold text-slate-900 mb-6">
              $0<span className="text-lg font-normal text-slate-600">/month</span>
            </p>

            <p className="text-sm text-slate-600 mb-6">
              Everything you need to boost your productivity with AI
            </p>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-slate-900">AI Chat Assistant</span>
                  <p className="text-xs text-slate-500">Ask questions and get instant answers</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-slate-900">PDF to Notes</span>
                  <p className="text-xs text-slate-500">Upload PDFs and get structured notes</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-slate-900">Audio & Lecture Notes</span>
                  <p className="text-xs text-slate-500">Record or upload audio for transcription</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-slate-900">Flashcards & Quizzes</span>
                  <p className="text-xs text-slate-500">Generate study materials from notes</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-slate-900">Document Editor</span>
                  <p className="text-xs text-slate-500">Rich text editor for your notes</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-slate-900">Folders & Organization</span>
                  <p className="text-xs text-slate-500">Keep your notes organized</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-slate-900">Sharing & Collaboration</span>
                  <p className="text-xs text-slate-500">Share notes with others</p>
                </div>
              </li>
            </ul>

            <Link href="/signup" className="btn-secondary w-full justify-center">
              Get Started Free
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="rounded-2xl border-2 border-swiftr-brand bg-white p-8 shadow-lg shadow-swiftr-brand/20 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-swiftr-brand text-white text-sm font-semibold px-4 py-1 rounded-full">
                POPULAR
              </span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-6 w-6 text-swiftr-brand" />
              <h2 className="text-2xl font-bold text-slate-900">Pro</h2>
            </div>
            <p className="text-4xl font-bold text-slate-900 mb-6">
              $5<span className="text-lg font-normal text-slate-600">/month</span>
            </p>

            <p className="text-sm text-slate-600 mb-6">
              Unlock YouTube and podcast features for content creators
            </p>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-slate-900">Everything in Free</span>
                  <p className="text-xs text-slate-500">All free features included</p>
                </div>
              </li>
              <li className="flex items-start gap-3 bg-swiftr-brand-light/50 -mx-2 px-2 py-2 rounded-lg">
                <Youtube className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-slate-900">YouTube to Notes</span>
                  <p className="text-xs text-slate-500">Convert any YouTube video into notes</p>
                </div>
              </li>
              <li className="flex items-start gap-3 bg-swiftr-brand-light/50 -mx-2 px-2 py-2 rounded-lg">
                <Headphones className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-slate-900">Podcast Transcripts</span>
                  <p className="text-xs text-slate-500">Transform podcasts into searchable text</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-slate-900">Unlimited Messages</span>
                  <p className="text-xs text-slate-500">No limits on AI chat usage</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-slate-900">Priority Support</span>
                  <p className="text-xs text-slate-500">Get help when you need it</p>
                </div>
              </li>
            </ul>

            <SubscribeButton label="Subscribe for $5/month" className="btn-primary w-full justify-center" />
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-semibold text-slate-900 mb-2">
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-sm text-slate-600">
                {`Yes! You can cancel your Pro subscription at any time. You'll continue to have access to Pro features until the end of your current billing period.`}
              </p>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-semibold text-slate-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-sm text-slate-600">
                We accept all major credit cards including Visa, Mastercard, and American Express through our secure payment partner Stripe.
              </p>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-semibold text-slate-900 mb-2">
                Is there a free trial for Pro?
              </h3>
              <p className="text-sm text-slate-600">
                {`While we don't offer a traditional free trial, you can use all free features indefinitely. Upgrade to Pro only when you need YouTube or podcast features.`}
              </p>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-semibold text-slate-900 mb-2">
                How does YouTube to notes work?
              </h3>
              <p className="text-sm text-slate-600">
                Simply paste any YouTube URL and our AI will analyze the video content, generate a transcript, and create organized study notes with key takeaways.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}