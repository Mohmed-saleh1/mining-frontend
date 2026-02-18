"use client";

import { useEffect, useState } from "react";
import {
  legalDocumentsApi,
  LegalDocument,
  UpdateLegalDocumentData,
  ApiError,
} from "@/app/lib/api";
import { useTranslations } from "next-intl";

// Disable static generation for admin pages
export const dynamic = 'force-dynamic';

export default function LegalDocumentsPage() {
  const t = useTranslations('admin.legalDocuments');
  const [privacyPolicy, setPrivacyPolicy] = useState<LegalDocument | null>(null);
  const [termsOfService, setTermsOfService] = useState<LegalDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<'privacy_policy' | 'terms_of_service' | null>(null);
  const [formData, setFormData] = useState({
    content: '',
    contentAr: '',
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const documents = await legalDocumentsApi.getAll();
      const privacy = documents.data.find(d => d.type === 'privacy_policy');
      const terms = documents.data.find(d => d.type === 'terms_of_service');
      setPrivacyPolicy(privacy || null);
      setTermsOfService(terms || null);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
      setError(t('errors.failedToLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (type: 'privacy_policy' | 'terms_of_service') => {
    const document = type === 'privacy_policy' ? privacyPolicy : termsOfService;
    if (document) {
      setFormData({
        content: document.content || '',
        contentAr: document.contentAr || '',
      });
      setEditingType(type);
    } else {
      // Create new document
      setFormData({
        content: '',
        contentAr: '',
      });
      setEditingType(type);
    }
  };

  const handleCancel = () => {
    setEditingType(null);
    setFormData({ content: '', contentAr: '' });
    setError(null);
  };

  const handleSave = async () => {
    if (!editingType) return;

    setError(null);
    setIsSaving(true);

    try {
      const document = editingType === 'privacy_policy' ? privacyPolicy : termsOfService;
      const updateData: UpdateLegalDocumentData = {
        content: formData.content,
        contentAr: formData.contentAr || undefined,
      };

      if (document) {
        await legalDocumentsApi.updateByType(editingType, updateData);
      } else {
        await legalDocumentsApi.create({
          type: editingType,
          content: formData.content,
          contentAr: formData.contentAr || undefined,
        });
      }

      const docType = editingType === 'privacy_policy' ? t('privacyPolicy') : t('termsOfService');
      setSuccess(t('editModal.updatedSuccessfully', { type: docType }));
      await fetchDocuments();
      handleCancel();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t('errors.errorOccurred'));
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          {(() => {
            const titleTemplate = t('title', { documents: '{documents}' });
            const parts = titleTemplate.split('{documents}');
            return parts.length > 1 ? (
              <>
                {parts[0]}
                <span className="gradient-text">{t('documentsText')}</span>
                {parts[1]}
              </>
            ) : t('title', { documents: t('documentsText') });
          })()}
        </h1>
        <p className="text-foreground-muted text-sm">
          {t('subtitle')}
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 p-4 rounded-xl bg-green/10 border border-green/30 text-green flex items-center gap-3 animate-fade-in-up">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {success}
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red/10 border border-red/30 text-red flex items-center gap-3 animate-fade-in-up">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="glass rounded-xl p-12 text-center">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground-muted">{t('loading')}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Privacy Policy */}
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">{t('privacyPolicy')}</h2>
              <button
                onClick={() => handleEdit('privacy_policy')}
                className="btn-gold px-4 py-2 rounded-lg text-sm font-semibold"
              >
                {privacyPolicy ? t('edit') : t('create')}
              </button>
            </div>
            {privacyPolicy ? (
              <div className="space-y-2">
                <p className="text-sm text-foreground-muted">
                  {t('lastUpdated')} {new Date(privacyPolicy.updatedAt).toLocaleDateString()}
                </p>
                <div className="text-sm text-foreground line-clamp-3">
                  {privacyPolicy.content.substring(0, 200)}...
                </div>
              </div>
            ) : (
              <p className="text-sm text-foreground-muted">{t('noPrivacyPolicy')}</p>
            )}
          </div>

          {/* Terms of Service */}
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">{t('termsOfService')}</h2>
              <button
                onClick={() => handleEdit('terms_of_service')}
                className="btn-gold px-4 py-2 rounded-lg text-sm font-semibold"
              >
                {termsOfService ? t('edit') : t('create')}
              </button>
            </div>
            {termsOfService ? (
              <div className="space-y-2">
                <p className="text-sm text-foreground-muted">
                  {t('lastUpdated')} {new Date(termsOfService.updatedAt).toLocaleDateString()}
                </p>
                <div className="text-sm text-foreground line-clamp-3">
                  {termsOfService.content.substring(0, 200)}...
                </div>
              </div>
            ) : (
              <p className="text-sm text-foreground-muted">{t('noTermsOfService')}</p>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCancel} />
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto glass rounded-2xl p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">
                {t('editModal.title', { type: editingType === 'privacy_policy' ? t('privacyPolicy') : t('termsOfService') })}
              </h2>
              <button
                onClick={handleCancel}
                className="p-2 rounded-lg hover:bg-gold/10 text-foreground-muted hover:text-gold transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red/10 border border-red/30 text-red text-sm">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-2">
                  {t('editModal.contentEnglish')} <span className="text-gold">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={15}
                  className="w-full input-gold px-4 py-3 rounded-xl text-sm resize-none font-mono"
                  placeholder={t('editModal.contentEnglishPlaceholder')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-2">
                  {t('editModal.contentArabic')}
                </label>
                <textarea
                  value={formData.contentAr}
                  onChange={(e) => setFormData({ ...formData, contentAr: e.target.value })}
                  rows={15}
                  className="w-full input-gold px-4 py-3 rounded-xl text-sm resize-none font-mono"
                  placeholder={t('editModal.contentArabicPlaceholder')}
                  dir="rtl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 rounded-xl text-sm font-medium text-foreground-muted hover:text-foreground transition-colors"
                >
                  {t('editModal.cancel')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !formData.content.trim()}
                  className="btn-gold px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving && (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {isSaving ? t('editModal.saving') : t('editModal.save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

