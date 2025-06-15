"use client";

import { ArrowRight, Zap, Globe, Shield } from "lucide-react";
import { AnimatedGradientText } from "./ui/animated-gradient-text";
import { ShimmerButton } from "./ui/shimmer-button";
import { NumberTicker } from "./ui/number-ticker";
import { GridPattern } from "./ui/grid-pattern";
import { TextAnimate } from "./ui/text-animate";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Hero() {
  const [animationKey, setAnimationKey] = useState(0);
  // Force animation retrigger when component mounts
  useEffect(() => {
    setAnimationKey((prev) => prev + 1);
  }, []);
  const router = useRouter();

  return (
    <section className="relative pt-32 pb-20 bg-white overflow-hidden">
      {/* Grid Pattern Background */}
      <GridPattern
        width={60}
        height={60}
        x={-1}
        y={-1}
        className="absolute inset-0 h-full w-full fill-gray-400/20 stroke-gray-400/20 [mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium text-gray-700 mb-8">
            <Zap className="w-4 h-4 mr-2 text-black" />
            Modern Cloud-Native Deployment Platform
          </div>{" "}
          {/* Main Heading with Animation */}
          <TextAnimate
            key={`main-heading-${animationKey}`}
            animation="blurInUp"
            by="word"
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-black leading-tight tracking-tight"
            as="h1"
            startOnView={false}
          >
            Deploy Any Web App
          </TextAnimate>{" "}
          <AnimatedGradientText
            key={`gradient-text-${animationKey}`}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-8"
            colorFrom="#4f46e5"
            colorTo="#7c3aed"
            speed={0.8}
          >
            In Seconds
          </AnimatedGradientText>{" "}
          {/* Subtitle */}
          <TextAnimate
            key={`subtitle-${animationKey}`}
            animation="fadeIn"
            by="word"
            delay={0.5}
            className="text-sm sm:text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed"
            as="p"
            startOnView={false}
          >
            EzDeploy enables seamless deployment of web applications directly
            from Git repositories. Built with microservices architecture for
            automatic scaling and real-time monitoring.
          </TextAnimate>
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            {" "}
            <ShimmerButton
              className="inline-flex items-center justify-center min-w-[200px] font-medium"
              shimmerColor="#ffffff"
              background="rgba(0, 0, 0, 1)"
              borderRadius="8px"
              onClick={() => router.push("/dashboard")}
            >
              <span className="text-white">Start Deploying</span>
              <ArrowRight className="w-5 h-5 ml-2 text-white" />
            </ShimmerButton>
            {/* <a
              href="#architecture"
              className="inline-flex items-center px-8 py-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:border-gray-400 hover:text-black transition-all duration-200 min-w-[200px] justify-center"
            >
              View Architecture
            </a> */}
          </div>{" "}
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-50 rounded-lg mx-auto mb-4">
                <Zap className="w-6 h-6 text-black" />
              </div>{" "}
              <div className="text-3xl font-bold text-black mb-2">
                <NumberTicker value={50} className="!text-black" />s
              </div>
              <div className="text-gray-600">Average Deploy Time</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-50 rounded-lg mx-auto mb-4">
                <Globe className="w-6 h-6 text-black" />
              </div>{" "}
              <div className="text-3xl font-bold text-black mb-2">
                <NumberTicker
                  value={99.9}
                  decimalPlaces={1}
                  className="!text-black"
                />
                %
              </div>
              <div className="text-gray-600">Uptime Guarantee</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-50 rounded-lg mx-auto mb-4">
                <Shield className="w-6 h-6 text-black" />
              </div>{" "}
              <div className="text-3xl font-bold text-black mb-2">
                <NumberTicker value={100} className="!text-black" />%
              </div>
              <div className="text-gray-600">Secure Deployments</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
