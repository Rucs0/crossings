import { AnimatePresence, motion } from 'framer-motion';
import type { NewReportInput } from '../../types/report';
import { ReportForm } from './ReportForm';

interface ReportModalProps {
  location: { lat: number; lng: number } | null;
  onSubmit: (input: NewReportInput) => void;
  onClose: () => void;
}

export function ReportModal({ location, onSubmit, onClose }: ReportModalProps) {
  return (
    <AnimatePresence>
      {location && (
        <motion.div
          className="fixed inset-0 z-[1100] flex items-end justify-center bg-ink-primary/40 p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-xl bg-surface p-5 shadow-xl sm:rounded-xl"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink-primary">New report</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-md p-1 text-ink-muted hover:bg-surface-sunken hover:text-ink-primary"
              >
                ✕
              </button>
            </div>
            <ReportForm lat={location.lat} lng={location.lng} onSubmit={onSubmit} onCancel={onClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
