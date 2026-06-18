'use client';

import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  name?: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content:
        "You are a local developer agent. You have tools to manage files in your workspace. IMPORTANT: Always use simple relative filenames (e.g., 'reverse.py') for the path parameter. NEVER use absolute windows paths starting with C:\\ or system folders.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const visibleMessages = messages.filter((m) => m.role !== 'system');

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8001/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) throw new Error('Failed to connect to agent backend.');

      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Error: Could not reach the local agent server.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070b12] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.22),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(56,189,248,0.16),_transparent_30%),linear-gradient(180deg,_rgba(255,255,255,0.04),_transparent_24%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="mb-4 rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-emerald-200">
                Live workspace
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Local Agent Control Room
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  A command deck for steering the workspace, reviewing tool activity, and shaping code with fewer interruptions.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-3">
                <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Mode</div>
                <div className="mt-1 text-sm font-medium text-white">Interactive</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-3">
                <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Context</div>
                <div className="mt-1 text-sm font-medium text-white">Workspace aware</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-3">
                <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Tools</div>
                <div className="mt-1 text-sm font-medium text-white">File ops ready</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-3">
                <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">State</div>
                <div className="mt-1 text-sm font-medium text-white">{loading ? 'Processing' : 'Idle'}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid flex-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="hidden rounded-[1.75rem] border border-white/10 bg-white/5 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl lg:flex lg:flex-col">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Mission panels</div>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/10 p-4">
                <div className="text-sm font-medium text-emerald-100">Ask the agent</div>
                <p className="mt-1 text-sm leading-6 text-slate-300">
                  Use plain language to request edits, inspections, or file creation.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <div className="text-sm font-medium text-white">Tool trace</div>
                <p className="mt-1 text-sm leading-6 text-slate-300">
                  Tool calls appear inline so the conversation doubles as an audit trail.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <div className="text-sm font-medium text-white">Prompt shape</div>
                <p className="mt-1 text-sm leading-6 text-slate-300">
                  Keep filenames relative and the agent can work inside this workspace cleanly.
                </p>
              </div>
            </div>

            <div className="mt-auto rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950 to-slate-900 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Quick moves</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {['Inspect workspace', 'Refine UI', 'Fix a bug', 'Generate file'].map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </aside>

          <section className="flex min-h-0 flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="border-b border-white/10 px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                    Conversation stream
                  </div>
                  <p className="mt-1 text-sm text-slate-300">
                    Direct requests, tool events, and agent responses in one timeline.
                  </p>
                </div>
                <div className="hidden rounded-full border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-300 sm:block">
                  {visibleMessages.length} events logged
                </div>
              </div>
            </div>

            <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
              <div className="space-y-4">
                {visibleMessages.map((msg, index) => {
                  if (msg.role === 'tool') {
                    return (
                      <div
                        key={index}
                        className="rounded-2xl border border-cyan-400/15 bg-cyan-400/10 px-4 py-3 text-xs font-mono text-cyan-100"
                      >
                        <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-cyan-200/80">
                          <span className="inline-block h-2 w-2 rounded-full bg-cyan-300" />
                          Tool executed {msg.name ? `[${msg.name}]` : ''}
                        </div>
                        <p className="whitespace-pre-wrap leading-5 text-cyan-50/90">
                          {msg.content.slice(0, 180)}
                          {msg.content.length > 180 ? '...' : ''}
                        </p>
                      </div>
                    );
                  }

                  const isUser = msg.role === 'user';

                  return (
                    <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[min(42rem,100%)] rounded-[1.5rem] border px-4 py-4 sm:px-5 ${
                          isUser
                            ? 'border-emerald-400/20 bg-gradient-to-br from-emerald-400 to-emerald-500 text-slate-950 shadow-[0_18px_50px_rgba(16,185,129,0.25)]'
                            : 'border-white/10 bg-slate-950/60 text-slate-100'
                        }`}
                      >
                        <div className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] ${isUser ? 'text-emerald-950/70' : 'text-slate-400'}`}>
                          {isUser ? 'You' : 'Agent'}
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-6">{msg.content}</p>
                      </div>
                    </div>
                  );
                })}
                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 px-4 py-4 text-sm text-slate-300">
                      <div className="flex items-center gap-3">
                        <span className="relative flex h-3 w-3">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                          <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-300" />
                        </span>
                        Agent is reasoning through the workspace...
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </main>

            <footer className="border-t border-white/10 bg-slate-950/55 px-4 py-4 sm:px-6">
              <form onSubmit={sendMessage} className="flex flex-col gap-3 md:flex-row md:items-end">
                <label className="flex-1">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Command
                  </span>
                  <input
                    type="text"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60 focus:bg-white/8"
                    placeholder="Ask the agent to build, inspect, or revise something in the workspace..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={loading}
                  />
                </label>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                  disabled={loading}
                >
                  Send command
                </button>
              </form>
            </footer>
          </section>
        </div>
      </div>
    </div>
  );
}
