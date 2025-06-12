import { Github, Twitter, Linkedin, Mail, ArrowUpRight } from 'lucide-react';
import { SparklesText } from './ui/sparkles-text';
import { ShimmerButton } from './ui/shimmer-button';
import { DotPattern } from './ui/dot-pattern';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const links = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'Architecture', href: '#architecture' },
      { name: 'Documentation', href: '#docs' },
      { name: 'API Reference', href: '#api' },
    ],
    company: [
      { name: 'About', href: '#about' },
      { name: 'Blog', href: '#blog' },
      { name: 'Careers', href: '#careers' },
      { name: 'Contact', href: '#contact' },
    ],
    resources: [
      { name: 'GitHub', href: 'https://github.com', external: true },
      { name: 'Status Page', href: '#status' },
      { name: 'Support', href: '#support' },
      { name: 'Community', href: '#community' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '#privacy' },
      { name: 'Terms of Service', href: '#terms' },
      { name: 'Security', href: '#security' },
      { name: 'Compliance', href: '#compliance' },
    ],
  };

  const socialLinks = [
    { name: 'GitHub', icon: Github, href: 'https://github.com' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com' },
    { name: 'Email', icon: Mail, href: 'mailto:hello@ezdeploy.com' },
  ];
  return (
    <footer className="relative bg-black text-white overflow-hidden">
      {/* Dot Pattern Background */}
      <DotPattern
        width={24}
        height={24}
        cx={1}
        cy={1}
        cr={1}
        className="absolute inset-0 h-full w-full [mask-image:radial-gradient(600px_circle_at_center,white,transparent)] opacity-20 text-white"
      />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <SparklesText 
                className="text-3xl font-bold"
                sparklesCount={8}
                colors={{ first: "#4f46e5", second: "#7c3aed" }}
              >
                EzDeploy
              </SparklesText>
              <p className="text-gray-400 mt-4 text-lg leading-relaxed">
                Modern cloud-native deployment platform that enables seamless deployment 
                of web applications directly from Git repositories.
              </p>
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="flex items-center justify-center w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Product</h4>
            <ul className="space-y-3">
              {links.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6">Company</h4>
            <ul className="space-y-3">
              {links.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6">Resources</h4>
            <ul className="space-y-3">
              {links.resources.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center"
                    {...(link.external && {
                      target: '_blank',
                      rel: 'noopener noreferrer'
                    })}
                  >
                    {link.name}
                    {link.external && (
                      <ArrowUpRight className="w-3 h-3 ml-1" />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="py-8 border-t border-gray-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h4 className="text-xl font-semibold mb-2">Stay Updated</h4>
              <p className="text-gray-400">
                Get the latest updates on new features, performance improvements, and deployment tips.
              </p>
            </div>            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
              />
              <ShimmerButton
                className="px-6 py-3 text-black font-medium whitespace-nowrap"
                shimmerColor="#000000"
                background="rgba(255, 255, 255, 1)"
                borderRadius="8px"
              >
                Subscribe
              </ShimmerButton>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {currentYear} EzDeploy. All rights reserved.
            </div>
            <div className="flex flex-wrap gap-6">
              {links.legal.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="py-6 border-t border-gray-800">
          <div className="text-center text-gray-500 text-sm">
            <p>
              Built with ❤️ using Next.js, TypeScript, and Tailwind CSS. 
              Deployed on AWS with ECS Fargate and S3.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
