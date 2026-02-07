"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { legalDocumentsPublicApi, LegalDocument, ApiError } from "@/app/lib/api";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

// Disable static generation for pages that use useAuth
export const dynamic = 'force-dynamic';

export default function PrivacyPolicyPage() {
  const t = useTranslations('footer');
  const locale = useLocale();
  const [document, setDocument] = useState<LegalDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setIsLoading(true);
        const response = await legalDocumentsPublicApi.getPrivacyPolicy();
        setDocument(response.data);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to load privacy policy");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, []);

  return (
    <div className="min-h-screen main-bg relative">
      <div className="starfield" />
      <div className="golden-particles" />
      
      <div className="relative z-10">
        <Navbar />
        
        <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="glass rounded-2xl p-8 md:p-12">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t('links.privacyPolicy')}
              </h1>
              
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-foreground-muted">Loading...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto mb-4 text-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h2 className="text-xl font-bold text-foreground mb-2">Error</h2>
                  <p className="text-foreground-muted">{error}</p>
                </div>
              ) : document ? (
                <div className="prose prose-invert max-w-none">
                  <div className="text-sm text-foreground-muted mb-6">
                    {locale === 'ar' ? 'آخر تحديث: ' : 'Last updated: '}
                    {new Date(document.updatedAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                  </div>
                  {locale === 'ar' ? (
                    document.contentAr ? (
                      <div 
                        className="text-foreground whitespace-pre-wrap leading-relaxed"
                        dir="rtl"
                        dangerouslySetInnerHTML={{ __html: document.contentAr.replace(/\n/g, '<br />') }}
                      />
                    ) : (
                      <div 
                        className="text-foreground whitespace-pre-wrap leading-relaxed"
                        dir="rtl"
                        dangerouslySetInnerHTML={{ __html: document.content.replace(/\n/g, '<br />') }}
                      />
                    )
                  ) : (
                    <div 
                      className="text-foreground whitespace-pre-wrap leading-relaxed"
                      dir="ltr"
                      dangerouslySetInnerHTML={{ __html: document.content.replace(/\n/g, '<br />') }}
                    />
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-foreground-muted">
                    {locale === 'ar' ? 'سياسة الخصوصية غير متاحة بعد.' : 'Privacy policy not available yet.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}
