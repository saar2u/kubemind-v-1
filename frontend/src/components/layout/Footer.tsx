import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 py-12 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-[#00D4FF] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-xs">K</div>
              <span className="text-lg font-bold text-[#0F172A]">Kubemind</span>
            </div>
            <p className="text-[#475569] text-sm max-w-sm">
              Your autonomous cloud architect. Translating natural language into secure, scalable cloud infrastructure across AWS, Azure, and GCP.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-[#0F172A] mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-[#475569]">
              <li><a href="#" className="hover:text-[#00D4FF] transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-[#00D4FF] transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-[#00D4FF] transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-[#00D4FF] transition-colors">Changelog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[#0F172A] mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-[#475569]">
              <li><a href="#" className="hover:text-[#00D4FF] transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-[#00D4FF] transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-[#00D4FF] transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-[#00D4FF] transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">© 2026 Kubemind. Built with ❤️ for DevOps.</p>
          <div className="flex gap-4 text-sm text-slate-500">
            <a href="#" className="hover:text-[#00D4FF]">Privacy Policy</a>
            <a href="#" className="hover:text-[#00D4FF]">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
