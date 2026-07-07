import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const ConfirmContext = createContext(() => Promise.resolve(false));

// useConfirm() → confirm(options) → Promise<boolean>
// options: string message, or { title, message, confirmLabel, cancelLabel, danger }
// danger defaults to true (primary use is destructive deletes).
export function useConfirm() {
  return useContext(ConfirmContext);
}

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);

  const confirm = useCallback((options = {}) => {
    const opts = typeof options === "string" ? { message: options } : options;
    return new Promise((resolve) => {
      setDialog({
        title: opts.title || "Are you sure?",
        message: opts.message || "This action cannot be undone.",
        confirmLabel: opts.confirmLabel || "Confirm",
        cancelLabel: opts.cancelLabel || "Cancel",
        danger: opts.danger !== false,
        resolve,
      });
    });
  }, []);

  const close = (result) => {
    dialog?.resolve(result);
    setDialog(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AnimatePresence>
        {dialog && (
          <motion.div
            className="adm-modal-overlay"
            onClick={() => close(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <motion.div
              className="adm-modal"
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <h3 className="adm-modal-title">{dialog.title}</h3>
              <p className="adm-modal-message">{dialog.message}</p>
              <div className="adm-modal-actions">
                <button type="button" className="adm-btn adm-btn-ghost" onClick={() => close(false)}>
                  {dialog.cancelLabel}
                </button>
                <button
                  type="button"
                  className={`adm-btn ${dialog.danger ? "adm-btn-danger" : "adm-btn-primary"}`}
                  onClick={() => close(true)}
                  autoFocus
                >
                  {dialog.confirmLabel}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}
