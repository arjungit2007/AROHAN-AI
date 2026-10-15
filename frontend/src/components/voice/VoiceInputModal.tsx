import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Check, X, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscriptComplete: (text: string) => void;
  initialPrompt?: string;
}

export const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  isOpen,
  onClose,
  onTranscriptComplete,
  initialPrompt = 'Speak your questions, subjects, or interests in Tamil or English...'
}) => {
  const { language, t } = useLanguage();
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
      }
    }
  }, []);

  const startListening = () => {
    setPermissionError(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language === 'ta' ? 'ta-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setPermissionError('Microphone access was denied. Please allow microphone permissions or type below.');
        } else {
          setPermissionError(`Speech recognition status: ${event.error}. You can edit or type below.`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err: any) {
      setPermissionError('Could not start microphone service. Please enter your text directly.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleSpeakTranscript = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && transcript) {
      const utterance = new SpeechSynthesisUtterance(transcript);
      utterance.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleConfirm = () => {
    if (transcript.trim()) {
      onTranscriptComplete(transcript.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Voice & Speech Interaction</h3>
              <p className="text-[11px] text-slate-500">
                Language: {language === 'ta' ? 'தமிழ் (Tamil)' : 'English (India)'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mic Pulse / Status */}
        <div className="my-6 flex flex-col items-center justify-center text-center">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200'
            }`}
            aria-label={isListening ? 'Stop listening' : 'Start listening'}
          >
            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>
          <p className="mt-3 text-xs font-semibold text-slate-700">
            {isListening ? 'Listening... Speak clearly into your microphone' : 'Tap microphone to begin speaking'}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {initialPrompt}
          </p>
        </div>

        {/* Permission / Unsupported Warning */}
        {(!isSupported || permissionError) && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-medium">
                {permissionError || 'Your browser does not support Web Speech recognition.'}
              </p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                External Bhashini API is unconfigured; please type your prompt directly into the text box below.
              </p>
            </div>
          </div>
        )}

        {/* Editable Transcript Field */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Transcription (Editable before sending)
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Your speech or typed text will appear here..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            />
            {transcript && (
              <button
                type="button"
                onClick={handleSpeakTranscript}
                className="absolute right-2 bottom-2 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs flex items-center gap-1"
                title="Listen to transcription"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span className="text-[10px]">Play</span>
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!transcript.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Check className="w-4 h-4" />
            <span>Use Text</span>
          </button>
        </div>
      </div>
    </div>
  );
};
