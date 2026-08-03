import React from "react";
import { Dumbbell, Cloud, TrendingUp } from "lucide-react";

export default function HeroSection() {
    return (
        <div className="max-w-xl space-y-6 my-auto text-white">

            {/* Refined Brand Pill Chip */}
            <div>
                <div className="w-fit inline-flex items-center gap-3.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl shadow-lg hover:border-white/20 transition-all duration-300">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                        <Dumbbell className="w-4 h-4 text-zinc-950" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <h2 className="text-xs font-black tracking-widest uppercase text-white leading-none">
                            GymPro
                        </h2>
                        <p className="text-[10px] text-zinc-400 tracking-wider mt-0.5 font-medium">
                            Workout Progress Tracker
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl xl:text-6xl font-bold tracking-tighter leading-[0.95] drop-shadow-sm">
                Track Strength.<br />
                <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
                    Break Records.
                </span>
            </h1>

            {/* Narrower Subtitle for Readability */}
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-md font-normal">
                Built for lifters who care about measurable progress. Log workouts, monitor personal records, and stay consistent over time.
            </p>

            {/* Feature Cards - Constrained Width & Soft Hover Interactions */}
            <div className="space-y-3 pt-2 max-w-[500px]">

                {/* Card 1 */}
                <div className="group flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20 hover:-translate-y-0.5 shadow-lg">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20 text-emerald-400 mt-0.5 transition-colors group-hover:bg-emerald-500/20">
                        <Cloud className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm text-white">Cloud Sync</h3>
                        <p className="text-xs text-zinc-400 mt-0.5">Securely access your workouts across every device.</p>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="group flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20 hover:-translate-y-0.5 shadow-lg">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20 text-emerald-400 mt-0.5 transition-colors group-hover:bg-emerald-500/20">
                        <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm text-white">Progress Analytics</h3>
                        <p className="text-xs text-zinc-400 mt-0.5">Track PRs, workout volume, and long-term strength growth.</p>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="group flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20 hover:-translate-y-0.5 shadow-lg">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20 text-emerald-400 mt-0.5 transition-colors group-hover:bg-emerald-500/20">
                        <Dumbbell className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm text-white">Workout Templates</h3>
                        <p className="text-xs text-zinc-400 mt-0.5">Build reusable Push, Pull, Legs, Upper/Lower, or custom routines.</p>
                    </div>
                </div>

            </div>

        </div>
    );
}