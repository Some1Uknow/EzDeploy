"use client";

import React, { forwardRef, useRef } from "react";
import { GitBranch, Cog, Upload, Globe, Database, Cloud } from "lucide-react";
import { TextAnimate } from './ui/text-animate';
import { GridPattern } from './ui/grid-pattern';
import { cn } from '@/lib/utils';

// First, let's create the AnimatedBeam component since it's not available
interface AnimatedBeamProps {
  className?: string;
  containerRef: React.RefObject<HTMLElement | null>;
  fromRef: React.RefObject<HTMLElement | null>;
  toRef: React.RefObject<HTMLElement | null>;
  curvature?: number;
  reverse?: boolean;
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  delay?: number;
  duration?: number;
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
}

const AnimatedBeam: React.FC<AnimatedBeamProps> = ({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = Math.random() * 3 + 4,
  delay = 0,
  pathColor = "gray",
  pathWidth = 2,
  pathOpacity = 0.2,
  gradientStartColor = "#ffaa40",
  gradientStopColor = "#9c40ff",
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
}) => {
  const id = React.useId();
  const [pathD, setPathD] = React.useState("");
  const [svgDimensions, setSvgDimensions] = React.useState({ width: 0, height: 0 });

  const gradientCoordinates = reverse
    ? {
        x1: ["90%", "-10%"],
        x2: ["100%", "0%"],
        y1: ["0%", "0%"],
        y2: ["0%", "0%"],
      }
    : {
        x1: ["10%", "110%"],
        x2: ["0%", "100%"],
        y1: ["0%", "0%"],
        y2: ["0%", "0%"],
      };

  React.useEffect(() => {
    const updatePath = () => {
      if (containerRef.current && fromRef.current && toRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const rectA = fromRef.current.getBoundingClientRect();
        const rectB = toRef.current.getBoundingClientRect();

        const svgWidth = containerRect.width;
        const svgHeight = containerRect.height;
        setSvgDimensions({ width: svgWidth, height: svgHeight });

        const startX =
          rectA.left - containerRect.left + rectA.width / 2 + startXOffset;
        const startY =
          rectA.top - containerRect.top + rectA.height / 2 + startYOffset;
        const endX =
          rectB.left - containerRect.left + rectB.width / 2 + endXOffset;
        const endY =
          rectB.top - containerRect.top + rectB.height / 2 + endYOffset;

        const controlY = startY - curvature;
        const d = `M ${startX},${startY} Q ${
          (startX + endX) / 2
        },${controlY} ${endX},${endY}`;
        setPathD(d);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      updatePath();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    updatePath();

    return () => {
      resizeObserver.disconnect();
    };
  }, [
    containerRef,
    fromRef,
    toRef,
    curvature,
    startXOffset,
    startYOffset,
    endXOffset,
    endYOffset,
  ]);

  return (
    <svg
      fill="none"
      width={svgDimensions.width}
      height={svgDimensions.height}
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "pointer-events-none absolute left-0 top-0 transform-gpu stroke-2",
        className,
      )}
      viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
    >
      <path
        d={pathD}
        stroke={pathColor}
        strokeWidth={pathWidth}
        strokeOpacity={pathOpacity}
        strokeLinecap="round"
      />
      <path
        d={pathD}
        strokeWidth={pathWidth}
        stroke={`url(#${id})`}
        strokeOpacity="1"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          x1="0%"
          x2="0%"
          y1="0%"
          y2="0%"
        >
          <stop stopColor={gradientStartColor} stopOpacity="0" />
          <stop stopColor={gradientStartColor} />
          <stop offset="32.5%" stopColor={gradientStopColor} />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
          <animateTransform
            attributeName="gradientTransform"
            type="translate"
            values="0,0;100,0;0,0"
            dur={`${duration}s`}
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
        </linearGradient>
      </defs>
    </svg>
  );
};

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-16 items-center justify-center rounded-full border-2 bg-white p-4 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
        className,
      )}
    >
      {children}
    </div>
  );
});

Circle.displayName = "Circle";

export default function Documentation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const step4Ref = useRef<HTMLDivElement>(null);
  const step5Ref = useRef<HTMLDivElement>(null);
  const step6Ref = useRef<HTMLDivElement>(null);

  const steps = [
    {
      ref: step1Ref,
      icon: GitBranch,
      title: "Git Repository",
      description: "Provide your GitHub repository URL",
      color: "border-orange-500 bg-orange-50",
      iconColor: "text-orange-600"
    },
    {
      ref: step2Ref,
      icon: Cloud,
      title: "API Request",
      description: "POST request to EzDeploy API server",
      color: "border-blue-500 bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      ref: step3Ref,
      icon: Cog,
      title: "ECS Task",
      description: "AWS Fargate container starts building",
      color: "border-purple-500 bg-purple-50",
      iconColor: "text-purple-600"
    },
    {
      ref: step4Ref,
      icon: Database,
      title: "Build Process",
      description: "Clone, install dependencies, and build",
      color: "border-green-500 bg-green-50",
      iconColor: "text-green-600"
    },
    {
      ref: step5Ref,
      icon: Upload,
      title: "S3 Upload",
      description: "Built files uploaded to AWS S3",
      color: "border-red-500 bg-red-50",
      iconColor: "text-red-600"
    },
    {
      ref: step6Ref,
      icon: Globe,
      title: "Live Website",
      description: "Your app is live with custom subdomain",
      color: "border-indigo-500 bg-indigo-50",
      iconColor: "text-indigo-600"
    }
  ];

  return (
    <section id="docs" className="relative py-20 bg-white overflow-hidden">
      {/* Grid Pattern Background */}
      <GridPattern
        width={40}
        height={40}
        x={-1}
        y={-1}
        className="absolute inset-0 h-full w-full fill-gray-400/20 stroke-gray-400/20 [mask-image:radial-gradient(800px_circle_at_center,white,transparent)]"
      />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <TextAnimate
            animation="blurInUp"
            by="word"
            className="text-4xl font-bold text-black mb-4"
            as="h2"
          >
            How EzDeploy Works
          </TextAnimate>
          <TextAnimate
            animation="fadeIn"
            by="word"
            delay={0.3}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            as="p"
          >
            From Git repository to live website in 6 simple steps
          </TextAnimate>
        </div>

        {/* Flow Chart */}
        <div
          className="relative flex h-[600px] w-full items-center justify-center overflow-hidden"
          ref={containerRef}
        >
          {/* Steps arranged in a flow */}
          <div className="flex size-full max-w-6xl flex-col items-stretch justify-between gap-8">
            {/* Top Row */}            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-col items-center space-y-4">
                <Circle ref={step1Ref} className={steps[0].color}>
                  {React.createElement(steps[0].icon, { className: `w-8 h-8 ${steps[0].iconColor}` })}
                </Circle>
                <div className="text-center max-w-32">
                  <h3 className="font-semibold text-sm text-black">{steps[0].title}</h3>
                  <p className="text-xs text-gray-600 mt-1">{steps[0].description}</p>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-4">
                <Circle ref={step2Ref} className={steps[1].color}>
                  {React.createElement(steps[1].icon, { className: `w-8 h-8 ${steps[1].iconColor}` })}
                </Circle>
                <div className="text-center max-w-32">
                  <h3 className="font-semibold text-sm text-black">{steps[1].title}</h3>
                  <p className="text-xs text-gray-600 mt-1">{steps[1].description}</p>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-4">
                <Circle ref={step3Ref} className={steps[2].color}>
                  {React.createElement(steps[2].icon, { className: `w-8 h-8 ${steps[2].iconColor}` })}
                </Circle>
                <div className="text-center max-w-32">
                  <h3 className="font-semibold text-sm text-black">{steps[2].title}</h3>
                  <p className="text-xs text-gray-600 mt-1">{steps[2].description}</p>
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-col items-center space-y-4">
                <Circle ref={step6Ref} className={steps[5].color}>
                  {React.createElement(steps[5].icon, { className: `w-8 h-8 ${steps[5].iconColor}` })}
                </Circle>
                <div className="text-center max-w-32">
                  <h3 className="font-semibold text-sm text-black">{steps[5].title}</h3>
                  <p className="text-xs text-gray-600 mt-1">{steps[5].description}</p>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-4">
                <Circle ref={step5Ref} className={steps[4].color}>
                  {React.createElement(steps[4].icon, { className: `w-8 h-8 ${steps[4].iconColor}` })}
                </Circle>
                <div className="text-center max-w-32">
                  <h3 className="font-semibold text-sm text-black">{steps[4].title}</h3>
                  <p className="text-xs text-gray-600 mt-1">{steps[4].description}</p>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-4">
                <Circle ref={step4Ref} className={steps[3].color}>
                  {React.createElement(steps[3].icon, { className: `w-8 h-8 ${steps[3].iconColor}` })}
                </Circle>
                <div className="text-center max-w-32">
                  <h3 className="font-semibold text-sm text-black">{steps[3].title}</h3>
                  <p className="text-xs text-gray-600 mt-1">{steps[3].description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Animated Beams */}
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={step1Ref}
            toRef={step2Ref}
            duration={3}
            delay={0}
            gradientStartColor="#f97316"
            gradientStopColor="#3b82f6"
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={step2Ref}
            toRef={step3Ref}
            duration={3}
            delay={0.5}
            gradientStartColor="#3b82f6"
            gradientStopColor="#8b5cf6"
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={step3Ref}
            toRef={step4Ref}
            duration={3}
            delay={1}
            curvature={75}
            gradientStartColor="#8b5cf6"
            gradientStopColor="#10b981"
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={step4Ref}
            toRef={step5Ref}
            duration={3}
            delay={1.5}
            gradientStartColor="#10b981"
            gradientStopColor="#ef4444"
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={step5Ref}
            toRef={step6Ref}
            duration={3}
            delay={2}
            gradientStartColor="#ef4444"
            gradientStopColor="#6366f1"
          />
        </div>

        {/* Key Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-lg mx-auto mb-4">
              <Cloud className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-semibold text-black mb-2">
              Serverless Architecture
            </h4>
            <p className="text-gray-600 text-sm">
              Built on AWS ECS Fargate for automatic scaling and zero server management.
            </p>
          </div>

          <div className="text-center p-6 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-lg mx-auto mb-4">
              <Cog className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-semibold text-black mb-2">
              Real-time Monitoring
            </h4>
            <p className="text-gray-600 text-sm">
              Watch your builds in real-time with WebSocket connections and live logs.
            </p>
          </div>

          <div className="text-center p-6 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 text-purple-600 rounded-lg mx-auto mb-4">
              <Globe className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-semibold text-black mb-2">
              Instant Deployment
            </h4>
            <p className="text-gray-600 text-sm">
              Your apps are live instantly with custom subdomains and CDN delivery.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
