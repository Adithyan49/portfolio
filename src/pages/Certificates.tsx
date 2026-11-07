import React, { useState } from 'react';
import { Award, ExternalLink, Eye, ShieldCheck, Upload, Calendar, Video } from 'lucide-react';
import { initialCertificates, Certificate } from '../data/certificates';
import { CertificateModal } from '../components/CertificateModal';

interface CertificatesProps {
  onNavigate: (pageId: string) => void;
}

export const Certificates: React.FC<CertificatesProps> = ({ onNavigate }) => {
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  // Read certificates from localStorage if uploaded via Admin
  const savedCerts = localStorage.getItem('adithyan_custom_certificates');
  const certificatesList: Certificate[] = savedCerts
    ? JSON.parse(savedCerts)
    : initialCertificates;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 pb-28 sm:pb-24">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-2 text-xs font-mono text-[#00D4FF] mb-2 uppercase tracking-wider">
          <Award className="w-4 h-4" />
          <span>Accreditations & Verified Badges</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Certificates & <span className="text-gradient">Credentials</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl">
          Academic achievements, technical course completions, and competitive problem-solving certifications.
        </p>
      </div>

      {/* Grid of Certificates */}
      {certificatesList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificatesList.map((cert) => (
            <div
              key={cert.id}
              className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3 font-mono">
                  <span className="text-[#00D4FF]">{cert.category}</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{cert.completionDate}</span>
                  </div>
                </div>

                {/* Uploaded Certificate Photo Preview */}
                {(cert.imageUrl || cert.fileUrl) && (
                  <div className="w-full aspect-[16/10] rounded-xl overflow-hidden border border-slate-800/80 mb-4 bg-slate-950 flex items-center justify-center">
                    <img
                      src={cert.imageUrl || cert.fileUrl}
                      alt={cert.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                )}

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#A78BFA] transition-colors">
                  {cert.title}
                </h3>

                <p className="text-xs font-mono text-slate-300 mb-3">
                  {cert.issuingOrganization}
                </p>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6 line-clamp-3">
                  {cert.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedCert(cert)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00D4FF] hover:text-white transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>

                <div className="flex items-center gap-2">
                  {cert.videoUrl && (
                    <a
                      href={cert.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-purple-950/70 text-[#00D4FF] hover:text-white border border-purple-800/60 transition-colors"
                      title="Watch Walkthrough Video"
                      aria-label={`Watch video for ${cert.title}`}
                    >
                      <Video className="w-4 h-4" />
                    </a>
                  )}
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                      aria-label={`Verify ${cert.title}`}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="glass-panel rounded-2xl p-12 text-center max-w-xl mx-auto border border-slate-800 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-950/40 border border-purple-800/30 flex items-center justify-center text-[#A78BFA] mx-auto">
            <Award className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white">Certificates Archive</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Adithyan&apos;s verified collegiate certificates and technical course accreditations will be uploaded here.
          </p>
          <button
            onClick={() => onNavigate('admin')}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-[#00D4FF]" />
            <span>Manage via Admin Portal</span>
          </button>
        </div>
      )}

      {/* Certificate Viewer Modal */}
      <CertificateModal
        certificate={selectedCert}
        onClose={() => setSelectedCert(null)}
      />
    </div>
  );
};
