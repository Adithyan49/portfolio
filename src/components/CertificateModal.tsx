import React from 'react';
import { X, ExternalLink, Download, Award, Calendar, Building2, Video, Image as ImageIcon } from 'lucide-react';
import { Certificate } from '../data/certificates';

interface CertificateModalProps {
  certificate: Certificate | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ certificate, onClose }) => {
  if (!certificate) return null;

  const displayImage = certificate.imageUrl || certificate.fileUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0D1425] border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-200 animate-in fade-in zoom-in-95 duration-200 my-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-[#00D4FF] mb-2 uppercase tracking-wider">
          <Award className="w-4 h-4" />
          <span>Verified Credential</span>
        </div>

        <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
          {certificate.title}
        </h3>

        <div className="space-y-1 text-xs text-slate-400 font-mono mb-6">
          <div className="flex items-center gap-2 text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>Issuing Authority: {certificate.issuingOrganization}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Completed / Issued: {certificate.completionDate}</span>
          </div>
        </div>

        {/* Certificate Display Preview Canvas / Actual Uploaded Photo Frame */}
        {displayImage ? (
          <div className="w-full aspect-[4/3] rounded-xl bg-black/60 border border-slate-800 overflow-hidden mb-6 flex items-center justify-center relative shadow-lg">
            <img
              src={displayImage}
              alt={certificate.title}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="w-full aspect-[4/3] rounded-xl bg-slate-900 border border-slate-800 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden mb-6">
            <div className="w-16 h-16 rounded-2xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-[#00D4FF] mb-3">
              <Award className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-white text-base max-w-sm mb-1">
              {certificate.title}
            </h4>
            <p className="text-xs text-slate-400 max-w-xs">
              {certificate.issuingOrganization}
            </p>
            <div className="mt-4 px-3 py-1 rounded bg-slate-800 text-[11px] font-mono text-emerald-300 border border-emerald-900/40">
              Document Verified on Official Record
            </div>
          </div>
        )}

        <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
          {certificate.description}
        </p>

        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {certificate.videoUrl && (
              <a
                href={certificate.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg text-white bg-purple-950/80 border border-purple-800/60 hover:bg-purple-900 transition-colors"
              >
                <Video className="w-3.5 h-3.5 text-[#00D4FF]" />
                <span>Watch Video Walkthrough</span>
              </a>
            )}

            {certificate.credentialUrl && (
              <a
                href={certificate.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg text-white bg-gradient-to-r from-[#7C5CFC] to-[#00D4FF]"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Verify on Platform</span>
              </a>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
