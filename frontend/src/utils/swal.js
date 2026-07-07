import Swal from 'sweetalert2';

// Branded theme colours
const PRIMARY = '#1d4ed8';
const CONFIRM_BTN = '#1d4ed8';
const CANCEL_BTN = '#64748b';

// ─── Toast (bottom-right, auto-dismiss) ───────────────────────────────────────
const Toast = Swal.mixin({
  toast: true,
  position: 'bottom-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
});

export const toastSuccess = (message) =>
  Toast.fire({ icon: 'success', title: message });

export const toastError = (message) =>
  Toast.fire({ icon: 'error', title: message });

export const toastInfo = (message) =>
  Toast.fire({ icon: 'info', title: message });

// ─── Full modal dialogs ────────────────────────────────────────────────────────
export const alertSuccess = (title, text = '') =>
  Swal.fire({
    icon: 'success',
    title,
    text,
    confirmButtonColor: CONFIRM_BTN,
    confirmButtonText: 'OK',
    borderRadius: '1rem',
  });

export const alertError = (title, text = '') =>
  Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonColor: CONFIRM_BTN,
  });

export const alertWarning = (title, text = '') =>
  Swal.fire({
    icon: 'warning',
    title,
    text,
    confirmButtonColor: CONFIRM_BTN,
  });

// ─── Confirm dialog (returns true if confirmed) ────────────────────────────────
export const confirmDialog = async ({ title, text, confirmText = 'Yes, delete', icon = 'warning' }) => {
  const result = await Swal.fire({
    icon,
    title,
    text,
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: CANCEL_BTN,
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancel',
    reverseButtons: true,
  });
  return result.isConfirmed;
};

export default Swal;
