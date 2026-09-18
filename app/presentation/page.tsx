"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Phone, Bot, CheckCircle2, Zap, ArrowRight, ShieldAlert } from "lucide-react";

export default function PresentationPage() {
  return (
    <div className="min-h-screen bg-[#0b141a] text-slate-100 overflow-x-hidden font-sans">
      {/* Background Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#00a884] opacity-[0.1] blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-blue-600 opacity-[0.05] blur-[150px] rounded-full pointer-events-none z-0" />

      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 container mx-auto px-6 pt-32 pb-20 flex flex-col items-center text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00a884]/10 border border-[#00a884]/20 text-[#00a884] mb-8 font-medium text-sm">
          <Sparkles className="h-4 w-4" />
          <span>Unified Voice & Chat AI CRM</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          DynamicDetailing <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00a884] to-emerald-400">AI</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mb-12">
          Experience hyper-realistic Voice AI and native WhatsApp text flows. <br/>
          Powered by OmniDimension & n8n orchestration.
        </p>
      </motion.section>

      {/* Phase 1: Current Demo Setup */}
      <section className="relative z-10 py-24 border-t border-slate-800 bg-slate-900/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
              <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg text-2xl mr-2">Phase 1</span>
              Current Demo Setup
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Connecting a personal WhatsApp number via QR Code to bypass Meta Sandbox restrictions, allowing the AI to answer Voice Calls and Text Chats directly natively via OmniDimension.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Voice Deflection Scenario */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-[#111b21] p-8 rounded-3xl border border-slate-800 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <Phone className="h-6 w-6 text-blue-400" />
                <h3 className="text-2xl font-bold text-slate-200">Voice: Working-Hour Deflection</h3>
              </div>
              <p className="text-slate-400 mb-8 text-sm">
                Cost-Optimization Strategy: If a customer calls the AI directly during shop working hours, the AI refuses to engage in a long conversation to save bridging costs, and immediately defects.
              </p>
              
              <div className="space-y-4">
                <div className="bg-[#202c33] p-4 rounded-2xl rounded-bl-none max-w-[85%]">
                  <p className="text-sm text-slate-300">"Hello, I wanted to know the price for a Ceramic Coating."</p>
                  <span className="text-[10px] text-slate-500 mt-2 block">Customer • 10:30 AM (Working Hour)</span>
                </div>
                
                <div className="bg-blue-900/30 border border-blue-800/50 p-4 rounded-2xl rounded-br-none max-w-[85%] ml-auto text-right">
                  <p className="text-sm text-blue-100">"Thank you for calling DynamicDetailing. Please reach out to our human executive at 78936 86581 for immediate inquiries."</p>
                  <span className="text-[10px] text-blue-400 mt-2 block">AI Agent • *Hangs up immediately*</span>
                </div>
              </div>
            </motion.div>

            {/* Text Tanglish Mirroring Scenario */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-[#111b21] p-8 rounded-3xl border border-slate-800 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <Bot className="h-6 w-6 text-[#00a884]" />
                <h3 className="text-2xl font-bold text-slate-200">Text: Tanglish Language Mirroring</h3>
              </div>
              <p className="text-slate-400 mb-8 text-sm">
                The Text Engine strictly detects the script. If the user types in Tanglish, the AI drops robotic translations and responds in a highly natural, localized Tanglish dialect without filler words.
              </p>

              {/* WhatsApp Mockup */}
              <div className="bg-[#0b141a] rounded-xl p-4 shadow-inner border border-slate-800">
                <div className="bg-[#202c33] text-[#e9edef] p-3 rounded-xl mb-3 w-fit max-w-[85%]">
                  <p className="text-sm">Hi, shop open unda ippudu?</p>
                </div>
                <div className="bg-[#005c4b] text-[#e9edef] p-3 rounded-xl ml-auto w-fit max-w-[90%]">
                  <p className="text-sm">Hello! DynamicDetailing Studio nunchi Siri. Avunu andi, shop open undi. Em help kavali cheppandi!</p>
                  <span className="text-[10px] text-emerald-200/50 mt-1 block text-right">10:32 AM ✓✓</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Phase 2: Live Production Setup */}
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
              <span className="bg-[#00a884]/20 text-[#00a884] px-3 py-1 rounded-lg text-2xl mr-2">Phase 2</span>
              Live Production Setup
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Migrating to the direct Meta Cloud Business API. This unlocks official WhatsApp Interactive features like List Menus and Utility Templates to maximize booking conversions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Mockup 1: Interactive List Menu */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#111b21] p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col"
            >
              <h3 className="text-xl font-bold text-slate-200 mb-2">Interactive Menus</h3>
              <p className="text-xs text-slate-500 mb-6">Frictionless discovery using Meta's native List components.</p>
              
              <div className="bg-[#0b141a] rounded-xl p-3 shadow-inner border border-slate-800 flex-1 flex flex-col justify-end">
                <div className="bg-[#202c33] text-[#e9edef] p-2.5 rounded-xl mb-3 w-fit max-w-[85%]">
                  <p className="text-[13px]">Hi, what services do you offer?</p>
                </div>
                <div className="bg-[#005c4b] text-[#e9edef] rounded-xl ml-auto w-full overflow-hidden">
                  <div className="p-3">
                    <p className="text-[13px] mb-2">Hello! We offer premium car detailing services. Please choose below:</p>
                    <div className="border-l-4 border-[#00a884] pl-2 my-2 bg-[#00a884]/10 py-1">
                      <strong className="text-white text-[13px] block">Paint Protection Film (PPF)</strong>
                      <span className="text-[#aaa] text-[11px]">Keep your car looking brand new.</span>
                    </div>
                  </div>
                  <div className="bg-[#202c33] text-[#00a884] text-center p-2.5 border-t border-[#2a3942] font-bold text-[13px] cursor-pointer hover:bg-[#2a3942] transition-colors">
                    ☰ View Services Menu
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Mockup 2: Utility Booking Message */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-[#111b21] p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col"
            >
              <h3 className="text-xl font-bold text-slate-200 mb-2">Utility Templates</h3>
              <p className="text-xs text-slate-500 mb-6">Quick-reply buttons for immediate booking confirmations.</p>
              
              <div className="bg-[#0b141a] rounded-xl p-3 shadow-inner border border-slate-800 flex-1 flex flex-col justify-end">
                <div className="bg-[#202c33] text-[#e9edef] p-2.5 rounded-xl mb-3 w-fit max-w-[85%]">
                  <p className="text-[13px]">I would like to book a PPF session.</p>
                </div>
                <div className="bg-[#005c4b] text-[#e9edef] p-3 rounded-xl ml-auto w-fit max-w-[95%]">
                  <p className="text-[13px]">Great choice! PPF will perfectly protect your paint.<br/><br/>Our manager will call you shortly to confirm your slot.</p>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <div className="bg-[#202c33] text-red-400 rounded-full px-4 py-1.5 text-[12px] font-bold border border-[#2a3942]">Cancel</div>
                  <div className="bg-[#202c33] text-[#00a884] rounded-full px-4 py-1.5 text-[12px] font-bold border border-[#2a3942]">Call Me Now</div>
                </div>
              </div>
            </motion.div>

            {/* Mockup 3: Complaint Handling */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-[#111b21] p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col"
            >
              <h3 className="text-xl font-bold text-slate-200 mb-2">Complaint Handling</h3>
              <p className="text-xs text-slate-500 mb-6">Empathy-driven response logging silently to the dashboard.</p>
              
              <div className="bg-[#0b141a] rounded-xl p-3 shadow-inner border border-slate-800 flex-1 flex flex-col justify-end">
                <div className="bg-[#202c33] text-[#e9edef] p-2.5 rounded-xl mb-3 w-fit max-w-[90%]">
                  <p className="text-[13px]">The washing was very bad. I found swirl marks on my car. Worst service.</p>
                </div>
                <div className="bg-[#005c4b] text-[#e9edef] p-3 rounded-xl ml-auto w-fit max-w-[95%]">
                  <p className="text-[13px]">I am so sorry to hear that your experience wasn't up to the mark. I have noted this down and our senior manager will reach out to you immediately to resolve this.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Google Flow Video Mockups Section */}
      <section className="relative z-10 py-24 border-t border-slate-800 bg-[#0b141a]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
              <Sparkles className="text-purple-400 h-10 w-10" />
              Google Flow Video Mockups
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Visualizing the seamless user journeys and UI interactions generated via Google Flow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Video Mockup 1 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-video rounded-2xl bg-[#111b21] border border-slate-700 shadow-[0_0_40px_-10px_rgba(168,85,247,0.3)] flex items-center justify-center overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/20 to-blue-900/20 group-hover:scale-105 transition-transform duration-700" />
              <div className="text-center relative z-10">
                <div className="bg-purple-500/20 p-4 rounded-full inline-block mb-3 border border-purple-500/30">
                  <Sparkles className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-200">Customer Handoff Flow</h3>
                <p className="text-sm text-slate-400 mt-1">Google Flow Video Placeholder</p>
              </div>
            </motion.div>

            {/* Video Mockup 2 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative aspect-video rounded-2xl bg-[#111b21] border border-slate-700 shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)] flex items-center justify-center overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/20 to-teal-900/20 group-hover:scale-105 transition-transform duration-700" />
              <div className="text-center relative z-10">
                <div className="bg-[#00a884]/20 p-4 rounded-full inline-block mb-3 border border-[#00a884]/30">
                  <Sparkles className="h-6 w-6 text-[#00a884]" />
                </div>
                <h3 className="text-lg font-bold text-slate-200">Automated Booking Flow</h3>
                <p className="text-sm text-slate-400 mt-1">Google Flow Video Placeholder</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Orchestration Section */}
      <section className="relative z-10 py-24 border-t border-slate-800 bg-[#0f172a]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
              <Zap className="text-yellow-400 h-10 w-10" />
              CRM Orchestration
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              How n8n handles the AI's background webhooks and logic switches.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Handoffs Card */}
            <div className="bg-slate-800/40 p-10 rounded-[2rem] border border-slate-700 hover:border-[#00a884] transition-colors relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Phone className="h-32 w-32 text-[#00a884]" />
              </div>
              <h3 className="text-3xl font-bold text-[#00a884] mb-6 flex items-center gap-3">
                <ArrowRight className="h-6 w-6" /> HANDOFFS
              </h3>
              <p className="text-slate-400 mb-6 text-sm">When the AI promises a call-back to a lead inquiring about a service.</p>
              <ul className="space-y-4 text-slate-300">
                <li className="flex items-center gap-3">
                  <div className="bg-[#00a884]/20 p-1.5 rounded-full"><CheckCircle2 className="h-4 w-4 text-[#00a884]" /></div>
                  Logged instantly to Google Sheets database.
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-[#00a884]/20 p-1.5 rounded-full"><CheckCircle2 className="h-4 w-4 text-[#00a884]" /></div>
                  <strong className="text-white">Meta API sends immediate WhatsApp ping</strong> to the Manager's phone.
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-[#00a884]/20 p-1.5 rounded-full"><CheckCircle2 className="h-4 w-4 text-[#00a884]" /></div>
                  Status marked as "Action Required" on Next.js Dashboard.
                </li>
              </ul>
            </div>

            {/* Complaints Card */}
            <div className="bg-slate-800/40 p-10 rounded-[2rem] border border-slate-700 hover:border-red-400 transition-colors relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <ShieldAlert className="h-32 w-32 text-red-400" />
              </div>
              <h3 className="text-3xl font-bold text-red-400 mb-6 flex items-center gap-3">
                <ArrowRight className="h-6 w-6" /> COMPLAINTS
              </h3>
              <p className="text-slate-400 mb-6 text-sm">When the AI detects frustration, anger, or past service issues.</p>
              <ul className="space-y-4 text-slate-300">
                <li className="flex items-center gap-3">
                  <div className="bg-red-400/20 p-1.5 rounded-full"><CheckCircle2 className="h-4 w-4 text-red-400" /></div>
                  Logged instantly to Google Sheets database.
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-red-400/20 p-1.5 rounded-full"><CheckCircle2 className="h-4 w-4 text-red-400" /></div>
                  <strong className="text-white">Logged Silently.</strong> Does NOT buzz the manager's phone to prevent disruption.
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-red-400/20 p-1.5 rounded-full"><CheckCircle2 className="h-4 w-4 text-red-400" /></div>
                  Highlighted in <strong className="text-white">Red Flag</strong> on the Next.js Dashboard for scheduled review.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-600 border-t border-slate-800 text-sm">
        <p>&copy; 2026 DynamicDetailing AI CRM. Engineered with Next.js, n8n & OmniDimension.</p>
      </footer>
    </div>
  );
}
